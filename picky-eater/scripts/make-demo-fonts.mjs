// Builds the self-hosted fonts for the sample menus' non-Latin scripts
// (src/fonts/demo/*.woff2). These are committed, so dev, builds, and offline pitches
// never depend on downloading fonts from Google.
//
// Why: Google serves Japanese as hundreds of small slices. In `next dev`, Turbopack fetches
// them all at once and many time out ("Can't resolve '@vercel/turbopack-next/internal/font
// /google/font'"). Small subsetted files avoid that entirely.
//
// Rerun after changing the Japanese menu (only its kanji are kept):
//   1. Download the source TTFs from https://github.com/google/fonts (ofl/notosansjp,
//      ofl/amiri, ofl/notosansdevanagari, ofl/yatraone) into one folder.
//   2. In any folder:  npm i subset-font@2
//   3. node scripts/make-demo-fonts.mjs <folder-with-ttfs> <folder-with-subset-font>
//
// All four fonts are licensed under the SIL Open Font License (see src/fonts/demo/OFL-*.txt).

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [srcDir, toolDir] = process.argv.slice(2);
if (!srcDir || !toolDir) {
  console.error("Usage: node scripts/make-demo-fonts.mjs <folder-with-ttfs> <folder-with-subset-font>");
  process.exit(1);
}
const subsetFont = createRequire(path.join(path.resolve(toolDir), "noop.js"))("subset-font");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src", "fonts", "demo");
fs.mkdirSync(outDir, { recursive: true });

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join("");
const ASCII = range(0x20, 0x7e) + "·–—’“”…€¥₹";

// Japanese: every CJK character actually used in the izakaya menu, plus all kana and
// Japanese punctuation (so new kana-only dishes still render).
const izakaya = fs.readFileSync(path.join(root, "src", "lib", "demo", "menus", "izakaya.ts"), "utf8");
const kanjiUsed = [...new Set([...izakaya].filter((c) => /[一-鿿㐀-䶿]/.test(c)))].join("");
const JAPANESE = ASCII + range(0x3000, 0x303f) + range(0x3040, 0x309f) + range(0x30a0, 0x30ff) + range(0xff01, 0xff60) + kanjiUsed;

// Arabic and Devanagari: the whole script (small), so any dish name renders.
const ARABIC = ASCII + range(0x0600, 0x06ff) + range(0x0750, 0x077f) + range(0xfb50, 0xfdff) + range(0xfe70, 0xfeff) + "‌‍";
const DEVANAGARI = ASCII + range(0x0900, 0x097f) + range(0xa8e0, 0xa8ff) + range(0x1cd0, 0x1cff) + "‌‍◌";

const jobs = [
  { src: "NotoSansJP-VF.ttf", out: "NotoSansJP-400.woff2", text: JAPANESE, axes: { wght: 400 } },
  { src: "NotoSansJP-VF.ttf", out: "NotoSansJP-700.woff2", text: JAPANESE, axes: { wght: 700 } },
  { src: "Amiri-Regular.ttf", out: "Amiri-400.woff2", text: ARABIC },
  { src: "Amiri-Bold.ttf", out: "Amiri-700.woff2", text: ARABIC },
  { src: "NotoSansDevanagari-VF.ttf", out: "NotoSansDevanagari-400.woff2", text: DEVANAGARI, axes: { wght: 400, wdth: 100 } },
  { src: "NotoSansDevanagari-VF.ttf", out: "NotoSansDevanagari-600.woff2", text: DEVANAGARI, axes: { wght: 600, wdth: 100 } },
  { src: "YatraOne-Regular.ttf", out: "YatraOne-400.woff2", text: DEVANAGARI },
];

for (const job of jobs) {
  const input = fs.readFileSync(path.join(srcDir, job.src));
  const output = await subsetFont(input, job.text, { targetFormat: "woff2", ...(job.axes ? { variationAxes: job.axes } : {}) });
  fs.writeFileSync(path.join(outDir, job.out), output);
  console.log(`${job.out.padEnd(32)} ${(output.length / 1024).toFixed(0).padStart(5)} KB`);
}
for (const lic of ["OFL-NotoSansJP.txt", "OFL-Amiri.txt", "OFL-NotoSansDevanagari.txt", "OFL-YatraOne.txt"]) {
  if (fs.existsSync(path.join(srcDir, lic))) fs.copyFileSync(path.join(srcDir, lic), path.join(outDir, lic));
}
console.log(`Japanese: ${[...kanjiUsed].length} kanji from the izakaya menu + all kana.`);
