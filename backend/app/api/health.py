"""CropDoctor AI — Health check endpoint.

Simple liveness + readiness probe.
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Basic health check — returns 200 if the server is alive."""
    return {
        "status": "ok",
        "service": "cropdoctor-ai",
        "version": "0.1.0",
    }
