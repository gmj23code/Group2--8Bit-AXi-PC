"use client";

// Phone photos are often 4000px+ and 5 MB+. We shrink them in the browser before
// uploading: faster on slow restaurant Wi-Fi, cheaper, comfortably under hosting upload
// limits, and still sharp enough for small menu print.
const MAX_SIDE = 2000;
const QUALITY = 0.85;
const SMALL_SIDE = 800;

export type PreparedImage = {
  blob: Blob; // JPEG, ready to upload
  previewUrl: string; // data URL for <img>
  /** Low-resolution original: small menu text may be unreadable. Shown as a soft hint. */
  small: boolean;
};

export class InputError extends Error {}

const isHeic = (file: Blob & { name?: string }) =>
  /hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name ?? "");

export async function prepareImage(file: Blob & { name?: string }): Promise<PreparedImage> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new InputError("That file isn't a photo or a PDF. Please choose a picture or PDF of the menu.");
  }

  let bitmap: ImageBitmap;
  try {
    // "from-image" respects the phone's rotation info, so menus aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new InputError(
      isHeic(file)
        ? "This browser can't open iPhone HEIC photos. Use Take a photo instead, or on your iPhone go to Settings › Camera › Formats › Most Compatible."
        : "We can't open this photo type. Try a JPG or PNG, or take a new photo.",
    );
  }

  const longSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_SIDE / longSide);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new InputError("Your browser couldn't process the photo.");
  ctx.fillStyle = "#fff"; // transparent PNGs → white background, not black
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  if (!blob) throw new InputError("Your browser couldn't process the photo.");
  return { blob, previewUrl: canvas.toDataURL("image/jpeg", 0.6), small: longSide < SMALL_SIDE };
}
