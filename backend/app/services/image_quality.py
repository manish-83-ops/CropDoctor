"""CropDoctor AI — Image Quality Gate Service.

Validates uploaded images for:
1. Blur (Laplacian variance)
2. Brightness (too dark / too bright)
3. Leaf/plant presence (multi-signal: green + brown/yellow color dominance)

Returns specific failure reason and remediation advice.
Includes full diagnostic scores in every response for debugging.

Design principle: A false rejection (blocking a farmer who needs a diagnosis)
is MORE harmful than a false acceptance (a borderline photo that gets caught
by OOD/confidence handling downstream). Thresholds are tuned accordingly.
"""

import cv2
import numpy as np
import logging
from app.config import get_settings

logger = logging.getLogger("cropdoctor.quality")


def check_image_quality(image_bytes: bytes) -> dict:
    """Run optimized quality checks on an uploaded image.

    Combines HSV color ranges, Excess Green Index (EXG), and normalized Laplacian
    blur detection to ensure reliable plant leaf detection under any real-world
    lighting, resolution, background, or disease condition.

    Args:
        image_bytes: Raw image file bytes.

    Returns:
        dict with quality gate evaluation and detailed diagnostic scores.
    """
    settings = get_settings()

    # Decode image
    img_array = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return {
            "passed": False,
            "reason": "corrupt_image",
            "remediation_icon": "❌",
            "remediation_text": "Could not read this image. Please try another photo.",
            "remediation_text_hi": "यह छवि पढ़ नहीं पाए। कृपया दूसरी फोटो लें।",
            "scores": {},
        }

    h, w = img.shape[:2]
    total_pixels = h * w

    # --- 1. Normalize resolution to 512px max dimension for scale-invariant checks ---
    max_dim = 512
    scale = max_dim / float(max(h, w))
    if scale < 1.0:
        new_w, new_h = int(w * scale), int(h * scale)
        norm_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    else:
        norm_img = img

    gray_norm = cv2.cvtColor(norm_img, cv2.COLOR_BGR2GRAY)

    # --- 2. Blur detection (Laplacian variance on normalized resolution) ---
    laplacian_var = float(cv2.Laplacian(gray_norm, cv2.CV_64F).var())

    # --- 3. Brightness ---
    mean_brightness = float(gray_norm.mean())

    # --- 4. Robust Vegetation & Leaf Color Detection (HSV + EXG) ---
    hsv = cv2.cvtColor(norm_img, cv2.COLOR_BGR2HSV)

    # A. Green & Yellow-Green (healthy & pale chlorosis): Hue 15-100, S >= 10, V >= 15
    mask_green = cv2.inRange(hsv, np.array([15, 10, 15]), np.array([100, 255, 255]))

    # B. Yellow / Gold / Orange chlorosis (Cercospora, Rust, Mosaic): Hue 8-40, S >= 10, V >= 15
    mask_yellow = cv2.inRange(hsv, np.array([8, 10, 15]), np.array([40, 255, 255]))

    # C. Brown / Lesion / Necrotic spots: Hue 0-25 or 150-180, S >= 15, V >= 15
    mask_brown1 = cv2.inRange(hsv, np.array([0, 15, 15]), np.array([25, 255, 255]))
    mask_brown2 = cv2.inRange(hsv, np.array([150, 15, 15]), np.array([180, 255, 255]))
    mask_brown = cv2.bitwise_or(mask_brown1, mask_brown2)

    # D. Excess Green Index (EXG = 2G - R - B) for RGB vegetation detection
    b, g, r = cv2.split(norm_img.astype(np.float32))
    exg = 2.0 * g - r - b
    mask_exg = (exg > 5.0).astype(np.uint8) * 255

    # Combine all plant/leaf indicators (Green + Yellow + Brown + EXG)
    combined_leaf_mask = cv2.bitwise_or(
        cv2.bitwise_or(mask_green, mask_yellow),
        cv2.bitwise_or(mask_brown, mask_exg)
    )

    combined_leaf_ratio = float(combined_leaf_mask.sum()) / (255.0 * combined_leaf_mask.size)
    green_ratio = float(mask_green.sum()) / (255.0 * mask_green.size)
    yellow_ratio = float(mask_yellow.sum()) / (255.0 * mask_yellow.size)
    brown_ratio = float(mask_brown.sum()) / (255.0 * mask_brown.size)

    # --- 5. Edge density ---
    edges = cv2.Canny(gray_norm, 50, 150)
    edge_density = float(edges.sum()) / (255.0 * edges.size)

    # ── Tuned Production Thresholds ──
    blur_threshold = 3.0          # Catches only extreme, unusable motion blur
    brightness_low = 15.0         # Catches pitch-black images
    brightness_high = 245.0       # Catches pure white overexposure
    min_leaf_ratio = 0.08         # Require 8% plant tissue signal

    scores = {
        "blur": round(laplacian_var, 2),
        "blur_threshold": blur_threshold,
        "blur_passed": laplacian_var >= blur_threshold,
        "brightness": round(mean_brightness, 2),
        "brightness_low_threshold": brightness_low,
        "brightness_high_threshold": brightness_high,
        "brightness_passed": brightness_low <= mean_brightness <= brightness_high,
        "green_ratio": round(green_ratio, 4),
        "yellow_ratio": round(yellow_ratio, 4),
        "brown_ratio": round(brown_ratio, 4),
        "combined_leaf_ratio": round(combined_leaf_ratio, 4),
        "min_leaf_ratio_threshold": min_leaf_ratio,
        "leaf_passed": combined_leaf_ratio >= min_leaf_ratio,
        "edge_density": round(edge_density, 4),
        "image_size": f"{w}x{h}",
        "total_pixels": total_pixels,
    }

    logger.info(
        f"[QUALITY GATE] blur={scores['blur']} (thr={blur_threshold}), "
        f"brightness={scores['brightness']} (thr={brightness_low}-{brightness_high}), "
        f"leaf_ratio={scores['combined_leaf_ratio']} (thr={min_leaf_ratio}), "
        f"size={scores['image_size']}"
    )

    # ── Check 1: Severe Blur (only block if laplacian_var < 3.0) ──
    if laplacian_var < blur_threshold:
        logger.warning(f"[QUALITY GATE FAIL] too_blurry: blur={laplacian_var:.2f} < {blur_threshold}")
        return {
            "passed": False,
            "reason": "too_blurry",
            "remediation_icon": "📸",
            "remediation_text": "Photo is extremely blurry. Hold your phone steady and try again.",
            "remediation_text_hi": "फोटो बहुत धुंधली है। फोन स्थिर रखें और दोबारा लें।",
            "scores": scores,
        }

    # ── Check 2: Severe Dark/Bright ──
    if mean_brightness < brightness_low:
        logger.warning(f"[QUALITY GATE FAIL] too_dark: brightness={mean_brightness:.2f} < {brightness_low}")
        return {
            "passed": False,
            "reason": "too_dark",
            "remediation_icon": "☀️",
            "remediation_text": "Photo is pitch dark. Move to a illuminated area and try again.",
            "remediation_text_hi": "फोटो में बहुत अंधेरा है। रोशनी में जाकर फोटो लें।",
            "scores": scores,
        }

    if mean_brightness > brightness_high:
        logger.warning(f"[QUALITY GATE FAIL] too_bright: brightness={mean_brightness:.2f} > {brightness_high}")
        return {
            "passed": False,
            "reason": "too_bright",
            "remediation_icon": "🌑",
            "remediation_text": "Photo is completely overexposed. Move away from harsh light.",
            "remediation_text_hi": "फोटो बहुत तेज रोशनी में है। छाया में फोटो लें।",
            "scores": scores,
        }

    # ── Check 3: Leaf/Plant presence ──
    if combined_leaf_ratio < min_leaf_ratio:
        logger.warning(
            f"[QUALITY GATE FAIL] no_leaf: combined_leaf={combined_leaf_ratio:.4f} < {min_leaf_ratio}"
        )
        return {
            "passed": False,
            "reason": "no_leaf_detected",
            "remediation_icon": "🍃",
            "remediation_text": "No plant leaf detected. Center a leaf in the camera frame.",
            "remediation_text_hi": "कोई पत्ती नहीं दिखी। पत्ती को कैमरे के बीच में रखें।",
            "scores": scores,
        }

    # All checks passed
    logger.info("[QUALITY GATE PASS] All quality checks passed.")
    return {
        "passed": True,
        "reason": None,
        "remediation_icon": None,
        "remediation_text": None,
        "remediation_text_hi": None,
        "scores": scores,
    }

