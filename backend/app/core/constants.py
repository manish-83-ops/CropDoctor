"""CropDoctor AI — Application constants.

Class mappings, disease names, severity thresholds.
Single source of truth — never hardcode these elsewhere.
"""

# PlantVillage 38-class mapping (alphabetical by folder name)
# This MUST match the order used during training (sorted directory listing)
CLASS_NAMES: list[str] = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
]

NUM_CLASSES: int = len(CLASS_NAMES)

# Image preprocessing constants (must match training)
IMAGE_SIZE: tuple[int, int] = (224, 224)
IMAGE_CHANNELS: int = 3

# Severity mapping based on disease type
# green = healthy, yellow = moderate, red = severe/urgent
SEVERITY_MAP: dict[str, str] = {
    "healthy": "green",
    "Apple_scab": "yellow",
    "Black_rot": "red",
    "Cedar_apple_rust": "yellow",
    "Powdery_mildew": "yellow",
    "Cercospora_leaf_spot": "yellow",
    "Common_rust_": "yellow",
    "Northern_Leaf_Blight": "red",
    "Esca_(Black_Measles)": "red",
    "Leaf_blight_(Isariopsis_Leaf_Spot)": "red",
    "Haunglongbing_(Citrus_greening)": "red",
    "Bacterial_spot": "yellow",
    "Early_blight": "yellow",
    "Late_blight": "red",
    "Leaf_Mold": "yellow",
    "Septoria_leaf_spot": "yellow",
    "Spider_mites": "yellow",
    "Target_Spot": "yellow",
    "Tomato_Yellow_Leaf_Curl_Virus": "red",
    "Tomato_mosaic_virus": "red",
    "Leaf_scorch": "yellow",
}


def get_severity(class_name: str) -> str:
    """Get severity level (green/yellow/red) for a class name."""
    if "healthy" in class_name.lower():
        return "green"

    # Extract disease part (after the crop name)
    parts = class_name.split("___")
    if len(parts) == 2:
        disease = parts[1]
        for key, severity in SEVERITY_MAP.items():
            if key.lower() in disease.lower():
                return severity

    # Default to yellow (caution) for unknown diseases
    return "yellow"
