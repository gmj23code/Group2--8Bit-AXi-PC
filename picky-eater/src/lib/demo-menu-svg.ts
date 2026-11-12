import { DEMO_DISHES, DEMO_PAGES, DEMO_RESTAURANT, type DemoPage } from "./demo-menu";

// Draws each demo menu page as an SVG "photo", generated from the same data the demo
// scores, so the pictures always match the dishes. No image files, works offline.

const W = 600;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Wraps text to at most `maxChars` per line (simple word wrap, good enough for a menu). */
function wrap(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if ((line + " " + word).trim().length > maxChars) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function pageSvg(page: DemoPage): string {
  const dishes = DEMO_DISHES.filter((d) => d.page === page.number);
  const sections = [...new Set(dishes.map((d) => d.section))];
  const parts: string[] = [];
  let y = 70;

  parts.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="40" font-weight="bold" fill="#2f2419">${esc(DEMO_RESTAURANT)}</text>`);
  y += 30;
  parts.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="16" font-style="italic" fill="#7a5c3e">Kitchen · Bar · Est. 2019</text>`);
  y += 22;
  parts.push(`<line x1="210" y1="${y}" x2="390" y2="${y}" stroke="#7a5c3e" stroke-width="1.5"/>`);
  y += 40;
  parts.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="24" fill="#2f2419">${esc(page.title)}</text>`);
  y += 20;

  for (const section of sections) {
    y += 38;
    parts.push(`<text x="56" y="${y}" font-size="17" font-weight="bold" letter-spacing="3" fill="#a0522d">${esc(section.toUpperCase())}</text>`);
    y += 8;
    for (const d of dishes.filter((x) => x.section === section)) {
      y += 30;
      parts.push(`<text x="56" y="${y}" font-size="18" font-weight="bold" fill="#2f2419">${esc(d.name)}</text>`);
      parts.push(`<text x="${W - 56}" y="${y}" text-anchor="end" font-size="18" fill="#2f2419">${esc(d.price)}</text>`);
      for (const line of wrap(d.description, 58)) {
        y += 19;
        parts.push(`<text x="56" y="${y}" font-size="14" font-style="italic" fill="#5b4a3a">${esc(line)}</text>`);
      }
    }
  }

  y += 50;
  parts.push(`<text x="${W / 2}" y="${y}" text-anchor="middle" font-size="13" fill="#7a5c3e">Page ${page.number} of ${DEMO_PAGES.length} · Please tell your server about any allergies</text>`);
  const H = y + 36;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Georgia, 'Times New Roman', serif">
<rect width="${W}" height="${H}" fill="#fbf4e6"/>
<rect x="16" y="16" width="${W - 32}" height="${H - 32}" fill="none" stroke="#7a5c3e" stroke-width="3" rx="12"/>
<rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="#7a5c3e" stroke-width="1" rx="8"/>
${parts.join("\n")}
</svg>`;
}

let cache: string[] | null = null;

/** One data URL per page, in page order (computed once). */
export function demoPageImages(): string[] {
  cache ??= DEMO_PAGES.map((p) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(pageSvg(p))}`);
  return cache;
}
