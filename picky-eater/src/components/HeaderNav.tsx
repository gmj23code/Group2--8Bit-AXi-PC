"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const NAV: { href: string; label: string; icon: IconName; match: (path: string) => boolean }[] = [
  // Results and dish pages count as part of "Scan", so Scan stays highlighted there.
  { href: "/scan", label: "Scan", icon: "camera", match: (p) => p.startsWith("/scan") || p.startsWith("/results") },
  { href: "/settings", label: "Settings", icon: "sliders", match: (p) => p.startsWith("/settings") || p.startsWith("/preferences") },
];

/** The links themselves. `path` is null while the URL isn't known yet (no highlight). */
export function NavLinks({ path }: { path: string | null }) {
  return (
    <nav aria-label="Main">
      <ul className="flex items-center gap-1">
        {NAV.map((item) => {
          const active = path !== null && item.match(path);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-12 min-w-12 px-3 inline-flex items-center justify-center gap-2 rounded-lg font-medium ${
                  active ? "bg-subtle text-ink" : "text-ink-soft hover:bg-subtle hover:text-ink"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {/* On very narrow phones the icon stands alone; the label stays for screen readers. */}
                <span className="max-[400px]:sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Reads the current URL to highlight the active section. Must sit inside <Suspense>. */
export function HeaderNav() {
  return <NavLinks path={usePathname()} />;
}
