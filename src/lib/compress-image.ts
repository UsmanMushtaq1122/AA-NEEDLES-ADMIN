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
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    maxFileSize = 700 * 1024,
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
    let lastSize = Number.POSITIVE_INFINITY

    while (attempt < 80) {
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
        // Continue reducing dimensions until the gateway limit is met. The
        // lower bound prevents an invalid zero-sized canvas for pathological
        // source files while allowing small but valid final uploads.
        const nextWidth = Math.max(64, Math.round(width * 0.8))
        const nextHeight = Math.max(64, Math.round(height * 0.8))
        if (nextWidth === width && nextHeight === height && blob && blob.size >= lastSize) {
          break
        }
        width = nextWidth
        height = nextHeight
      }
      if (blob) lastSize = blob.size
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
