import Link from "next/link";
import { Mascot } from "./Mascot";

export function AppHeader() {
  return (
    <header className="w-full border-b border-line bg-cream/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-xl min-h-12 pr-2">
          <Mascot size={36} />
          <span className="text-xl font-extrabold tracking-tight">Picky Eater</span>
        </Link>
        <Link
          href="/settings"
          className="min-h-12 px-4 inline-flex items-center gap-2 rounded-full border-2 border-line bg-white font-bold hover:bg-brand-soft"
        >
          <span aria-hidden="true">⚙️</span> Settings
        </Link>
      </div>
    </header>
  );
}
