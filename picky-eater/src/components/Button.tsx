import Link from "next/link";
import type { ComponentProps } from "react";

// One big, easy-to-tap button style, used everywhere. Min height 56px.
const base =
  "inline-flex items-center justify-center gap-2 min-h-14 px-6 rounded-full text-lg font-extrabold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  secondary: "bg-white text-ink border-2 border-line hover:bg-brand-soft",
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
