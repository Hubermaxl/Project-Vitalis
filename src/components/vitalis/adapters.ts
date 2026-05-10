// ─── Adapter: bestehende Datentypen → Vitalis-Komponenten-Props ────
//
// Brückenmodul zwischen `lib/markers.ts` (BloodMarker) und der neuen
// Komponenten-Welt in `components/vitalis/` (Status, CatColorKey, …).
//
// Bewusst hier (und nicht in lib/markers.ts), damit die Backend-Datentypen
// frei von UI-Annahmen bleiben.

import { BLOOD_MARKERS, getStatus, type BloodMarker } from "@/lib/markers";
import type { CatColorKey, Status } from "./tokens";

/** lib/markers.ts liefert 4 Status-Werte; Vitalis-Komponenten kennen 3. */
export function normalizeStatus(s: "optimal" | "normal" | "low" | "high"): Status {
  if (s === "optimal") return "optimal";
  if (s === "normal") return "normal";
  return "kritisch"; // low + high → kritisch
}

/** Kombinierter Helper: value + marker + sex → Vitalis-Status. */
export function getVitalisStatus(value: number, marker: BloodMarker, sex: string): Status {
  return normalizeStatus(getStatus(value, marker, sex).status);
}

/** Sex-spezifische Range-Werte aus BloodMarker holen. */
export function getRanges(marker: BloodMarker, sex: string) {
  const s = sex === "female" ? "f" : "m";
  return {
    refMin: marker[`ref_min_${s}` as keyof BloodMarker] as number,
    refMax: marker[`ref_max_${s}` as keyof BloodMarker] as number,
    optMin: marker[`opt_min_${s}` as keyof BloodMarker] as number,
    optMax: marker[`opt_max_${s}` as keyof BloodMarker] as number,
  };
}

/** Mappt einen Kategorie-Namen aus BLOOD_MARKERS auf die CAT_COLORS-Keys. */
export const CATEGORY_COLOR_KEY: Record<string, CatColorKey> = {
  "Blutbild":            "rose",
  "Stoffwechsel":        "amber",
  "Lipide":              "violet",
  "Entzündung":          "orange",
  "Schilddrüse":         "sky",
  "Leber":               "emerald",
  "Niere":               "cyan",
  "Vitamine & Minerale": "yellow",
  "Hormone":             "fuchsia",
  "Weitere":             "rose", // Fallback — "Weitere" hat keinen eigenen Token
};

export const getCategoryColorKey = (cat: string): CatColorKey =>
  CATEGORY_COLOR_KEY[cat] ?? "rose";

/** Marker-Lookup. Idempotent, kann mehrfach aufgerufen werden. */
export function findMarker(markerId: string): BloodMarker | undefined {
  return BLOOD_MARKERS.find((m) => m.id === markerId);
}

/**
 * Baut aus `panels` (chronologisch, älteste zuerst) eine Spark-Serie für eine
 * Marker-ID. Liefert die letzten 4 Werte. Wenn nicht genug Werte vorhanden sind,
 * fällt es auf die vorhandenen zurück.
 */
export function buildSpark(
  panels: Array<{ values: { markerId: string; value: number }[] }>,
  markerId: string,
  maxPoints = 4
): number[] {
  const series: number[] = [];
  for (const p of panels) {
    const v = p.values.find((x) => x.markerId === markerId);
    if (v) series.push(v.value);
  }
  return series.slice(-maxPoints);
}
