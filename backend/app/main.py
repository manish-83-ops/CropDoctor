"""CropDoctor AI — FastAPI Application Factory.

Creates and configures the FastAPI application with:
- CORS for frontend communication
- Exception handlers for custom errors
- Lifespan management for startup/shutdown
- Static file serving for uploads and generated assets
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from .api.health import router as health_router

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.core.exceptions import CropDoctorError

from app.api.predict import router as predict_router
from app.api.history import router as history_router
from app.api.chat import router as chat_router
from app.api.weather import router as weather_router
from app.api.translate import router as translate_router
from app.api.tts import router as tts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown.

    Startup: create necessary directories, load model (future milestone).
    Shutdown: cleanup resources.
    """
    settings = get_settings()

    # Ensure required directories exist
    data_dir = Path("./data")
    uploads_dir = data_dir / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    models_dir = Path(settings.model_dir)
    models_dir.mkdir(parents=True, exist_ok=True)

    print(f"[CropDoctor AI] Starting...")
    print(f"   Debug mode: {settings.debug}")
    print(f"   Model dir:  {models_dir.absolute()}")
    print(f"   Upload dir: {uploads_dir.absolute()}")

    yield

    print("[CropDoctor AI] Shutting down...")


def create_app() -> FastAPI:
    """Application factory — creates a configured FastAPI instance."""
    settings = get_settings()

    app = FastAPI(
        title="CropDoctor AI",
        description="AI-powered crop disease detection for farmers",
        version="0.1.0",
        debug=settings.debug,
        lifespan=lifespan,
    )

    # --- CORS ---
    # Allow frontend (Next.js dev server) to communicate
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            # Web dev server
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            # Capacitor Android APK (Capacitor uses these origins)
            "capacitor://localhost",
            "https://localhost",
            "http://localhost",
            # Capacitor iOS
            "ionic://localhost",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Exception Handlers ---
    @app.exception_handler(CropDoctorError)
    async def cropdoctor_error_handler(
        request: Request, exc: CropDoctorError
    ) -> JSONResponse:
        """Handle all custom CropDoctor exceptions with consistent JSON response."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.message,
                "type": type(exc).__name__,
            },
        )

    # --- Static Files ---
    # Serve uploaded images and generated Grad-CAM overlays
    uploads_path = Path("./data/uploads")
    uploads_path.mkdir(parents=True, exist_ok=True)
    app.mount(
        "/static/uploads",
        StaticFiles(directory=str(uploads_path)),
        name="uploads",
    )

    # --- Routers ---
    app.include_router(health_router)
    app.include_router(predict_router)
    app.include_router(history_router)
    app.include_router(chat_router)
    app.include_router(weather_router)
    app.include_router(translate_router)
    app.include_router(tts_router)

    return app


# Create the app instance for uvicorn
app = create_app()
