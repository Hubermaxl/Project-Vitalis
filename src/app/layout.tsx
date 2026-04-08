import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitalis — Deine Blutwerte, optimiert verstanden",
  description: "Verfolge deine Blutwerte privat und sicher. Longevity-optimale Bereiche nach Dr. Peter Attia, österreichische Referenzwerte, DSGVO-konform.",
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
