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
    const outputType = file.type === "image/png" ? "image/png" : "image/webp"
    const qualitySteps = [Math.max(0.96, quality), 0.93, 0.9, 0.87, 0.84]
    let currentQuality = qualitySteps[0]

    for (let attempt = 0; attempt < qualitySteps.length + 3; attempt += 1) {
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
      if (attempt < qualitySteps.length - 1) {
        currentQuality = qualitySteps[attempt + 1]
      } else {
        width = Math.max(1, Math.round(width * 0.9))
        height = Math.max(1, Math.round(height * 0.9))
      }
    }

    if (!blob) throw new Error("Unable to compress image.")
    if (blob.size > maxFileSize) {
      throw new Error("Image could not be compressed below the upload size limit.")
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}.${outputType === "image/png" ? "png" : "webp"}`,
      { type: outputType }
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
