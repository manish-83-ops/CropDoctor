"""Test script for the image quality gate.

Creates synthetic test images covering all four test scenarios:
1. Good close-up leaf (full-frame, no border) — MUST PASS
2. Genuinely blurry photo — MUST REJECT
3. Genuinely dark photo — MUST REJECT
4. Non-leaf object (solid blue) — MUST REJECT

Reports all diagnostic scores for each case.
"""

import sys
import cv2
import numpy as np

# Add project root to path
sys.path.insert(0, ".")
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.services.image_quality import check_image_quality


def make_test_image(scenario: str) -> bytes:
    """Generate a synthetic test image for each scenario."""

    if scenario == "good_leaf_closeup":
        # Full-frame green leaf with brown lesions — no visible border
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        # Fill entire frame with green (leaf tissue)
        img[:, :] = (30, 120, 50)  # BGR: dark green
        # Add lighter green variation (natural leaf texture)
        for y in range(0, 480, 20):
            for x in range(0, 640, 20):
                jitter = np.random.randint(-15, 15, 3).astype(np.int16)
                color = np.clip(np.array([30, 120, 50], dtype=np.int16) + jitter, 0, 255).astype(np.uint8)
                cv2.rectangle(img, (x, y), (x + 20, y + 20), color.tolist(), -1)
        # Add brown disease lesions (scattered)
        for _ in range(15):
            cx, cy = np.random.randint(50, 590), np.random.randint(50, 430)
            r = np.random.randint(10, 35)
            cv2.circle(img, (cx, cy), r, (20, 60, 130), -1)  # BGR brown
        # Add leaf veins (sharp lines = high Laplacian variance)
        for i in range(5):
            y_start = 50 + i * 80
            cv2.line(img, (0, y_start), (640, y_start + 40), (25, 100, 40), 2)
        # Add some edge texture to boost sharpness score
        cv2.rectangle(img, (10, 10), (630, 470), (20, 90, 35), 2)

    elif scenario == "blurry":
        # Start with a reasonable leaf image then blur it heavily
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:, :] = (30, 120, 50)
        for _ in range(10):
            cx, cy = np.random.randint(50, 590), np.random.randint(50, 430)
            cv2.circle(img, (cx, cy), 30, (20, 60, 130), -1)
        # Apply extreme Gaussian blur
        img = cv2.GaussianBlur(img, (51, 51), 25)

    elif scenario == "dark":
        # Very dark image — barely visible
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:, :] = (8, 12, 6)  # Very dark

    elif scenario == "non_leaf":
        # Solid blue/grey — no plant-like colors at all
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img[:, :] = (200, 120, 50)  # BGR: blue-ish
        # Add some geometric shapes (not leaf-like)
        cv2.rectangle(img, (100, 100), (540, 380), (180, 100, 40), -1)
        cv2.circle(img, (320, 240), 80, (220, 150, 70), -1)

    else:
        raise ValueError(f"Unknown scenario: {scenario}")

    _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return buffer.tobytes()


def main():
    scenarios = [
        ("good_leaf_closeup", True, "Good close-up leaf (full frame, no border)"),
        ("blurry", False, "Genuinely blurry photo"),
        ("dark", False, "Genuinely dark photo"),
        ("non_leaf", False, "Non-leaf object (blue/grey)"),
    ]

    print("=" * 80)
    print("IMAGE QUALITY GATE — DIAGNOSTIC TEST REPORT")
    print("=" * 80)

    all_passed = True

    for scenario_id, expected_pass, description in scenarios:
        print(f"\n{'─' * 70}")
        print(f"TEST: {description}")
        print(f"Expected: {'PASS ✅' if expected_pass else 'REJECT ❌'}")
        print(f"{'─' * 70}")

        image_bytes = make_test_image(scenario_id)
        result = check_image_quality(image_bytes)

        actual_pass = result["passed"]
        verdict = "PASS ✅" if actual_pass else f"REJECT ❌ ({result['reason']})"
        match = actual_pass == expected_pass

        print(f"Result:   {verdict}")
        print(f"Match:    {'✅ CORRECT' if match else '❌ MISMATCH!'}")
        print(f"\nDiagnostic Scores:")

        scores = result.get("scores", {})
        for key, val in scores.items():
            print(f"  {key:30s} = {val}")

        if not match:
            all_passed = False
            print(f"\n  ⚠️  UNEXPECTED RESULT — expected {'pass' if expected_pass else 'reject'}, got {'pass' if actual_pass else 'reject'}")

    print(f"\n{'=' * 80}")
    print(f"OVERALL: {'ALL TESTS CORRECT ✅' if all_passed else 'SOME TESTS FAILED ❌'}")
    print(f"{'=' * 80}")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
