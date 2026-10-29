const MAX_VIDEO_WIDTH = 1280;
const VIDEO_BITRATE = 2_000_000;

const getSupportedMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
};

export async function compressVideo(file: File): Promise<File> {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    throw new Error("This browser does not support video compression.");
  }

  const mimeType = getSupportedMimeType();
  if (!mimeType) {
    throw new Error("This browser does not support the required video format.");
  }

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Unable to read the selected video."));
    });

    const scale = Math.min(1, MAX_VIDEO_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(2, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare video compression.");

    const canvasStream = canvas.captureStream(30);
    const sourceStream = (
      video as HTMLVideoElement & { captureStream: () => MediaStream }
    ).captureStream();
    sourceStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: VIDEO_BITRATE,
    });
    const chunks: Blob[] = [];

    const recording = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => reject(new Error("Video compression failed."));
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        window.requestAnimationFrame(drawFrame);
      }
    };

    video.onended = () => recorder.stop();
    await video.play();
    recorder.start(250);
    drawFrame();

    const blob = await recording;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webm`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } finally {
    video.pause();
    video.removeAttribute("src");
    URL.revokeObjectURL(sourceUrl);
  }
}
