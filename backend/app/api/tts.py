"""CropDoctor AI — Text-to-Speech (TTS) API Endpoint.

POST /api/tts — Converts Hindi/English text into clear Indian voice audio
using Sarvam AI Bulbul v2 model with fallback support.
"""

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.config import get_settings

router = APIRouter(tags=["tts"])


class TTSRequest(BaseModel):
    text: str
    language: str = "hi"
    speaker: str = "anushka"  # anushka (female) or karun / hitesh (male)


class TTSResponse(BaseModel):
    audio_base64: str | None
    format: str = "mp3"
    success: bool
    speaker: str


@router.post("/api/tts")
async def generate_speech(body: TTSRequest):
    """Generate Indian accent speech audio from text using Sarvam AI Bulbul v2."""
    settings = get_settings()

    if not body.text.strip():
        return JSONResponse(status_code=400, content={"error": "Text is empty"})

    if settings.sarvam_api_key and settings.sarvam_api_key != "your_sarvam_api_key_here":
        try:
            target_lang = "hi-IN" if body.language == "hi" else "en-IN"
            speaker = body.speaker if body.speaker in ["anushka", "karun", "hitesh", "vidya", "arya", "manisha"] else "anushka"

            headers = {
                "api-subscription-key": settings.sarvam_api_key,
                "Content-Type": "application/json",
            }

            payload = {
                "inputs": [body.text[:500]],  # Truncate to reasonable speech chunk
                "target_language_code": target_lang,
                "speaker": speaker,
                "model": "bulbul:v2",
                "pitch": 0,
                "pace": 1.0,
                "loudness": 1.5,
                "speech_sample_rate": 22050,
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.sarvam.ai/text-to-speech",
                    headers=headers,
                    json=payload,
                )

                if res.status_code == 200:
                    data = res.json()
                    audios = data.get("audios", [])
                    if audios and len(audios) > 0:
                        return TTSResponse(
                            audio_base64=f"data:audio/wav;base64,{audios[0]}",
                            format="wav",
                            success=True,
                            speaker=speaker,
                        )
                else:
                    print(f"[WARN] Sarvam TTS API returned status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[WARN] Sarvam TTS API exception: {e}")

    # Fallback response if Sarvam AI key unavailable or error
    return TTSResponse(
        audio_base64=None,
        format="none",
        success=False,
        speaker=body.speaker,
    )
