"""CropDoctor AI — Out-of-Distribution (OOD) Detection.

Detects when the model is uncertain about its prediction,
indicating the image may not be from the training distribution.

Two signals:
1. Maximum softmax probability < threshold → model not confident
2. Prediction entropy > threshold → model confused across classes

If either triggers, we return "Unknown Disease" instead of hallucinating.
"""

import numpy as np
from app.config import get_settings


def detect_ood(probs: np.ndarray) -> dict:
    """Check if a prediction is out-of-distribution.

    Args:
        probs: Array of class probabilities (shape: [num_classes])

    Returns:
        dict with:
            is_unknown: bool — whether this is OOD
            max_prob: float — maximum softmax probability
            entropy: float — prediction entropy
            reason: str | None — why it was flagged
    """
    settings = get_settings()

    max_prob = float(np.max(probs))
    entropy = float(-np.sum(probs * np.log(probs + 1e-10)))

    is_unknown = False
    reason = None

    if max_prob < settings.ood_confidence_threshold:
        is_unknown = True
        reason = "low_confidence"

    if entropy > settings.ood_entropy_threshold:
        is_unknown = True
        reason = "high_entropy" if reason is None else "low_confidence_and_high_entropy"

    return {
        "is_unknown": is_unknown,
        "max_prob": round(max_prob, 4),
        "entropy": round(entropy, 4),
        "reason": reason,
    }
