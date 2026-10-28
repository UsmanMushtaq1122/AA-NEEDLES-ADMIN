export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  } = {}
): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options

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

    const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height)
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Image processing is not supported in this browser.")

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality)
    })

    if (!blob) throw new Error("Unable to compress image.")

    return new File(
      [blob],
      `${file.name.replace(/\.[^.]+$/, "")}.jpg`,
      { type: "image/jpeg" }
    )
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
