"use client";
import { useEffect, useState } from "react";

/**
 * Beobachtet die `dark`-Klasse auf <html>. Nötig, weil viele Vitalis-Komponenten
 * Farben inline in SVGs setzen (z.B. ScoreRing-Stroke), wo Tailwind-`dark:`-Klassen
 * nicht greifen.
 *
 * Gibt während SSR / vor dem ersten Paint `false` zurück. Das `themeInitScript`
 * in layout.tsx setzt die Klasse aber bereits vor Hydration, also flackert nichts.
 */
export function useDarkMode(): boolean {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setDark(html.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
