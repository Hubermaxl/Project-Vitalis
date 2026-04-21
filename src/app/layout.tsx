import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vitalis — Deine Blutwerte, optimiert verstanden",
  description: "Verfolge deine Blutwerte privat und sicher. Longevity-optimale Bereiche nach Dr. Peter Attia, österreichische Referenzwerte, DSGVO-konform.",
};

const themeInitScript = `
(function(){try{
  var stored=localStorage.getItem('vitalis-theme');
  var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var isDark = stored ? stored==='dark' : systemDark;
  if(isDark) document.documentElement.classList.add('dark');
}catch(e){}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans text-stone-900 bg-stone-50 min-h-screen antialiased dark:text-stone-100 dark:bg-stone-950 transition-colors">
        {children}
      </body>
    </html>
  );
}
