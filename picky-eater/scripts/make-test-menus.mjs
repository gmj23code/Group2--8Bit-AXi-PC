// Builds the sample menus in /test-menus. All restaurants and dishes are made up.
//
//   node scripts/make-test-menus.mjs            → PDFs from the committed PNGs
//   node scripts/make-test-menus.mjs --render   → also re-render the PNGs with headless Chrome
//
// Output:
//   bistro-mundo-text.pdf      3-page text PDF: French/Spanish/Italian names, € prices,
//                              a two-column page, items without descriptions, one repeated dish
//   golden-lotus-scanned.pdf   2-page image-only PDF (looks scanned): Thai/Vietnamese, $ prices
//   izakaya-hoshi-photo-1.png  phone-style photos: Japanese names, ¥ prices, tilted
//   izakaya-hoshi-photo-2.png  (page 2 repeats one dish from page 1, to test de-duplication)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "test-menus");
const src = path.join(root, "source");

/* ---------- 1. Text-based PDF ---------- */

const PAGES = [
  {
    title: "Entrées & Tapas",
    columns: [
      [
        ["Entrées", [
          ["Soupe à l'oignon gratinée", "9,50 €", "Bouillon de bœuf, oignons, croûtons, gruyère"],
          ["Salade niçoise", "14,00 €", "Thon, œuf, olives, anchois, haricots verts"],
          ["Burrata e pomodorini", "11,00 €", null],
        ]],
        ["Tapas", [
          ["Gambas al ajillo", "12,50 €", "Crevettes, ail, piment, huile d'olive"],
          ["Patatas bravas", "7,00 €", "Pommes de terre, sauce tomate épicée, aïoli"],
          ["Pimientos de Padrón", "6,50 €", null],
          ["Hummus maison", "8,00 €", "Pois chiches, tahini, citron, pain pita"],
        ]],
      ],
    ],
  },
  {
    title: "Plats principaux",
    // Two columns on this page, to test multi-column reading.
    columns: [
      [
        ["Viandes & Poissons", [
          ["Bœuf bourguignon", "24,00 €", "Bœuf, vin rouge, lardons, champignons"],
          ["Poulet basquaise", "19,00 €", "Poulet, poivrons, tomates, piment"],
          ["Saumon grillé", "22,00 €", "Saumon, beurre citronné, riz sauvage"],
          ["Paella de marisco", "26,00 €", "Riz, moules, gambas, calamars, safran"],
        ]],
      ],
      [
        ["Pâtes & Végétarien", [
          ["Ravioli ai funghi", "17,00 €", "Champignons, ricotta, beurre, sauge"],
          ["Risotto alla milanese", "18,00 €", "Riz, safran, parmesan, vin blanc"],
          ["Ratatouille", "15,00 €", null],
          ["Trofie al pesto", "16,00 €", "Pesto genovese, pignons, parmesan"],
        ]],
      ],
    ],
  },
  {
    title: "Desserts & Boissons",
    columns: [
      [
        ["Desserts", [
          ["Crème brûlée", "8,00 €", null],
          ["Tarte Tatin", "8,50 €", "Pommes caramélisées, pâte feuilletée"],
          ["Churros con chocolate", "7,00 €", null],
          ["Tiramisù", "8,00 €", "Mascarpone, café, cacao"],
        ]],
        ["À partager", [
          // Repeated from page 1 with the same price: should be merged into one result.
          ["Patatas bravas", "7,00 €", "Pommes de terre, sauce tomate épicée, aïoli"],
        ]],
        ["Boissons", [
          ["Agua de Jamaica", "4,00 €", "Infusion d'hibiscus"],
          ["Café crème", "3,50 €", null],
          ["Verre de vin rouge", "6,00 €", null],
        ]],
      ],
    ],
  },
];

async function makeTextPdf() {
  const doc = await PDFDocument.create();
  doc.setTitle("Bistro Mundo menu (test)");
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const ink = rgb(0.15, 0.12, 0.1);
  const accent = rgb(0.55, 0.25, 0.15);

  PAGES.forEach((p, pageIndex) => {
    const page = doc.addPage([612, 792]);
    const center = (text, font, size, y, color = ink) =>
      page.drawText(text, { x: (612 - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
    center("BISTRO MUNDO", bold, 30, 730);
    center("Cuisine du monde · Paris", italic, 13, 710, accent);
    center(p.title, serif, 20, 670);

    const colWidth = p.columns.length === 2 ? 250 : 500;
    p.columns.forEach((sections, c) => {
      const x = 56 + c * 268;
      let y = 630;
      for (const [heading, items] of sections) {
        page.drawText(heading.toUpperCase(), { x, y, size: 12, font: bold, color: accent });
        y -= 22;
        for (const [name, price, desc] of items) {
          page.drawText(name, { x, y, size: 13, font: bold, color: ink });
          page.drawText(price, { x: x + colWidth - bold.widthOfTextAtSize(price, 13), y, size: 13, font: bold, color: ink });
          y -= 15;
          if (desc) {
            page.drawText(desc, { x, y, size: 10.5, font: italic, color: ink, maxWidth: colWidth });
            y -= 15;
          }
          y -= 8;
        }
        y -= 12;
      }
    });
    center(`Page ${pageIndex + 1}/${PAGES.length} · Prix nets, service compris · Allergènes : demandez à notre équipe`, italic, 9.5, 36);
  });

  fs.writeFileSync(path.join(root, "bistro-mundo-text.pdf"), await doc.save());
  console.log("wrote bistro-mundo-text.pdf");
}

/* ---------- 2. Render PNGs from HTML (optional) ---------- */

function findChrome() {
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((c) => fs.existsSync(c));
}

function render(htmlFile, page, out, size) {
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome/Edge not found; can't re-render PNGs.");
  const url = `${pathToFileURL(path.join(src, htmlFile)).href}?page=${page}`;
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--window-size=${size}`, `--screenshot=${out}`, url], {
    stdio: "ignore",
  });
  console.log("rendered", path.basename(out));
}

/* ---------- 3. Image-only ("scanned") PDF ---------- */

async function makeScannedPdf() {
  const doc = await PDFDocument.create();
  doc.setTitle("Golden Lotus menu (scanned test)");
  for (const n of [1, 2]) {
    const png = await doc.embedPng(fs.readFileSync(path.join(src, `golden-lotus-${n}.png`)));
    const page = doc.addPage([612, 812]);
    page.drawImage(png, { x: 0, y: 0, width: 612, height: 812 });
  }
  fs.writeFileSync(path.join(root, "golden-lotus-scanned.pdf"), await doc.save());
  console.log("wrote golden-lotus-scanned.pdf");
}

if (process.argv.includes("--render")) {
  for (const n of [1, 2]) {
    render("golden-lotus.html", n, path.join(src, `golden-lotus-${n}.png`), "800,1060");
    render("izakaya-hoshi.html", n, path.join(root, `izakaya-hoshi-photo-${n}.png`), "900,1200");
  }
}
await makeTextPdf();
await makeScannedPdf();
