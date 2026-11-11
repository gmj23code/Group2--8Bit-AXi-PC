"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Mascot } from "./Mascot";

type EmptyStateProps = {
  title: string;
  children?: ReactNode; // body text, tips
  actions?: ReactNode; // buttons
  mood?: "happy" | "thinking";
  tone?: "neutral" | "problem";
  /** Move keyboard/screen-reader focus here when it appears (use for errors). */
  autoFocus?: boolean;
};

/** One friendly layout for every "nothing here" and "something went wrong" moment. */
export function EmptyState({ title, children, actions, mood = "thinking", tone = "neutral", autoFocus }: EmptyStateProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, [autoFocus]);

  return (
    <div
      role={tone === "problem" ? "alert" : undefined}
      className={`rounded-card border-2 p-6 flex flex-col items-center text-center gap-4 ${
        tone === "problem" ? "border-meh bg-meh-bg/40" : "border-dashed border-line bg-white/60"
      }`}
    >
      <Mascot size={88} mood={mood} />
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold outline-none">
        {title}
      </h2>
      {children && <div className="text-lg text-ink flex flex-col gap-3 w-full">{children}</div>}
      {actions && <div className="w-full flex flex-col gap-3">{actions}</div>}
    </div>
  );
}

/** Numbered photo tips, reused by several error states. */
export function Tips({ items }: { items: string[] }) {
  return (
    <ul className="text-left flex flex-col gap-2 rounded-2xl bg-white p-4">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span aria-hidden="true">💡</span>
          <span className="font-bold">{t}</span>
        </li>
      ))}
    </ul>
  );
}
