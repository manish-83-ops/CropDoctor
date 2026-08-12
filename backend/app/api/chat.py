"""CropDoctor AI — Chat API Endpoint (Groq LLM).

POST /api/chat — Contextual chat about diagnosed diseases.
Uses Groq's LLama model with safety guardrails.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    """Chat request body."""
    message: str
    disease_context: str = Field("", alias="diseaseContext")
    language: str = "en"

    model_config = {"populate_by_name": True}


class ChatResponse(BaseModel):
    """Chat response body."""
    reply: str
    language: str


@router.post("/api/chat")
async def chat(body: ChatRequest):
    """Contextual crop disease & general agricultural AI assistant powered by Groq LLM."""
    from app.config import get_settings
    settings = get_settings()

    if settings.groq_api_key and settings.groq_api_key != "your_groq_api_key_here":
        try:
            from groq import Groq
            client = Groq(api_key=settings.groq_api_key)

            if body.disease_context and body.disease_context.strip():
                system_prompt = f"""You are Kisan Mitr (किसान मित्र), an expert, warm, and friendly Indian agricultural AI assistant.
The farmer has just scanned a crop leaf.

Scanned Leaf Context:
{body.disease_context}

CRITICAL RULES:
1. The farmer does NOT need to repeat the crop or disease name. They will ask questions like "Why did this happen?", "How to cure it?", "When should I spray?", "क्या यह बीमारी दूसरे पौधों में फैलेगी?", "इलाज क्या है?".
2. Answer directly and seamlessly using the scanned leaf context.
3. Speak in simple, natural, conversational language used by Indian farmers (everyday Hindi/English). Avoid heavy, bookish dictionary words.
4. Keep responses practical, encouraging, and concise (2-4 sentences max per answer).
5. Never prescribe dangerous chemical dosages. Recommend consulting the local agriculture officer for severe cases.
6. Language requested: {"Simple Everyday Hindi" if body.language == "hi" else "Simple Everyday English"}. Response MUST be in {"Hindi" if body.language == "hi" else "English"}."""
            else:
                system_prompt = f"""You are Kisan Mitr (किसान मित्र), a warm, expert Indian agricultural AI assistant for farmers across India.
You help farmers with crop health, pest control, soil, fertilizers (NPK, urea, organic compost), weather management, irrigation, and general farming guidance.

CRITICAL RULES:
1. Speak in simple, friendly, everyday language that Indian farmers easily understand. Avoid heavy bookish words.
2. Keep answers practical, encouraging, and clear (2-4 sentences max).
3. Language requested: {"Simple Everyday Hindi" if body.language == "hi" else "Simple Everyday English"}. Response MUST be in {"Hindi" if body.language == "hi" else "English"}."""

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": body.message},
                ],
                temperature=0.7,
                max_tokens=350,
            )

            reply = completion.choices[0].message.content
            return ChatResponse(reply=reply or "नमस्ते किसान भाई, कृपया दोबारा पूछें।", language=body.language)

        except Exception as e:
            print(f"[WARN] Groq API error: {e}")

    # Fallback response if Groq fails
    if body.language == "hi":
        reply = "नमस्ते किसान भाई! नेटवर्क में कुछ समस्या आ रही है। कृपया थोड़ी देर बाद दोबारा पूछें या स्थानीय कृषि केंद्र से सलाह लें।"
    else:
        reply = "Hello farmer! Having trouble connecting to AI. Please try again in a moment or consult your local agriculture officer."

    return ChatResponse(reply=reply, language=body.language)

