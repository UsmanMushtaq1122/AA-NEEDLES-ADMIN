export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    maxFileSize?: number
  } = {}
): Promise<File> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 0.82,
    maxFileSize = 4 * 1024 * 1024,
  } = options

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.")
  }

  const image = new Image()
  const objectUrl = URL.createObjectURL(file)

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error("Unable to read image file."))
      image.src = objectUrl
    })

    if (file.size <= maxFileSize && image.width <= maxWidth && image.height <= maxHeight) {
      return file
    }

    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height)
    let width = Math.max(1, Math.round(image.width * scale))
    let height = Math.max(1, Math.round(image.height * scale))
    let blob: Blob | null = null
    // WebP supports alpha and gives canvas.toBlob a usable quality setting for
    // both PNG and photographic source files.
    const outputType = "image/webp"
    const qualitySteps = [
      Math.min(0.96, Math.max(0.9, quality)),
      0.86,
      0.82,
      0.78,
      0.74,
      0.7,
      0.66,
    ]
    let currentQuality = qualitySteps[0]
    let attempt = 0

    while (attempt < 35) {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("Image processing is not supported in this browser.")
      }

      context.drawImage(image, 0, 0, width, height)
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputType, currentQuality)
      })

      if (blob && blob.size <= maxFileSize) break

      const qualityIndex = attempt % qualitySteps.length
      if (qualityIndex < qualitySteps.length - 1) {
        currentQuality = qualitySteps[qualityIndex + 1]
      } else {
        width = Math.max(320, Math.round(width * 0.85))
        height = Math.max(320, Math.round(height * 0.85))
      }
      attempt += 1
    }

    if (!blob) throw new Error("Unable to compress image.")
    if (blob.size > maxFileSize) {
      throw new Error("Image could not be compressed below the upload size limit.")
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}.webp`,
      { type: outputType }
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
