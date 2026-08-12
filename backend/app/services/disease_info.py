"""CropDoctor AI — Disease Knowledge Base Lookup Service.

Loads disease information from diseases.json and provides
lookup by PlantVillage class name.
"""

import json
from pathlib import Path
from functools import lru_cache


KNOWLEDGE_PATH = Path(__file__).parent.parent.parent / "knowledge" / "diseases.json"


@lru_cache(maxsize=1)
def _load_disease_db() -> dict:
    """Load and cache the disease knowledge base."""
    if not KNOWLEDGE_PATH.exists():
        print(f"[WARN] Disease knowledge base not found at {KNOWLEDGE_PATH}")
        return {}

    with open(KNOWLEDGE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_disease_info(class_name: str) -> dict | None:
    """Look up disease info by PlantVillage class name and enrich with cause, stage, and prevention guidance.

    Args:
        class_name: Full class name like "Tomato___Early_blight"

    Returns:
        Disease info dict or None if not found.
    """
    db = _load_disease_db()
    info = db.get(class_name)
    if not info:
        return None

    info = dict(info)
    cls_lower = class_name.lower()

    if "healthy" in cls_lower:
        info["cause"] = "Optimal soil nutrition, proper irrigation, and healthy growing conditions."
        info["causeHi"] = "उत्तम मृदा पोषण, सही समय पर सिंचाई और अनुकूल वातावरण।"
        info["stage"] = "Healthy State — No disease detected."
        info["stageHi"] = "स्वस्थ स्थिति — फसल में कोई बीमारी नहीं है।"
        info["preventable"] = True
        info["preventionTip"] = "Maintain regular weeding, balanced NPK fertilization, and weekly leaf inspection."
        info["preventionTipHi"] = "नियमित निराई-गुड़ाई करें, संतुलित खाद दें और हर हफ्ते पत्तियों की जांच करें।"
    elif any(v in cls_lower for v in ["virus", "curl", "greening", "haunglongbing", "mosaic"]):
        info["cause"] = "Transmitted by sap-sucking insects (whiteflies, aphids, or psyllid vectors)."
        info["causeHi"] = "सफेद मक्खी, माहू (चेपा) या अन्य रस चूसक कीड़ों द्वारा वायरस फैलता है।"
        info["stage"] = "Active Infection Stage — Isolate infected plants to save nearby crops."
        info["stageHi"] = "सक्रिय संक्रमण चरण — स्वस्थ पौधों को बचाने के लिए प्रभावित पौधे हटाएं।"
        info["preventable"] = True
        info["preventionTip"] = "Control insect vectors using yellow sticky traps and organic neem oil spray."
        info["preventionTipHi"] = "सफेद मक्खियों को रोकने के लिए पीले स्टिकी ट्रैप और नीम तेल का छिड़काव करें।"
    else:
        # Fungal / Bacterial spots, blights, rot, scab, scorch, rust
        info["cause"] = "High atmospheric humidity, surface moisture on leaves, and fungal/bacterial spores."
        info["causeHi"] = "हवा में नमी (आर्द्रता), पत्तियों पर पानी का जमाव और फफूंद/जीवाणु बीजाणु।"
        info["stage"] = "Early to Moderate Stage — Highly preventable if treated within 3–5 days."
        info["stageHi"] = "शुरुआती से मध्यम चरण — अगले 3-5 दिनों में सही इलाज से पूरी रोकथाम संभव।"
        info["preventable"] = True
        info["preventionTip"] = "Avoid overhead watering, practice 2-year crop rotation, and clear crop residue after harvest."
        info["preventionTipHi"] = "पत्तियों पर ऊपर से पानी न डालें, फसल चक्र अपनाएं और कटाई के बाद खेत साफ रखें।"

    return info


def get_all_diseases() -> dict:
    """Return the entire disease knowledge base."""
    return _load_disease_db()

