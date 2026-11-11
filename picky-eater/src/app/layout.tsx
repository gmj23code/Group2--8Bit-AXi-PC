import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { AuthSync } from "@/components/AuthSync";
import "./globals.css";

// Nunito: rounded and friendly, but still very legible at large sizes.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Picky Eater",
  description: "Snap a menu and see what fits your diet, allergies, and health goals.",
};

export const viewport: Viewport = {
  themeColor: "#fffaf3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Keyboard users can jump past the header straight to the page content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:text-white focus:px-5 focus:py-3 focus:font-extrabold"
        >
          Skip to main content
        </a>
        <AuthSync />
        <AppHeader />
        <main id="main" tabIndex={-1} className="flex-1 w-full max-w-2xl mx-auto px-4 pb-32 outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
