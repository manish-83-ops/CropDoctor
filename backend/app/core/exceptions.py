"""CropDoctor AI — Custom exception hierarchy.

Consistent error handling across the application.
Each exception maps to a specific HTTP status code and user-facing message.
"""


class CropDoctorError(Exception):
    """Base exception for all CropDoctor errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ImageQualityError(CropDoctorError):
    """Raised when uploaded image fails quality checks."""

    def __init__(self, reason: str, remediation_icon: str, remediation_text: str):
        self.reason = reason
        self.remediation_icon = remediation_icon
        self.remediation_text = remediation_text
        super().__init__(
            message=f"Image quality check failed: {reason}",
            status_code=422,
        )


class InvalidUploadError(CropDoctorError):
    """Raised when upload validation fails (wrong type, too large, etc.)."""

    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)


class ModelNotLoadedError(CropDoctorError):
    """Raised when inference is attempted but model is not available."""

    def __init__(self):
        super().__init__(
            message="Model is not loaded. Please ensure model artifacts are in the models/ directory.",
            status_code=503,
        )


class ExternalServiceError(CropDoctorError):
    """Raised when an external API (Groq, Sarvam, OpenWeather) fails."""

    def __init__(self, service_name: str, detail: str = ""):
        super().__init__(
            message=f"External service '{service_name}' is unavailable. {detail}".strip(),
            status_code=502,
        )
