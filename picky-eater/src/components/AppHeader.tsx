import Link from "next/link";
import { Suspense } from "react";
import { HeaderNav, NavLinks } from "./HeaderNav";
import { Logo } from "./Logo";

/** Logo (home) on the left; Scan and Settings on the right of every screen. */
export function AppHeader() {
  return (
    <header className="w-full border-b border-line bg-canvas/85 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-2">
        <Link href="/" aria-label="Picky Eater home" className="flex items-center rounded-lg min-h-12 pr-2">
          <Logo />
        </Link>
        {/* The highlight depends on the URL; the fallback shows the same links without it. */}
        <Suspense fallback={<NavLinks path={null} />}>
          <HeaderNav />
        </Suspense>
      </div>
    </header>
  );
}
