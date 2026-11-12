/** Simple brand mark: a leaf inside a rounded square. Decorative; the wordmark carries the name. */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
      {/* leaf */}
      <path d="M23 9c-8 0-13 4.5-13 11 0 1.2.2 2.2.6 3C12 17 16 13.5 23 9z" fill="#fff" opacity="0.95" />
      <path d="M23 9c.4 7.5-3.6 13-10.4 14 2-3.5 5.6-8 10.4-14z" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={30} />
      <span className="font-display text-[1.6rem] leading-none">Picky Eater</span>
    </span>
  );
}
