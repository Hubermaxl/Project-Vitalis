// ─── Vitalis Design Tokens ─────────────────────────────────────────
// Zentrale Werte für Stellen, an denen Tailwind-Klassen nicht funktionieren
// (SVG-Fill, inline styles, dynamische Farben).
// Siehe vitalis_handoff/README.md > Design-System.

export const ROYAL = "#1d4ed8";

export const STATUS = {
  optimal:  "#059669",
  normal:   "#d97706",
  kritisch: "#dc2626",
} as const;
export type Status = keyof typeof STATUS;

// Kategorie-Dots — NUR für kleine Punkte (≤10px) zur Zuordnung.
export const CAT = {
  blutbild:     "#e11d48",
  stoffwechsel: "#d97706",
  lipide:       "#7c3aed",
  entzuendung:  "#ea580c",
  schilddruese: "#0284c7",
  leber:        "#059669",
  niere:        "#0891b2",
  vitamine:     "#ca8a04",
  hormone:      "#a21caf",
} as const;
export type CatKey = keyof typeof CAT;

// Light/Dark-Pärchen für Stellen, die per JS umschalten müssen.
export const SURFACE = {
  bg:     { l: "#fafaf9", d: "#0c0a09" },
  card:   { l: "#ffffff", d: "#1c1917" },
  border: { l: "#e7e5e4", d: "#292524" },
  fg:     { l: "#1c1917", d: "#f5f5f4" },
  fg2:    { l: "#78716c", d: "#78716c" }, // secondary
  fg3:    { l: "#a8a29e", d: "#57534e" }, // tertiary
} as const;

// Kategorie-Farbpaare für Backgrounds/Borders/Akzente in Light & Dark.
// Aus vitalis-components.jsx CAT_COLORS übernommen.
export const CAT_COLORS = {
  rose:    { l: { bg:"#fff1f2", text:"#be123c", border:"#fecdd3", accent:"#f43f5e" }, d: { bg:"#1f0409", text:"#fb7185", border:"#4c0519", accent:"#fb7185" } },
  amber:   { l: { bg:"#fffbeb", text:"#b45309", border:"#fde68a", accent:"#f59e0b" }, d: { bg:"#1c1200", text:"#fbbf24", border:"#451a03", accent:"#fbbf24" } },
  violet:  { l: { bg:"#f5f3ff", text:"#6d28d9", border:"#ddd6fe", accent:"#8b5cf6" }, d: { bg:"#13111f", text:"#a78bfa", border:"#2e1065", accent:"#a78bfa" } },
  orange:  { l: { bg:"#fff7ed", text:"#c2410c", border:"#fed7aa", accent:"#f97316" }, d: { bg:"#1c0d00", text:"#fb923c", border:"#431407", accent:"#fb923c" } },
  sky:     { l: { bg:"#f0f9ff", text:"#0369a1", border:"#bae6fd", accent:"#0ea5e9" }, d: { bg:"#060d14", text:"#38bdf8", border:"#082f49", accent:"#38bdf8" } },
  emerald: { l: { bg:"#ecfdf5", text:"#065f46", border:"#a7f3d0", accent:"#10b981" }, d: { bg:"#021a0f", text:"#34d399", border:"#064e3b", accent:"#34d399" } },
  cyan:    { l: { bg:"#ecfeff", text:"#0e7490", border:"#a5f3fc", accent:"#06b6d4" }, d: { bg:"#020f10", text:"#22d3ee", border:"#083344", accent:"#22d3ee" } },
  yellow:  { l: { bg:"#fefce8", text:"#854d0e", border:"#fef08a", accent:"#eab308" }, d: { bg:"#141200", text:"#facc15", border:"#422006", accent:"#facc15" } },
  fuchsia: { l: { bg:"#fdf4ff", text:"#a21caf", border:"#f0abfc", accent:"#d946ef" }, d: { bg:"#160518", text:"#e879f9", border:"#4a044e", accent:"#e879f9" } },
} as const;
export type CatColorKey = keyof typeof CAT_COLORS;

export const getCat = (key: CatColorKey, dark: boolean) =>
  CAT_COLORS[key][dark ? "d" : "l"];

// Auto-Akzent für Score-Werte (wenn kein expliziter accentColor gesetzt).
export const scoreAccent = (score: number): string =>
  score >= 70 ? STATUS.optimal : score >= 50 ? STATUS.normal : STATUS.kritisch;
