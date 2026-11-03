import { compressImage } from "./compress-image"

export const MAX_IMAGE_FILE_SIZE = 4 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Unsupported image format. Use JPG, PNG, WebP, GIF, or AVIF."
  }
  if (file.size > 10 * 1024 * 1024) {
    return "The selected image is larger than the 10MB source-file limit."
  }
  return null
}

export async function prepareImageUpload(
  file: File,
  options: { maxWidth?: number; maxHeight?: number } = {},
): Promise<File> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  return compressImage(file, {
    maxWidth: options.maxWidth ?? 2400,
    maxHeight: options.maxHeight ?? 2400,
    maxFileSize: MAX_IMAGE_FILE_SIZE,
    quality: 0.84,
  })
}
