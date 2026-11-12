import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { AuthSync } from "@/components/AuthSync";
import "./globals.css";

// Manrope: clean, open, very readable at small sizes on phones (body + UI).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Instrument Serif: elegant display face for page and section titles only.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Picky Eater",
  description: "Snap a menu and see what fits your diet, allergies, and health goals.",
};

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${instrumentSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {/* Keyboard users can jump past the header straight to the page content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-ink focus:text-white focus:px-5 focus:py-3 focus:font-semibold"
        >
          Skip to main content
        </a>
        <AuthSync />
        <AppHeader />
        <main id="main" tabIndex={-1} className="flex-1 w-full max-w-2xl mx-auto px-5 pb-36 outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
