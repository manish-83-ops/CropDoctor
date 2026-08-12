"""CropDoctor AI — Upload security utilities.

Validates file types, sizes, and sanitizes filenames.
Defense-in-depth: never trust the client.
"""

import re
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import get_settings
from app.core.exceptions import InvalidUploadError


def validate_upload(file: UploadFile) -> None:
    """Validate an uploaded file for type and size.

    Handles standard file uploads as well as frontend Blob uploads (e.g. filename='blob').
    Raises InvalidUploadError if validation fails.
    """
    settings = get_settings()

    allowed_content_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
        "application/octet-stream",  # Canvas blobs sometimes upload as octet-stream
    }

    # If content_type is available and invalid, raise error
    if file.content_type and file.content_type not in allowed_content_types:
        raise InvalidUploadError(
            f"Content type '{file.content_type}' is not allowed. "
            "Please upload a JPEG, PNG, or WebP image."
        )

    # Check file extension only if filename has an explicit extension (suffix != '')
    if file.filename:
        ext = Path(file.filename).suffix.lower()
        # Only validate extension if extension actually exists (not empty like 'blob')
        if ext and ext not in settings.allowed_extensions_list:
            raise InvalidUploadError(
                f"File extension '{ext}' is not allowed. "
                f"Please upload: {', '.join(settings.allowed_extensions_list)}"
            )


async def validate_upload_size(file: UploadFile) -> bytes:
    """Read and validate file size. Returns file bytes if valid.

    Reads the file into memory (bounded by max size) to avoid
    writing oversized files to disk.
    """
    settings = get_settings()
    max_bytes = settings.max_upload_size_bytes

    contents = await file.read()
    if len(contents) > max_bytes:
        raise InvalidUploadError(
            f"File too large ({len(contents) / 1024 / 1024:.1f} MB). "
            f"Maximum allowed: {settings.max_upload_size_mb} MB."
        )

    return contents


def sanitize_filename(original_filename: str | None) -> str:
    """Generate a safe filename from an upload.

    Uses UUID to prevent collisions and path traversal.
    Preserves original extension for convenience.
    """
    ext = ".jpg"
    if original_filename:
        parsed_ext = Path(original_filename).suffix.lower()
        if parsed_ext:
            ext = parsed_ext

    # Remove any non-alphanumeric characters from the stem
    safe_stem = re.sub(r"[^a-zA-Z0-9]", "_", Path(original_filename or "upload").stem)
    # Truncate to reasonable length
    safe_stem = safe_stem[:50]

    return f"{safe_stem}_{uuid.uuid4().hex[:8]}{ext}"
