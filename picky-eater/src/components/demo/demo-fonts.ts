import { Alfa_Slab_One, Cormorant_Garamond, Permanent_Marker, Righteous } from "next/font/google";
import localFont from "next/font/local";

// Fonts for the sample menus. None are preloaded (preload: false): the browser fetches
// a font the first time a page actually shows it. They also act as the app-wide fallbacks
// for non-Latin dish names (see globals.css), so nothing shows as empty boxes.
//
// Japanese, Arabic, and Devanagari are SELF-HOSTED from src/fonts/demo (small subsets,
// built by scripts/make-demo-fonts.mjs). Loading them from Google made `next dev` fail:
// Google serves Japanese as hundreds of slices, and fetching them all at once timed out.
// Local files also mean the demo never needs the internet. The Latin display fonts below
// are only a few files each, so they still come from Google (downloaded once, then cached).

// Options are written out in each call: Next reads font options at build time, so they
// must be plain literals (no spreads or shared variables).
const notoSansJP = localFont({
  preload: false,
  display: "swap",
  adjustFontFallback: false,
  src: [
    { path: "../../fonts/demo/NotoSansJP-400.woff2", weight: "400" },
    { path: "../../fonts/demo/NotoSansJP-700.woff2", weight: "700" },
  ],
  variable: "--f-jp-sans",
});
const amiri = localFont({
  preload: false,
  display: "swap",
  adjustFontFallback: false,
  src: [
    { path: "../../fonts/demo/Amiri-400.woff2", weight: "400" },
    { path: "../../fonts/demo/Amiri-700.woff2", weight: "700" },
  ],
  variable: "--f-arabic",
});
const devanagari = localFont({
  preload: false,
  display: "swap",
  adjustFontFallback: false,
  src: [
    { path: "../../fonts/demo/NotoSansDevanagari-400.woff2", weight: "400" },
    { path: "../../fonts/demo/NotoSansDevanagari-600.woff2", weight: "600" },
  ],
  variable: "--f-devanagari",
});
const yatra = localFont({
  preload: false,
  display: "swap",
  adjustFontFallback: false,
  src: "../../fonts/demo/YatraOne-400.woff2",
  weight: "400",
  variable: "--f-yatra",
});

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--f-trattoria", preload: false });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--f-chalk", preload: false });
const alfa = Alfa_Slab_One({ subsets: ["latin"], weight: "400", variable: "--f-diner-display", preload: false });
const righteous = Righteous({ subsets: ["latin"], weight: "400", variable: "--f-diner", preload: false });

/** Put this class on any element that renders sample menu art (the root layout does it app-wide). */
export const demoFontVars = [cormorant, notoSansJP, marker, amiri, devanagari, yatra, alfa, righteous]
  .map((f) => f.variable)
  .join(" ");
