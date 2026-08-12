"""CropDoctor AI — Translation API Endpoint (Sarvam AI).

POST /api/translate — Translate text between English and Hindi using Sarvam AI.
Includes in-memory caching to minimize API calls.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx

from app.config import get_settings

router = APIRouter(tags=["translate"])

# In-memory translation cache
_translation_cache: dict[str, str] = {}


class TranslateRequest(BaseModel):
    """Translation request body."""
    text: str
    target_language: str = Field("hi", alias="targetLanguage")

    model_config = {"populate_by_name": True}


class TranslateResponse(BaseModel):
    """Translation response body."""
    translated_text: str = Field(..., alias="translatedText")
    source_language: str = Field("en", alias="sourceLanguage")
    target_language: str = Field("hi", alias="targetLanguage")
    cached: bool = False

    model_config = {"populate_by_name": True}


@router.post("/api/translate", response_model=TranslateResponse)
async def translate_text(body: TranslateRequest):
    """Translate text to target language using Sarvam AI API."""
    settings = get_settings()

    if not body.text.strip():
        return TranslateResponse(
            translatedText="",
            sourceLanguage="en",
            targetLanguage=body.target_language,
            cached=True,
        )

    cache_key = f"{body.target_language}:{body.text.strip()}"
    if cache_key in _translation_cache:
        return TranslateResponse(
            translatedText=_translation_cache[cache_key],
            sourceLanguage="en",
            targetLanguage=body.target_language,
            cached=True,
        )

    if settings.sarvam_api_key and settings.sarvam_api_key != "your_sarvam_api_key_here":
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.sarvam.ai/translate",
                    headers={"api-subscription-key": settings.sarvam_api_key},
                    json={
                        "input": body.text,
                        "source_language_code": "en-IN",
                        "target_language_code": "hi-IN" if body.target_language == "hi" else "en-IN",
                        "speaker_gender": "Female",
                        "mode": "formal",
                        "model": "mayura:v1",
                    },
                    timeout=10,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    translated = data.get("translated_text", body.text)
                    _translation_cache[cache_key] = translated
                    return TranslateResponse(
                        translatedText=translated,
                        sourceLanguage="en",
                        targetLanguage=body.target_language,
                        cached=False,
                    )
        except Exception as e:
            print(f"[WARN] Sarvam translation error: {e}")

    # Fallback when Sarvam API is not available or fails
    fallback_text = body.text  # Return original as fallback
    return TranslateResponse(
        translatedText=fallback_text,
        sourceLanguage="en",
        targetLanguage=body.target_language,
        cached=False,
    )
