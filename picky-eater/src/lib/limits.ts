// Upload limits, shared by the browser (to fail fast with a friendly message)
// and the server (which re-checks everything, because the browser can't be trusted).

const MB = 1024 * 1024;

export const LIMITS = {
  /** A whole PDF as picked by the user. */
  maxPdfBytes: 25 * MB,
  maxPdfPages: 30,
  /** Photos picked at once (one photo = one page). */
  maxPhotos: 10,
  /** A single photo straight off the phone, before we shrink it. */
  maxPhotoInputBytes: 30 * MB,
  /**
   * One upload = one page. Vercel functions reject request bodies over 4.5 MB,
   * so we stay safely below that. (Self-hosted Node has no such limit.)
   */
  maxUploadBytes: 4 * MB,
  /** Pages sent to the AI at the same time. */
  concurrency: 3,
} as const;

export const formatMB = (bytes: number) => `${Math.round((bytes / MB) * 10) / 10} MB`;
