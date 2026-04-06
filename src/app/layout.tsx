import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BlutBild — Deine Blutwerte, klar verstanden",
  description: "Verfolge deine Blutwerte privat und sicher. Österreichische Referenzwerte, Longevity-optimale Bereiche, DSGVO-konform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="font-sans text-stone-900 bg-stone-50 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
