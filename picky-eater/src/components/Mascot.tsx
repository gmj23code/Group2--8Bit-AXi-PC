type MascotProps = {
  size?: number;
  mood?: "happy" | "thinking";
  className?: string;
};

/** "Avo", the friendly avocado mascot. Decorative, so it's hidden from screen readers. */
export function Mascot({ size = 48, mood = "happy", className }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
    >
      {/* skin */}
      <path
        d="M32 4c-9 0-15 9-17 19-2 8-6 13-6 21 0 10 10 17 23 17s23-7 23-17c0-8-4-13-6-21C47 13 41 4 32 4z"
        fill="#5f9e5a"
      />
      {/* flesh */}
      <path
        d="M32 9c-7 0-11 8-13 16-2 7-5 11-5 18 0 8 8 13 18 13s18-5 18-13c0-7-3-11-5-18-2-8-6-16-13-16z"
        fill="#d9f0a3"
      />
      {/* pit */}
      <circle cx="32" cy="42" r="9" fill="#9c6b3f" />
      <circle cx="29" cy="39" r="2.5" fill="#c08a5a" />
      {/* eyes */}
      <circle cx="25" cy="27" r="2.6" fill="#2b2433" />
      <circle cx="39" cy="27" r="2.6" fill="#2b2433" />
      <circle cx="26" cy="26" r="0.9" fill="#fff" />
      <circle cx="40" cy="26" r="0.9" fill="#fff" />
      {/* cheeks */}
      <circle cx="20" cy="32" r="2.5" fill="#f7a8a8" opacity="0.8" />
      <circle cx="44" cy="32" r="2.5" fill="#f7a8a8" opacity="0.8" />
      {/* mouth */}
      {mood === "happy" ? (
        <path d="M28 31q4 4 8 0" stroke="#2b2433" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M29 32h6" stroke="#2b2433" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}
