"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type EmptyStateProps = {
  title: string;
  children?: ReactNode; // body text, tips
  actions?: ReactNode; // buttons
  icon?: IconName;
  tone?: "neutral" | "problem";
  /** Move keyboard/screen-reader focus here when it appears (use for errors). */
  autoFocus?: boolean;
};

/** One calm layout for every "nothing here" and "something went wrong" moment. */
export function EmptyState({ title, children, actions, icon = "menu", tone = "neutral", autoFocus }: EmptyStateProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, [autoFocus]);

  const problem = tone === "problem";

  return (
    <div
      role={problem ? "alert" : undefined}
      className="rounded-card border border-line bg-surface p-6 sm:p-8 flex flex-col items-center text-center gap-4 shadow-card"
    >
      <span
        className={`w-12 h-12 rounded-full grid place-items-center ${problem ? "bg-meh-bg text-meh" : "bg-subtle text-ink-soft"}`}
      >
        <Icon name={problem ? "alert" : icon} size={24} />
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-[1.9rem] leading-tight outline-none">
        {title}
      </h2>
      {children && <div className="text-ink-soft flex flex-col gap-3 w-full max-w-md">{children}</div>}
      {actions && <div className="w-full max-w-md flex flex-col gap-3 mt-2">{actions}</div>}
    </div>
  );
}

/** Short list of photo tips, reused by several error states. */
export function Tips({ items }: { items: string[] }) {
  return (
    <ul className="text-left flex flex-col gap-2 rounded-xl bg-subtle p-4 text-ink">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <Icon name="info" size={18} className="mt-1 text-ink-soft" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
