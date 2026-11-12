import "server-only";

import { EncryptedPDFError, PDFDocument } from "pdf-lib";
import type { FileKind } from "../schema";
import { AnalyzeFailure } from "./analyze-menu";

/**
 * Identifies a file by its first bytes ("magic numbers"), never by its name or the
 * browser-supplied type, which anyone can fake. Returns null for anything we don't accept.
 */
export function sniffKind(bytes: Uint8Array): FileKind | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 5) === "%PDF-") return "pdf";
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  return null;
}

/** One upload must be one readable, unlocked PDF page (the browser splits PDFs before sending). */
export async function checkSinglePagePdf(bytes: Uint8Array): Promise<void> {
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (err) {
    if (err instanceof EncryptedPDFError) {
      throw new AnalyzeFailure("encrypted_pdf", "This PDF is password-protected. Save an unlocked copy, or take photos of the menu.", 400);
    }
    throw new AnalyzeFailure("bad_file", "This PDF looks damaged. Try downloading it again, or take photos of the menu.", 400);
  }
  const pages = doc.getPageCount();
  if (pages === 0) throw new AnalyzeFailure("bad_file", "This PDF has no pages.", 400);
  if (pages > 1) throw new AnalyzeFailure("too_many_pages", "Please send one menu page at a time.", 400);
}
