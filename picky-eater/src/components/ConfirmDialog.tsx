"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  /** Esc key or clicking the backdrop. */
  onCancel: () => void;
};

/**
 * Modal built on the native <dialog> element: the browser handles focus trapping,
 * the Esc key, and hiding the rest of the page from screen readers.
 */
export function ConfirmDialog({ open, title, children, actions, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault(); // we control closing through `open`
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel(); // click on the backdrop
      }}
      className="m-auto w-[calc(100%-2.5rem)] max-w-md rounded-card bg-surface p-0 text-ink shadow-lift backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-[1.9rem] leading-tight">
          {title}
        </h2>
        {children && <div className="mt-2 text-ink-soft">{children}</div>}
        <div className="mt-6 flex flex-col gap-2.5">{actions}</div>
      </div>
    </dialog>
  );
}
