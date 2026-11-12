import Link from "next/link";
import type { ComponentProps } from "react";

// One button style used everywhere. min-h-14 = 56px at our 18px base: an easy tap target.
const base =
  "inline-flex items-center justify-center gap-2 min-h-14 px-6 rounded-xl text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-card",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-subtle",
  ghost: "text-brand-dark hover:bg-brand-soft",
};

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
