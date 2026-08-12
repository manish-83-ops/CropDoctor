"""CropDoctor AI — Grad-CAM Visualization Service.

Generates gradient-weighted class activation maps to explain
which parts of the image the model focused on.

When no model is available (dev mode), generates a simulated
heatmap overlay for UI development.
"""

import cv2
import numpy as np
from pathlib import Path


def generate_gradcam(
    image_bytes: bytes,
    save_path: Path,
    model=None,
    class_index: int = 0,
    layer_name: str = "top_conv",
) -> str | None:
    """Generate Grad-CAM overlay and save as PNG.

    Args:
        image_bytes: Original image bytes
        save_path: Where to save the overlay
        model: TensorFlow model (None for simulated)
        class_index: Which class to generate CAM for
        layer_name: Target convolutional layer name

    Returns:
        Saved file path as string, or None if generation failed.
    """
    try:
        # Decode original image
        img_array = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return None

        if model is not None:
            # Real Grad-CAM
            return _real_gradcam(img, model, class_index, layer_name, save_path)
        else:
            # Simulated heatmap for development
            return _simulated_gradcam(img, save_path)

    except Exception as e:
        print(f"[WARN] Grad-CAM generation failed: {e}")
        return None


def _simulated_gradcam(img: np.ndarray, save_path: Path) -> str:
    """Generate a simulated Grad-CAM heatmap for development.

    Creates a center-biased gaussian heatmap overlay.
    """
    h, w = img.shape[:2]

    # Create center-biased gaussian heatmap
    y = np.linspace(-1, 1, h)
    x = np.linspace(-1, 1, w)
    xx, yy = np.meshgrid(x, y)

    # Add some random offsets for variety
    cx = np.random.uniform(-0.3, 0.3)
    cy = np.random.uniform(-0.3, 0.3)
    sigma = np.random.uniform(0.4, 0.7)

    heatmap = np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * sigma ** 2))
    heatmap = (heatmap * 255).astype(np.uint8)

    # Apply colormap
    heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)

    # Overlay on original image
    overlay = cv2.addWeighted(img, 0.6, heatmap_colored, 0.4, 0)

    # Save
    save_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(save_path), overlay)

    return str(save_path)


def _real_gradcam(
    img: np.ndarray,
    model,
    class_index: int,
    layer_name: str,
    save_path: Path,
) -> str:
    """Generate real Grad-CAM using TensorFlow model."""
    import tensorflow as tf
    from app.core.constants import IMAGE_SIZE

    # Preprocess
    input_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    input_img = cv2.resize(input_img, IMAGE_SIZE)
    input_tensor = tf.cast(input_img, tf.float32) / 255.0
    input_tensor = tf.expand_dims(input_tensor, 0)

    # Get the target layer
    grad_model = tf.keras.models.Model(
        inputs=model.input,
        outputs=[model.get_layer(layer_name).output, model.output],
    )

    # Compute gradients
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(input_tensor)
        class_output = predictions[:, class_index]

    grads = tape.gradient(class_output, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight activation maps
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    heatmap = tf.nn.relu(heatmap)
    heatmap = heatmap / (tf.reduce_max(heatmap) + 1e-8)
    heatmap = heatmap.numpy()

    # Resize to original image size
    h, w = img.shape[:2]
    heatmap_resized = cv2.resize(heatmap, (w, h))
    heatmap_uint8 = (heatmap_resized * 255).astype(np.uint8)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Overlay
    overlay = cv2.addWeighted(img, 0.6, heatmap_colored, 0.4, 0)

    # Save
    save_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(save_path), overlay)

    return str(save_path)
