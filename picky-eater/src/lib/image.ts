"use client";

// Phone photos are often 4000px+ and 5 MB+. We shrink them in the browser before
// uploading: faster on slow restaurant Wi-Fi, cheaper, and still sharp enough to read.
const MAX_SIDE = 1600;
const QUALITY = 0.85;

export type PreparedImage = {
  base64: string; // no "data:" prefix
  mediaType: "image/jpeg";
  previewUrl: string; // data URL for <img>
  /** Low-resolution original: small menu text may be unreadable. Shown as a soft hint. */
  small: boolean;
};

const SMALL_SIDE = 800;

export class ImageError extends Error {}

export async function prepareImage(file: Blob): Promise<PreparedImage> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new ImageError("That file isn't a photo. Please choose a picture of the menu.");
  }

  let bitmap: ImageBitmap;
  try {
    // "from-image" respects the phone's rotation info, so menus aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("We can't open this photo type. Try a JPG or PNG, or take a new photo.");
  }

  const longSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_SIDE / longSide);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("Your browser couldn't process the photo.");
  ctx.fillStyle = "#fff"; // transparent PNGs → white background, not black
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return {
    base64: dataUrl.slice(dataUrl.indexOf(",") + 1),
    mediaType: "image/jpeg",
    previewUrl: dataUrl,
    small: longSide < SMALL_SIDE,
  };
}
