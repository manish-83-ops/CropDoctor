/**
 * CropDoctor AI — Client-side image utilities.
 *
 * Compression, validation, and canvas-based quality pre-checks.
 */

import { MAX_UPLOAD_SIZE_MB, ALLOWED_IMAGE_TYPES } from "./constants";

/**
 * Validate a file before upload.
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a JPEG, PNG, or WebP image.",
    };
  }

  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    return {
      valid: false,
      error: `Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: ${MAX_UPLOAD_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Compress an image to target size using canvas.
 * Returns a Blob (JPEG format).
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1024,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Draw to canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Create an object URL for preview.
 */
export function createPreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Convert a canvas to a Blob.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to Blob conversion failed"));
      },
      type,
      quality
    );
  });
}
