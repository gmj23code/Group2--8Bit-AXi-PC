"use client";

import { InputError, prepareImage } from "./image";
import { LIMITS, formatMB } from "./limits";

// Turns whatever the user picked (one PDF, or one or more photos) into a list of
// pages, each small enough to upload on its own. One page = one upload = one AI call.

export type ScanPage = {
  id: string;
  kind: "pdf" | "image";
  blob: Blob;
  /** Thumbnail (photos only; we don't render PDF pages in the browser). */
  previewUrl?: string;
  small?: boolean;
};

/** What the user picked: a PDF (with its name) or a list of photos. */
export type ScanSelection =
  | { kind: "pdf"; fileName: string; pages: ScanPage[] }
  | { kind: "photos"; pages: ScanPage[] }
  | null;

const isPdf = (f: File) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);
let counter = 0;
const nextId = () => `p${Date.now().toString(36)}-${counter++}`;

/** Splits a PDF into single-page PDFs. pdf-lib is loaded only when a PDF is actually picked. */
async function splitPdf(file: File): Promise<ScanPage[]> {
  if (file.size > LIMITS.maxPdfBytes) {
    throw new InputError(`This PDF is ${formatMB(file.size)}. Please use one under ${formatMB(LIMITS.maxPdfBytes)}.`);
  }
  const { PDFDocument, EncryptedPDFError } = await import("pdf-lib");
  let source;
  try {
    source = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
  } catch (err) {
    throw new InputError(
      err instanceof EncryptedPDFError
        ? "This PDF is password-protected. Save an unlocked copy, or take photos of the menu."
        : "We couldn't open this PDF. It may be damaged. Try downloading it again.",
    );
  }
  const count = source.getPageCount();
  if (count === 0) throw new InputError("This PDF has no pages.");
  if (count > LIMITS.maxPdfPages) {
    throw new InputError(`This PDF has ${count} pages. Menus can have up to ${LIMITS.maxPdfPages}; try just the food pages.`);
  }

  const pages: ScanPage[] = [];
  for (let i = 0; i < count; i++) {
    const single = await PDFDocument.create();
    const [copied] = await single.copyPages(source, [i]);
    single.addPage(copied);
    const bytes = await single.save();
    if (bytes.byteLength > LIMITS.maxUploadBytes) {
      throw new InputError(
        `Page ${i + 1} of this PDF is ${formatMB(bytes.byteLength)}, too big to upload (limit ${formatMB(LIMITS.maxUploadBytes)} per page). Try taking photos of the menu instead.`,
      );
    }
    pages.push({ id: nextId(), kind: "pdf", blob: new Blob([bytes as BlobPart], { type: "application/pdf" }) });
  }
  return pages;
}

/**
 * Adds newly picked files to the current selection:
 * - a PDF replaces whatever was picked before (one PDF at a time)
 * - photos are added to existing photos (up to the photo limit)
 */
export async function addFiles(current: ScanSelection, files: File[]): Promise<ScanSelection> {
  if (files.length === 0) return current;
  const pdfs = files.filter(isPdf);
  if (pdfs.length > 0) {
    if (files.length > 1) throw new InputError("Please choose one PDF, or photos, but not both at once.");
    return { kind: "pdf", fileName: pdfs[0].name, pages: await splitPdf(pdfs[0]) };
  }

  const existing = current?.kind === "photos" ? current.pages : [];
  if (existing.length + files.length > LIMITS.maxPhotos) {
    throw new InputError(`You can add up to ${LIMITS.maxPhotos} photos per scan.`);
  }
  const added: ScanPage[] = [];
  for (const file of files) {
    if (file.size > LIMITS.maxPhotoInputBytes) {
      throw new InputError(`That photo is ${formatMB(file.size)}. Please use one under ${formatMB(LIMITS.maxPhotoInputBytes)}.`);
    }
    const img = await prepareImage(file);
    added.push({ id: nextId(), kind: "image", blob: img.blob, previewUrl: img.previewUrl, small: img.small });
  }
  return { kind: "photos", pages: [...existing, ...added] };
}

export { InputError };
