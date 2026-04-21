"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { BLOOD_MARKERS, CATEGORIES, CATEGORY_ORDER, getStatus, getSortedCategories, type BloodMarker, type StatusInfo } from "@/lib/markers";

interface Panel { id: string; user_id: string; test_date: string; lab_name: string | null; values: { markerId: string; value: number }[]; }
interface Prof { id: string; display_name: string; sex: string; birth_year: number; }

/* ─── CATEGORY COLORS ───────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; accent: string; dot: string; light: string }> = {
  "Blutbild":              { bg: "bg-rose-50/60 dark:bg-rose-950/30",         border: "border-rose-200/60 dark:border-rose-800/40",        text: "text-rose-700 dark:text-rose-300",       accent: "#e11d48", dot: "bg-rose-400",    light: "bg-rose-100 dark:bg-rose-900/50" },
  "Stoffwechsel":          { bg: "bg-amber-50/60 dark:bg-amber-950/30",       border: "border-amber-200/60 dark:border-amber-800/40",      text: "text-amber-700 dark:text-amber-300",     accent: "#d97706", dot: "bg-amber-400",   light: "bg-amber-100 dark:bg-amber-900/50" },
  "Lipide":                { bg: "bg-violet-50/60 dark:bg-violet-950/30",     border: "border-violet-200/60 dark:border-violet-800/40",    text: "text-violet-700 dark:text-violet-300",   accent: "#7c3aed", dot: "bg-violet-400",  light: "bg-violet-100 dark:bg-violet-900/50" },
  "Entzündung":            { bg: "bg-orange-50/60 dark:bg-orange-950/30",     border: "border-orange-200/60 dark:border-orange-800/40",    text: "text-orange-700 dark:text-orange-300",   accent: "#ea580c", dot: "bg-orange-400",  light: "bg-orange-100 dark:bg-orange-900/50" },
  "Schilddrüse":           { bg: "bg-sky-50/60 dark:bg-sky-950/30",           border: "border-sky-200/60 dark:border-sky-800/40",          text: "text-sky-700 dark:text-sky-300",         accent: "#0284c7", dot: "bg-sky-400",     light: "bg-sky-100 dark:bg-sky-900/50" },
  "Leber":                 { bg: "bg-emerald-50/60 dark:bg-emerald-950/30",   border: "border-emerald-200/60 dark:border-emerald-800/40",  text: "text-emerald-700 dark:text-emerald-300", accent: "#059669", dot: "bg-emerald-400", light: "bg-emerald-100 dark:bg-emerald-900/50" },
  "Niere":                 { bg: "bg-cyan-50/60 dark:bg-cyan-950/30",         border: "border-cyan-200/60 dark:border-cyan-800/40",        text: "text-cyan-700 dark:text-cyan-300",       accent: "#0891b2", dot: "bg-cyan-400",    light: "bg-cyan-100 dark:bg-cyan-900/50" },
  "Vitamine & Minerale":   { bg: "bg-yellow-50/60 dark:bg-yellow-950/30",     border: "border-yellow-200/60 dark:border-yellow-800/40",    text: "text-yellow-700 dark:text-yellow-300",   accent: "#ca8a04", dot: "bg-yellow-400",  light: "bg-yellow-100 dark:bg-yellow-900/50" },
  "Hormone":               { bg: "bg-fuchsia-50/60 dark:bg-fuchsia-950/30",   border: "border-fuchsia-200/60 dark:border-fuchsia-800/40",  text: "text-fuchsia-700 dark:text-fuchsia-300", accent: "#c026d3", dot: "bg-fuchsia-400", light: "bg-fuchsia-100 dark:bg-fuchsia-900/50" },
  "Weitere":               { bg: "bg-stone-50/60 dark:bg-stone-800/40",       border: "border-stone-200/60 dark:border-stone-700/50",      text: "text-stone-600 dark:text-stone-300",     accent: "#78716c", dot: "bg-stone-400",   light: "bg-stone-100 dark:bg-stone-800" },
};
const getCatColor = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS["Weitere"];

/* ─── SHORT MARKER EXPLANATIONS ─────────────────────────────────── */
const MARKER_EXPLANATIONS: Record<string, string> = {
  hb: "Transportiert Sauerstoff im Blut. Niedrig = Müdigkeit, hoch = Dehydration oder andere Ursachen.",
  hct: "Anteil roter Blutkörperchen am Gesamtblut. Zeigt Sauerstoff-Transportkapazität.",
  wbc: "Deine Immunzellen. Erhöht bei Infektionen oder chronischer Entzündung.",
  plt: "Zuständig für Blutgerinnung. Zu niedrig = Blutungsrisiko, zu hoch = Thromboserisiko.",
  glucose: "Dein Blutzucker im Nüchternzustand. Zentral für Stoffwechselgesundheit und Diabetes-Prävention.",
  hba1c: "Langzeit-Blutzucker der letzten 3 Monate. Der wichtigste Marker für metabolische Gesundheit.",
  insulin: "Zeigt wie viel Insulin dein Körper produziert. Frühwarnsystem für Insulinresistenz.",
  homa_ir: "Berechnet aus Glukose und Insulin. Der beste Einzelwert um Insulinresistenz zu erkennen.",
  uric_acid: "Stoffwechsel-Endprodukt. Erhöht bei Gicht, aber auch Marker für Herz-Kreislauf-Risiko.",
  chol_total: "Gesamtcholesterin — allein wenig aussagekräftig, erst im Kontext mit LDL/HDL/ApoB relevant.",
  ldl: "Sogenanntes 'schlechtes' Cholesterin. Lagert sich in Gefäßwänden ab und fördert Arteriosklerose.",
  hdl: "Sogenanntes 'gutes' Cholesterin. Transportiert Cholesterin zurück zur Leber zur Entsorgung.",
  trig: "Blutfette — steigen durch Zucker, Alkohol und gesättigte Fette. Nüchternwert am aussagekräftigsten.",
  apob: "Zählt die atherogenen Partikel direkt. Besserer Risikomarker als LDL allein.",
  lpa: "Genetisch bestimmt — einmal messen reicht. Erhöht = höheres Herz-Kreislauf-Risiko.",
  crp: "Hochsensitiver Entzündungsmarker. Chronisch erhöht = stille Entzündung im Körper.",
  ferritin: "Dein Eisenspeicher. Zu niedrig = Müdigkeit. Zu hoch = Entzündung oder Eisenüberladung.",
  homocysteine: "Aminosäure im Blut. Erhöht bei B12/Folat-Mangel — Risiko für Herz und Gehirn.",
  esr: "Blutsenkungsgeschwindigkeit. Unspezifischer Entzündungsmarker — zeigt ob 'etwas los ist'.",
  tsh: "Steuerhormon der Schilddrüse. Zu hoch = Unterfunktion, zu niedrig = Überfunktion.",
  ft3: "Das aktive Schilddrüsenhormon. Verantwortlich für Energielevel und Stoffwechsel.",
  ft4: "Vorstufe des aktiven T3. Wird in der Schilddrüse produziert.",
  alt: "Leberenzym — sehr empfindlich für Leberstress. Steigt bei Fettleber, Alkohol, Medikamenten.",
  ast: "Leber- und Muskelenzym. Erhöht nach Sport, bei Lebererkrankungen oder Muskelverletzungen.",
  ggt: "Reagiert stark auf Alkohol und Medikamente. Auch unabhängiger Herz-Kreislauf-Risikomarker.",
  alp: "Knochen- und Leberenzym. Erhöht bei Knochenumbau, Gallenstau oder Lebererkrankungen.",
  creatinine: "Abbauprodukt aus Muskeln. Zeigt wie gut deine Nieren filtern.",
  egfr: "Geschätzte Filtrationsrate der Nieren. Sinkt natürlich mit dem Alter.",
  cystatin_c: "Präziserer Nierenmarker als Kreatinin — unabhängig von Muskelmasse.",
  bun: "Harnstoff — Endprodukt des Eiweißstoffwechsels. Zeigt Nierenfunktion und Hydrationsstatus.",
  vitd: "Das 'Sonnenvitamin'. Wichtig für Immunsystem, Knochen und Stimmung. Im Winter oft zu niedrig.",
  b12: "Essentiell für Nerven und Blutbildung. Mangel häufig bei vegetarischer Ernährung.",
  folate: "Wichtig für DNA-Reparatur und Zellteilung. Oft zu niedrig ohne grünes Gemüse.",
  iron: "Verfügbares Eisen im Blut. Schwankt stark — immer zusammen mit Ferritin betrachten.",
  magnesium: "Beteiligt an über 300 Enzymreaktionen. Serum-Wert zeigt nur 1% der Gesamtspeicher.",
  zinc: "Wichtig für Immunsystem und Hormonproduktion. Mangel häufiger als gedacht.",
  omega3_index: "EPA+DHA-Anteil in roten Blutkörperchen. Zeigt den Omega-3-Status der letzten 3 Monate.",
  testosterone_total: "Hauptsächlich männliches Hormon. Sinkt ab 30 um ca. 1% pro Jahr.",
  dhea_s: "Anti-Aging-Hormon. Sinkt mit dem Alter stärker als jedes andere Hormon.",
  cortisol: "Stresshormon — morgens am höchsten. Chronisch erhöht = Schlafprobleme, Gewichtszunahme.",
  igf1: "Wachstumsfaktor. Moderate Werte scheinen optimal — zu hoch und zu niedrig haben Nachteile.",
  albumin: "Zeigt Ernährungs- und Leberstatus. Niedrig bei Mangelernährung oder Lebererkrankungen.",
  ldh: "Gewebeschadens-Marker. Erhöht bei Verletzungen, Infektionen oder Bluterkrankungen.",
};

/* ─── MARKER INFLUENCES ─────────────────────────────────────────── */
const MARKER_INFLUENCES: Record<string, { up: string[]; down: string[] }> = {
  glucose: {
    up: ["Zucker & raffinierte Kohlenhydrate", "Bewegungsmangel", "Chronischer Stress & Schlafmangel", "Übergewicht (v.a. viszerales Fett)"],
    down: ["Bewegung nach Mahlzeiten", "Schlafdauer optimieren (7–9 h)", "Ballaststoffreiche Ernährung", "Intervallfasten"],
  },
  hba1c: {
    up: ["Dauerhaft erhöhte Glukosewerte", "Wenig Bewegung", "Verarbeitete Lebensmittel & Zucker", "Stress & Schlafmangel"],
    down: ["Regelmäßiger Sport (bes. Krafttraining)", "Low-Carb oder mediterrane Ernährung", "Gewichtsreduktion bei Übergewicht", "Guter Schlaf (7–9 h)"],
  },
  insulin: {
    up: ["Häufige kohlenhydratreiche Mahlzeiten", "Übergewicht & Bewegungsmangel", "Schlafmangel & chronischer Stress", "Verarbeiteter Zucker & Fruchtzucker"],
    down: ["Intervallfasten (z.B. 16:8)", "Krafttraining erhöht Insulinsensitivität", "Ballaststoffe verlangsamen Glukoseanstieg", "Gewichtsreduktion"],
  },
  ldl: {
    up: ["Gesättigte Fettsäuren (Butter, rotes Fleisch)", "Trans-Fette (industriell verarbeitet)", "Genetische Prädisposition", "Schilddrüsenunterfunktion"],
    down: ["Statine (Medikament)", "Lösliche Ballaststoffe (Hafer, Hülsenfrüchte)", "Regelmäßiger Ausdauersport", "Mediterrane Ernährung"],
  },
  hdl: {
    up: ["Regelmäßige Bewegung (v.a. Ausdauer)", "Omega-3-reiche Ernährung (Fisch, Nüsse)", "Rauchen aufhören", "Moderater Alkoholkonsum"],
    down: ["Rauchen", "Bewegungsmangel & Übergewicht", "Trans-Fette & stark verarbeitete Lebensmittel", "Sehr fettarme Diäten"],
  },
  trig: {
    up: ["Zucker, Fruchtzucker & raffinierte Kohlenhydrate", "Alkohol", "Übergewicht & metabolisches Syndrom", "Bewegungsmangel"],
    down: ["Omega-3-Fettsäuren (Fischöl)", "Alkohol reduzieren oder weglassen", "Kohlenhydrate reduzieren", "Regelmäßiger Sport"],
  },
  apob: {
    up: ["Hohe LDL- und VLDL-Partikelzahl", "Gesättigte Fette & Transfette", "Übergewicht & Insulinresistenz"],
    down: ["Statine & PCSK9-Inhibitoren", "Lösliche Ballaststoffe", "Mediterrane / pflanzenbetonte Kost", "Gewichtsreduktion"],
  },
  crp: {
    up: ["Aktive Infektionen & Entzündungen", "Übergewicht (viszerales Fett)", "Rauchen", "Verarbeitete Lebensmittel & Zucker"],
    down: ["Regelmäßiger Sport", "Mediterrane Ernährung", "Ausreichend Schlaf", "Stressreduktion (Meditation, etc.)"],
  },
  ferritin: {
    up: ["Eisenreiche Ernährung (rotes Fleisch)", "Aktive Entzündungen im Körper", "Regelmäßiger Alkohol", "Hämochromatose (genetisch)"],
    down: ["Blutspende (bei Männern mit hohen Werten)", "Pflanzenbetonte Ernährung", "Phytate (Getreide, Hülsenfrüchte) hemmen Eisenaufnahme"],
  },
  tsh: {
    up: ["Jodmangel", "Autoimmune Schilddrüsenerkrankung (Hashimoto)", "Starker Stress & Schlafentzug", "Selenmangel"],
    down: ["Ausreichend Jod & Selen in der Ernährung", "Levothyroxin-Therapie bei Unterfunktion", "Stressmanagement"],
  },
  vitd: {
    up: ["Direkte Sonneneinstrahlung (UVB, 20–30 min/Tag)", "Vitamin D3-Supplementierung", "Fettreiche Fische (Lachs, Makrele)", "Vitamin-D-reiche Pilze (UV-behandelt)"],
    down: ["Konsequenter Sonnenschutz ohne Supplementierung", "Übergewicht (D3 wird im Fettgewebe gebunden)", "Wenig Sonnenlicht (Österreich Oktober–März)", "Malabsorptionssyndrome"],
  },
  b12: {
    up: ["Tierische Produkte (Fleisch, Eier, Milch)", "B12-Supplementierung (Methylcobalamin)", "Gesunde Magengesundheit (Intrinsic Factor)"],
    down: ["Vegane / vegetarische Ernährung ohne Supplement", "Metformin-Einnahme reduziert Aufnahme", "Magensäureblocker (PPI)", "Alter (Absorptionsfähigkeit sinkt)"],
  },
  alt: {
    up: ["Alkohol", "Fettleber (metabolisch oder alkoholfrei)", "Bestimmte Medikamente (Statine, Paracetamol)", "Intensiver Sport kurz vor Blutabnahme"],
    down: ["Alkohol reduzieren oder weglassen", "Gewichtsreduktion bei Fettleber", "Mediterrane Ernährung", "Kaffee (nachweislich leberschützend)"],
  },
  ggt: {
    up: ["Alkohol (sehr sensitiv)", "Leberschädigende Medikamente", "Übergewicht & metabolisches Syndrom", "Rauchen"],
    down: ["Alkohol reduzieren oder weglassen", "Gewichtsreduktion", "Regelmäßige Bewegung", "Koffein"],
  },
  creatinine: {
    up: ["Hoher Fleischkonsum vor dem Test", "Dehydration", "Intensiver Sport kurz vor Test", "Hohe Muskelmasse (physiologisch)"],
    down: ["Ausreichend Hydrierung", "Weniger rotes Fleisch vor dem Test", "Pflanzliche Ernährung"],
  },
  egfr: {
    up: ["Gute Hydrierung", "Gesunder Blutdruck (unter 130/80)", "Regelmäßige Bewegung", "Normaler Blutzucker"],
    down: ["Chronisch hoher Blutdruck", "Unkontrollierter Diabetes", "NSAID-Schmerzmittel (Ibuprofen) langfristig", "Natürlicher Rückgang mit dem Alter (~1 mL/min/Jahr)"],
  },
  testosterone_total: {
    up: ["Krafttraining (v.a. Kniebeugen, Kreuzheben)", "Ausreichend Schlaf (7–9 h)", "Zink & Vitamin D ausreichend", "Gesundes Körpergewicht"],
    down: ["Alkohol reduziert Produktion", "Übergewicht & Insulinresistenz", "Chronischer Stress (Cortisol hemmt T)", "Schlafmangel"],
  },
  omega3_index: {
    up: ["Fettreicher Fisch 2–3× pro Woche", "Hochdosierte Fischöl-Kapseln (EPA/DHA)", "Algenöl (vegane Alternative)"],
    down: ["Omega-6-reiche Ernährung (Sonnenblumenöl)", "Kein Fisch und kein Fischöl-Supplement"],
  },
  magnesium: {
    up: ["Nüsse & Samen (Kürbiskerne, Mandeln)", "Grünes Blattgemüse (Spinat, Mangold)", "Magnesium-Glycinat oder -Malat (Supplement)", "Hülsenfrüchte & Vollkornprodukte"],
    down: ["Alkohol erhöht Ausscheidung über Nieren", "Chronischer Stress", "Diuretika & bestimmte Medikamente", "Stark verarbeitete Ernährung"],
  },
  homocysteine: {
    up: ["Vitamin B12-Mangel", "Folsäure-Mangel", "Vitamin B6-Mangel", "Rauchen & hoher Kaffeekonsum"],
    down: ["B12-Supplementierung (Methylcobalamin)", "Folsäure (v.a. aus grünem Gemüse)", "Vitamin B6-reiche Kost", "Rauchen aufhören"],
  },
  wbc: {
    up: ["Aktive Infektionen (bakteriell/viral)", "Chronische Entzündung", "Rauchen", "Intensiver Sport direkt vor dem Test"],
    down: ["Entzündungsreduzierende Ernährung", "Guter Schlaf & Stressreduktion", "Rauchen aufhören"],
  },
  hb: {
    up: ["Höhentraining", "Ausreichend Eisen, B12 & Folsäure", "Gute Hydrierung"],
    down: ["Eisenmangel (häufigste Ursache bei Frauen)", "Blutung oder hoher Blutverlust", "B12- oder Folsäure-Mangel"],
  },
  cortisol: {
    up: ["Chronischer psychischer Stress", "Schlafmangel", "Übermäßiger Sport", "Koffein (kurzfristig)"],
    down: ["Regelmäßige Entspannung & Meditation", "Ausreichend Schlaf", "Adaptogene (Ashwagandha)", "Moderate Bewegung"],
  },
};

/* ─── SHARED UI ─────────────────────────────────────────────────── */
function RangeBar({ value, marker, sex, showLongevity }: { value: number; marker: BloodMarker; sex: string; showLongevity: boolean }) {
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;
  const dMin = Math.min(refMin * 0.5, value * 0.8, 0);
  const dMax = Math.max(refMax * 1.3, value * 1.2);
  const rng = dMax - dMin || 1;
  const toP = (v: number) => Math.max(0, Math.min(100, ((v - dMin) / rng) * 100));
  const si = getStatus(value, marker, sex);
  return (
    <div className="relative h-10 mt-3">
      <div className="absolute top-[14px] left-0 right-0 h-3 rounded-full bg-slate-100 dark:bg-stone-800" />
      <div className="absolute top-[14px] h-3 rounded-full bg-amber-200/50" style={{ left: `${toP(refMin)}%`, width: `${toP(refMax)-toP(refMin)}%` }} />
      {showLongevity && <div className="absolute top-[12px] h-4 rounded-full bg-emerald-300/60 border border-emerald-400/30" style={{ left: `${toP(optMin)}%`, width: `${toP(optMax)-toP(optMin)}%` }} />}
      <div className="absolute top-[8px] w-7 h-7 rounded-full border-[3px] border-white z-[2] transition-all duration-500 ease-out shadow-md" style={{ left: `calc(${toP(value)}% - 14px)`, background: si.color }} />
      <div className="absolute top-[28px] text-[10px] text-stone-400 dark:text-stone-500" style={{ left: `${toP(refMin)}%`, transform: "translateX(-50%)" }}>{refMin}</div>
      <div className="absolute top-[28px] text-[10px] text-stone-400 dark:text-stone-500" style={{ left: `${toP(refMax)}%`, transform: "translateX(-50%)" }}>{refMax}</div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data)*0.9, mx = Math.max(...data)*1.1, rng = mx-mn||1, w=140, h=36;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return (<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{data.map((v,i)=><circle key={i} cx={(i/(data.length-1))*w} cy={h-((v-mn)/rng)*h} r={i===data.length-1?4:2} fill={i===data.length-1?color:color+"80"} />)}</svg>);
}

/* ─── MARKER HISTORY CHART ──────────────────────────────────────── */
function MarkerHistoryChart({ history, marker, sex, showLongevity }: {
  history: { date: string; value: number }[];
  marker: BloodMarker;
  sex: string;
  showLongevity: boolean;
}) {
  if (!history || history.length === 0) return null;
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;
  const W = 560, H = 180;
  const PAD = { top: 12, right: 20, bottom: 36, left: 48 };
  const pw = W - PAD.left - PAD.right;
  const ph = H - PAD.top - PAD.bottom;
  const allVals = history.map(h => h.value);
  const rawMin = Math.min(refMin, ...allVals);
  const rawMax = Math.max(refMax, ...allVals);
  const pad = (rawMax - rawMin) * 0.15 || 1;
  const yMin = Math.max(0, rawMin - pad);
  const yMax = rawMax + pad;
  const yRange = yMax - yMin || 1;
  const xOf = (i: number) => PAD.left + (history.length === 1 ? pw / 2 : (i / (history.length - 1)) * pw);
  const yOf = (v: number) => PAD.top + ph - ((v - yMin) / yRange) * ph;
  const ticks = [0, 1, 2, 3].map(i => {
    const v = yMin + (yRange * i) / 3;
    const label = v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v).toString();
    return { y: yOf(v), label };
  });
  const pts = history.map((h, i) => ({ x: xOf(i), y: yOf(h.value), value: h.value, date: h.date }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length-1].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${pts[0].x.toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`;
  const si = getStatus(history[history.length - 1].value, marker, sex);
  const refY1 = yOf(refMax), refH = Math.max(0, yOf(refMin) - yOf(refMax));
  const optY1 = yOf(optMax), optH = Math.max(0, yOf(optMin) - yOf(optMax));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <rect x={PAD.left} y={refY1} width={pw} height={refH} fill="#d97706" fillOpacity="0.1" />
      {showLongevity && <rect x={PAD.left} y={optY1} width={pw} height={optH} fill="#059669" fillOpacity="0.12" />}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="#a8a29e" strokeOpacity="0.25" strokeWidth="1" />
          <text x={PAD.left - 5} y={t.y + 4} textAnchor="end" fontSize="9" fill="#a8a29e" fontFamily="-apple-system,sans-serif">{t.label}</text>
        </g>
      ))}
      <path d={areaPath} fill={si.color} fillOpacity="0.07" />
      <path d={linePath} fill="none" stroke={si.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 6 : 4} fill={si.color} stroke="white" strokeWidth="2.5">
          <title>{new Date(p.date).toLocaleDateString("de-AT", { day: "numeric", month: "short", year: "numeric" })}: {p.value} {marker.unit}</title>
        </circle>
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="#a8a29e" fontFamily="-apple-system,sans-serif">
          {new Date(p.date).toLocaleDateString("de-AT", { month: "short", year: "2-digit" })}
        </text>
      ))}
      <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} stroke="#d6d3d1" strokeWidth="1" />
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke="#d6d3d1" strokeWidth="1" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { l:string; cls:string; i:string }> = {
    optimal:{ l:"Optimal", cls:"text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50", i:"✓" },
    normal: { l:"Normal",  cls:"text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50",       i:"~" },
    low:    { l:"Niedrig", cls:"text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/50",                i:"↓" },
    high:   { l:"Hoch",    cls:"text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-950/50",                i:"↑" },
  };
  const s = c[status] || c.normal;
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.i} {s.l}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  if (priority === "essential") return <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" title="Wichtiger Marker" />;
  if (priority === "recommended") return <span className="w-2 h-2 rounded-full bg-stone-300 inline-block" title="Empfohlen" />;
  return null;
}

function DeltaIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / previous) * 100) : 0;
  if (Math.abs(pct) < 1) return <span className="text-xs text-stone-400 dark:text-stone-500">unverändert</span>;
  const up = diff > 0;
  return <span className={`text-xs font-medium ${up ? "text-rose-500" : "text-emerald-600"}`}>{up ? "↑" : "↓"} {Math.abs(pct)}%</span>;
}

function Disclaimer() {
  return <div className="p-4 rounded-xl text-sm text-stone-500 bg-stone-50 mt-8 leading-relaxed border-l-[3px] border-stone-300 dark:text-stone-400 dark:bg-stone-900 dark:border-stone-700"><strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool inspiriert von der Longevity-Medizin. Bitte konsultiere immer einen Arzt. Optimale Bereiche stammen aus publizierter Forschung und gelten möglicherweise nicht für deine individuelle Situation.</div>;
}

/* ─── LONGEVITY TOGGLE ──────────────────────────────────────────── */
function LongevityToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        enabled
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
          : "bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-700 dark:hover:bg-stone-800"
      }`}
    >
      <div className={`w-8 h-[18px] rounded-full flex items-center transition-all ${enabled ? "bg-emerald-500 justify-end" : "bg-stone-300 justify-start dark:bg-stone-600"}`}>
        <div className="w-3.5 h-3.5 rounded-full bg-white mx-0.5 shadow-sm" />
      </div>
      <span>{enabled ? "Longevity-Optimal an" : "Longevity-Optimal"}</span>
    </button>
  );
}

/* ─── THEME TOGGLE ──────────────────────────────────────────────── */
function ThemeToggle({ theme, setTheme }: { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Zu hellem Modus wechseln" : "Zu dunklem Modus wechseln"}
      title={isDark ? "Hell" : "Dunkel"}
      className="w-11 h-11 flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
    >
      {isDark ? (
        /* Sun icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
      ) : (
        /* Moon icon */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
      )}
    </button>
  );
}

/* ─── VITALIS LOGO ──────────────────────────────────────────────── */
function VitalisLogo() {
  return (
    <svg viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg"
         className="h-8 w-auto text-stone-900 dark:text-stone-100" aria-label="Vitalis">
      {/* Mark */}
      <rect x="0" y="4" width="32" height="32" rx="8" fill="#0d9488"/>
      <line x1="9" y1="13" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="23" y1="13" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="24" r="1.75" fill="white"/>
      {/* Wordmark — fill="currentColor" übernimmt text-stone-900 / dark:text-stone-100 */}
      <text x="44" y="26"
            fontFamily="'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif"
            fontSize="19" fontWeight="500" letterSpacing="-0.3"
            fill="currentColor">vitalis</text>
    </svg>
  );
}

/* ─── CATEGORY HEADER ───────────────────────────────────────────── */
function CategoryHeader({ category }: { category: string }) {
  const cc = getCatColor(category);
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${cc.border}`}>
      <span className={`w-3 h-3 rounded-full ${cc.dot}`} />
      <h3 className={`text-sm font-semibold uppercase tracking-widest ${cc.text}`}>{category}</h3>
    </div>
  );
}

/* ─── HEADER ────────────────────────────────────────────────────── */
function AppHeader({ user, screen, setScreen, onLogout, theme, setTheme }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [{ l: "Dashboard", s: "dashboard" }, { l: "Verlauf", s: "history" }, { l: "Profil", s: "profile" }];
  const go = (s: string) => { setScreen(s); setMenuOpen(false); };

  useEffect(() => { setMenuOpen(false); }, [screen]);

  return (
    <header className="px-6 py-3 border-b border-stone-100 bg-stone-50/80 backdrop-blur-lg sticky top-0 z-50 dark:border-stone-800 dark:bg-stone-950/80">
      <div className="flex justify-between items-center">
        <div className="flex items-center cursor-pointer min-h-11" onClick={() => { setScreen(user ? "dashboard" : "landing"); setMenuOpen(false); }}>
          <VitalisLogo />
        </div>
        {user ? (
          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(n => (
                <button key={n.s} onClick={() => setScreen(n.s)} className={`min-h-11 px-4 py-2 rounded-lg text-sm transition-colors ${screen === n.s ? "text-teal-600 font-semibold bg-teal-50 dark:text-teal-400 dark:bg-teal-950/40" : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"}`}>{n.l}</button>
              ))}
              <button onClick={onLogout} className="min-h-11 px-4 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors ml-2 dark:text-stone-500 dark:hover:text-stone-300">Abmelden</button>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </nav>
            {/* Mobile: theme toggle + hamburger */}
            <div className="md:hidden flex items-center gap-1">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
                aria-expanded={menuOpen}
                className="w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <span className={`block w-5 h-0.5 bg-stone-700 dark:bg-stone-300 transition-transform duration-200 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`block w-5 h-0.5 bg-stone-700 dark:bg-stone-300 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-stone-700 dark:bg-stone-300 transition-transform duration-200 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </button>
            </div>
          </>
        ) : (
          /* Logged-out users still get theme toggle */
          <ThemeToggle theme={theme} setTheme={setTheme} />
        )}
      </div>
      {/* Mobile dropdown panel */}
      {user && menuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-stone-100 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200 dark:border-stone-800">
          {navItems.map(n => (
            <button key={n.s} onClick={() => go(n.s)} className={`min-h-11 w-full text-left px-4 py-3 rounded-lg text-base transition-colors ${screen === n.s ? "text-teal-600 font-semibold bg-teal-50 dark:text-teal-400 dark:bg-teal-950/40" : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"}`}>{n.l}</button>
          ))}
          <button onClick={() => { onLogout(); setMenuOpen(false); }} className="min-h-11 w-full text-left px-4 py-3 rounded-lg text-sm text-stone-500 hover:bg-stone-100 transition-colors dark:text-stone-400 dark:hover:bg-stone-800">Abmelden</button>
        </nav>
      )}
    </header>
  );
}

/* ─── ONBOARDING / LANDING ──────────────────────────────────────── */
function LandingScreen({ setScreen }: { setScreen: (s:string)=>void }) {
  return (
    <div className="px-6 max-w-4xl mx-auto">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="text-center pt-20 pb-16">
        <div className="mx-auto mb-8 w-16 h-16">
          <img src="/brand/mark.svg" alt="Vitalis" className="w-full h-full drop-shadow-lg" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] mb-6 tracking-tight">
          Deine Blutwerte,<br />
          <span className="text-teal-600 dark:text-teal-400">optimiert verstanden.</span>
        </h1>
        <p className="text-lg text-stone-500 dark:text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed">
          Nicht nur ob deine Werte „normal" sind — sondern ob sie <em>optimal</em> für ein langes, gesundes Leben sind. Basierend auf Longevity-Medizin nach Dr. Peter Attia.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-12">
          <button onClick={()=>setScreen("signup")} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">Kostenlos starten</button>
          <button onClick={()=>setScreen("login")} className="px-8 py-4 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-base hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-stone-700 dark:text-stone-300">Anmelden</button>
        </div>
        {/* Trust chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { icon: "🇦🇹", label: "Österreichische Referenzwerte" },
            { icon: "🔒", label: "DSGVO-konform" },
            { icon: "🏥", label: "Kein Datenweitergabe" },
            { icon: "✦",  label: "Longevity-optimale Bereiche" },
          ].map((c) => (
            <span key={c.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-300">
              <span>{c.icon}</span>{c.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Feature Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: "📊",
            title: "Mehr als Referenzwerte",
            desc: "Standard-Labore sagen dir ob etwas 'normal' ist. Vitalis zeigt dir den optimalen Bereich — für maximale Gesundheit, nicht nur Krankheitsvermeidung.",
          },
          {
            icon: "📈",
            title: "Trend über Zeit",
            desc: "Vergleiche deine Werte über Monate und Jahre. Sieh auf einen Blick was sich verbessert und wo du Aufmerksamkeit brauchst.",
          },
          {
            icon: "🔒",
            title: "Privat & sicher",
            desc: "Deine Gesundheitsdaten gehören nur dir. Verschlüsselt, DSGVO-konform, kein Tracking, kein Datenverkauf — made in Austria.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-sm font-semibold mb-2 text-stone-900 dark:text-stone-100">{f.title}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── EU / DSGVO Trust Banner ──────────────────────────────── */}
      <div className="rounded-2xl border border-teal-200/60 dark:border-teal-800/40 bg-teal-50/60 dark:bg-teal-950/30 p-6 mb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white text-lg">🇪🇺</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-0.5">Europäischer Datenschutz. Kein Kompromiss.</p>
            <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">Deine Daten werden ausschließlich auf EU-Servern gespeichert — DSGVO-konform, ohne Weitergabe an Dritte. Kein US-Cloud-Anbieter, kein Tracking, keine Werbung.</p>
          </div>
          <button onClick={()=>setScreen("privacy")} className="flex-shrink-0 text-xs text-teal-600 dark:text-teal-400 hover:underline underline-offset-4 whitespace-nowrap">Datenschutz lesen →</button>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="text-center pb-16">
        <p className="text-sm text-stone-400 dark:text-stone-500">Gemacht in Österreich 🇦🇹 · <button onClick={()=>setScreen("privacy")} className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors underline underline-offset-4">Datenschutz</button></p>
      </div>

    </div>
  );
}

/* ─── AUTH ───────────────────────────────────────────────────────── */
function AuthScreen({ isSignup, authEmail, setAuthEmail, authPass, setAuthPass, authName, setAuthName, profileSex, setProfileSex, profileBirthYear, setProfileBirthYear, authLoading, onSignup, onLogin, setScreen }: any) {
  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-8">
        <h2 className="font-display text-3xl mb-2">{isSignup ? "Konto erstellen" : "Willkommen zurück"}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">{isSignup ? "Starte jetzt mit deinem persönlichen Longevity-Dashboard." : "Melde dich an."}</p>
        {isSignup && <div className="mb-5"><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Name</label><input value={authName} onChange={(e:any)=>setAuthName(e.target.value)} placeholder="Dein Name" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>}
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Email</label><input type="email" value={authEmail} onChange={(e:any)=>setAuthEmail(e.target.value)} placeholder="du@beispiel.com" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Passwort</label><input type="password" value={authPass} onChange={(e:any)=>setAuthPass(e.target.value)} placeholder="Min. 8 Zeichen" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>
        {isSignup && (<><div className="grid grid-cols-2 gap-4 mb-5"><div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Biologisches Geschlecht</label><select value={profileSex} onChange={(e:any)=>setProfileSex(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base bg-white dark:bg-stone-900"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Geburtsjahr</label><input type="number" value={profileBirthYear} onChange={(e:any)=>setProfileBirthYear(e.target.value)} min="1920" max="2010" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none" /></div></div><p className="text-xs text-stone-400 dark:text-stone-500 -mt-2 mb-5">Geschlecht und Alter beeinflussen die Referenzwerte.</p></>)}
        <button onClick={isSignup?onSignup:onLogin} disabled={authLoading} className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 disabled:opacity-50 transition-colors">{authLoading?"Laden…":isSignup?"Konto erstellen":"Anmelden"}</button>
        <p className="text-center text-sm text-stone-400 dark:text-stone-500 mt-5">{isSignup?"Schon ein Konto? ":"Noch kein Konto? "}<span className="text-teal-600 cursor-pointer font-medium hover:underline" onClick={()=>setScreen(isSignup?"login":"signup")}>{isSignup?"Anmelden":"Registrieren"}</span></p>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────────── */
function DashboardScreen({ panels, profile, user, sex, setScreen, setPanelValues, setPanelCategory, getHistory, showLongevity, setShowLongevity, onSelectMarker }: any) {
  const latest = panels[panels.length-1];
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";
  if (!latest) return (
    <div className="max-w-lg mx-auto mt-20 px-6 text-center">
      <div className="text-7xl mb-6">🩸</div>
      <h2 className="font-display text-3xl mb-4">Dein erstes Blutbild</h2>
      <p className="text-stone-500 dark:text-stone-400 text-base mb-8 leading-relaxed">Gib deine letzten Blutwerte ein und sieh sofort wie sie im Vergleich zu Referenz- und optimalen Bereichen abschneiden.</p>
      <button onClick={()=>{setPanelValues({});setPanelCategory(CATEGORY_ORDER[0]);setScreen("addpanel");}} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">+ Blutbild hinzufügen</button>
      <Disclaimer />
    </div>);
  const counts: any = {optimal:0,normal:0,low:0,high:0};
  latest.values.forEach((v:any)=>{const m=BLOOD_MARKERS.find(bm=>bm.id===v.markerId);if(m)counts[getStatus(v.value,m,sex).status]++;});
  const total = latest.values.length;
  const optPct = total > 0 ? Math.round((counts.optimal / total) * 100) : 0;
  
  const prevPanel = panels.length > 1 ? panels[panels.length - 2] : null;
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div><h1 className="font-display text-3xl mb-1">Hallo {displayName}</h1><p className="text-base text-stone-500 dark:text-stone-400">{new Date(latest.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}{latest.lab_name&&` · ${latest.lab_name}`} · {total} Marker</p></div>
        <div className="flex gap-2 flex-wrap">
          <LongevityToggle enabled={showLongevity} onToggle={() => setShowLongevity(!showLongevity)} />
          <button onClick={()=>{setPanelValues({});setPanelCategory(CATEGORY_ORDER[0]);setScreen("addpanel");}} className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">+ Neues Panel</button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-slate-100 dark:stroke-stone-800" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray={`${optPct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-emerald-600">{optPct}%</span></div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base font-medium text-stone-700 dark:text-stone-200 mb-3">{optPct >= 70 ? "Sehr gut — die meisten Werte sind optimal" : optPct >= 40 ? "Solide Basis — einige Werte verdienen Aufmerksamkeit" : "Mehrere Werte liegen außerhalb des optimalen Bereichs"}</p>
            <div className="flex gap-5 flex-wrap">
              {[{l:"Optimal",c:counts.optimal,cls:"text-emerald-600"},{l:"Normal",c:counts.normal,cls:"text-amber-600"},{l:"Kritisch",c:counts.low+counts.high,cls:"text-red-600"}].map((s,i)=>(
                <div key={i} className="flex items-center gap-2"><span className={`text-2xl font-bold ${s.cls}`}>{s.c}</span><span className="text-sm text-stone-500 dark:text-stone-400">{s.l}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Longevity legend when enabled */}
      {showLongevity && (
        <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded bg-amber-200/70" />
            <span>Referenzbereich</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded bg-emerald-300/80 border border-emerald-400/30" />
            <span>Longevity-Optimal (nach Attia)</span>
          </div>
        </div>
      )}

      {/* Markers by Category */}
      {getSortedCategories().map(cat => {
        const cc = getCatColor(cat);
        const cv = latest.values.filter((v:any)=>BLOOD_MARKERS.find(bm=>bm.id===v.markerId)?.category===cat);
        if(!cv.length) return null;
        return (
          <div key={cat} className="mb-8">
            <CategoryHeader category={cat} />
            <div className="flex flex-col gap-3">
              {cv.map((v:any) => {
                const marker = BLOOD_MARKERS.find(m=>m.id===v.markerId); if(!marker) return null;
                const si = getStatus(v.value,marker,sex);
                const hist = getHistory(marker.id);
                const sx = sex==="female"?"f":"m";
                const prevVal = prevPanel?.values.find((pv:any) => pv.markerId === v.markerId);
                const [showNote, setShowNote] = useState(false);
                const explanation = MARKER_EXPLANATIONS[marker.id];
                return (
                  <div key={v.markerId} className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow ${cc.bg} ${cc.border}`}>
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2.5 mb-1">
                          <PriorityDot priority={marker.priority} />
                          <span className="font-semibold text-base">{marker.name}</span>
                          <StatusBadge status={si.status} />
                          {prevVal && <DeltaIndicator current={v.value} previous={prevVal.value} />}
                        </div>
                        <div className="text-sm text-stone-400 dark:text-stone-500">{marker.name_de} · {marker.description_de}</div>
                        {explanation && <div className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed max-w-lg">{explanation}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold leading-none" style={{color:si.color}}>{v.value}</div>
                        <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{marker.unit}</div>
                      </div>
                      {hist.length >= 2 && <Sparkline data={hist.map((h:any)=>h.value)} color={si.color} />}
                    </div>
                    <RangeBar value={v.value} marker={marker} sex={sex} showLongevity={showLongevity} />
                    <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                      <div className="flex gap-5 text-xs text-stone-400 dark:text-stone-500">
                        <span>Referenz: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                        {showLongevity && <span className="text-emerald-600 font-medium">Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {showLongevity && marker.longevity_note && <button onClick={()=>setShowNote(!showNote)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{showNote ? "Weniger ▴" : "Longevity-Info ▾"}</button>}
                        <button onClick={()=>onSelectMarker(v.markerId)} className="text-xs text-stone-400 dark:text-stone-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">Details →</button>
                      </div>
                    </div>
                    {showNote && showLongevity && marker.longevity_note && <div className="mt-3 p-3 rounded-xl bg-teal-50 text-sm text-teal-800 leading-relaxed dark:bg-teal-950/40 dark:text-teal-200">{marker.longevity_note}</div>}
                    {hist.length >= 2 && <div className="flex gap-2 mt-2 flex-wrap">{hist.map((h:any,i:number)=><span key={i} className="text-[11px] text-stone-400 dark:text-stone-500 bg-white/60 dark:bg-stone-800/60 px-2.5 py-1 rounded-lg">{new Date(h.date).toLocaleDateString("de-AT",{month:"short",year:"2-digit"})}: {h.value}</span>)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── ADD PANEL ──────────────────────────────────────────────────── */
function AddPanelScreen({ sex, panelDate, setPanelDate, panelLab, setPanelLab, panelValues, setPanelValues, panelCategory, setPanelCategory, saving, onSave, setScreen }: any) {
  const sx = sex==="female"?"f":"m";
  const [filter, setFilter] = useState<"all"|"essential"|"recommended">("essential");
  const filtered = BLOOD_MARKERS.filter(m => m.category === panelCategory).filter(m => filter === "all" ? true : filter === "essential" ? m.priority === "essential" : m.priority !== "extended");
  const filledCount = Object.values(panelValues).filter((v:any) => v !== "" && v !== undefined).length;
  const cc = getCatColor(panelCategory);
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen("dashboard")} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-4 transition-colors">← Zurück</button>
      <h2 className="font-display text-3xl mb-2">Blutbild hinzufügen</h2>
      <p className="text-base text-stone-500 dark:text-stone-400 mb-8">Gib die Werte deines letzten Bluttests ein. Du musst nicht alles ausfüllen — nur was auf deinem Befund steht.</p>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Testdatum</label><input type="date" value={panelDate} onChange={(e:any)=>setPanelDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
          <div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Labor (optional)</label><input value={panelLab} onChange={(e:any)=>setPanelLab(e.target.value)} placeholder="z.B. Labordiagnostik Wien" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
        </div>
      </div>
      {/* Category Tabs with colors */}
      <div className="flex gap-1.5 mb-3 flex-wrap">{getSortedCategories().map(cat=>{
        const catC = getCatColor(cat);
        return (<button key={cat} onClick={()=>setPanelCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${panelCategory===cat? `${catC.light} ${catC.text} shadow-sm border ${catC.border}` : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"}`}>{cat}</button>);
      })}</div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">{[{l:"Wichtige",v:"essential" as const},{l:"Empfohlen",v:"recommended" as const},{l:"Alle",v:"all" as const}].map(f=>(<button key={f.v} onClick={()=>setFilter(f.v)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter===f.v?"bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-white":"bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"}`}>{f.l}</button>))}</div>
      {/* Marker Inputs */}
      <div className={`rounded-2xl border shadow-sm p-5 ${cc.bg} ${cc.border}`}>
        {filtered.length === 0 && <p className="text-sm text-stone-400 dark:text-stone-500 py-4 text-center">Keine Marker in dieser Kategorie mit dem aktuellen Filter.</p>}
        {filtered.map(marker => {
          const explanation = MARKER_EXPLANATIONS[marker.id];
          return (
            <div key={marker.id} className="flex items-center gap-4 py-3.5 border-b border-stone-100/50 dark:border-stone-800/50 last:border-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><PriorityDot priority={marker.priority} /><span className="font-medium text-base">{marker.name}</span></div>
                <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{marker.name_de} · Ref: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</div>
                {explanation && <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{explanation}</div>}
              </div>
              <div className="flex items-center gap-2">
                <input type="number" step="any" value={panelValues[marker.id]||""} onChange={(e:any)=>setPanelValues((pv:any)=>({...pv,[marker.id]:e.target.value}))} placeholder="—" className="w-24 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-base text-right focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-stone-900" />
                <span className="text-xs text-stone-400 dark:text-stone-500 min-w-[52px]">{marker.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} disabled={saving||filledCount===0} className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{saving?"Speichern…":`Panel speichern (${filledCount} Werte)`}</button>
        <button onClick={()=>setScreen("dashboard")} className="px-6 py-3.5 border border-stone-200 dark:border-stone-700 rounded-xl text-base hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Abbrechen</button>
      </div>
    </div>
  );
}

/* ─── EDIT PANEL ─────────────────────────────────────────────────── */
function EditPanelScreen({ panel, sex, saving, onSaveEdit, setScreen }: { panel: Panel; sex: string; saving: boolean; onSaveEdit: (panelId: string, date: string, lab: string, values: Record<string,string>) => void; setScreen: (s:string) => void }) {
  const sx = sex === "female" ? "f" : "m";
  const [editDate, setEditDate] = useState(panel.test_date);
  const [editLab, setEditLab] = useState(panel.lab_name || "");
  const [editValues, setEditValues] = useState<Record<string,string>>(() => {
    const vals: Record<string,string> = {};
    panel.values.forEach(v => { vals[v.markerId] = String(v.value); });
    return vals;
  });
  const [editCategory, setEditCategory] = useState(CATEGORY_ORDER[0]);
  const [filter, setFilter] = useState<"all"|"essential"|"recommended">("all");

  const filtered = BLOOD_MARKERS.filter(m => m.category === editCategory).filter(m => filter === "all" ? true : filter === "essential" ? m.priority === "essential" : m.priority !== "extended");
  const filledCount = Object.values(editValues).filter(v => v !== "" && v !== undefined).length;
  const cc = getCatColor(editCategory);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => setScreen("viewpanel")} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-4 transition-colors">← Zurück zum Panel</button>
      <h2 className="font-display text-3xl mb-2">Panel bearbeiten</h2>
      <p className="text-base text-stone-500 dark:text-stone-400 mb-8">Korrigiere oder ergänze deine Werte. Änderungen werden sofort in der Datenbank aktualisiert.</p>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Testdatum</label><input type="date" value={editDate} onChange={(e:any) => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
          <div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Labor (optional)</label><input value={editLab} onChange={(e:any) => setEditLab(e.target.value)} placeholder="z.B. Labordiagnostik Wien" className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
        </div>
      </div>
      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">{getSortedCategories().map(cat => {
        const catC = getCatColor(cat);
        const hasValues = BLOOD_MARKERS.filter(m => m.category === cat).some(m => editValues[m.id] && editValues[m.id] !== "");
        return (
          <button key={cat} onClick={() => setEditCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${editCategory === cat ? `${catC.light} ${catC.text} shadow-sm border ${catC.border}` : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"}`}>
            {cat}
            {hasValues && <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${catC.dot}`} />}
          </button>
        );
      })}</div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">{[{l:"Wichtige",v:"essential" as const},{l:"Empfohlen",v:"recommended" as const},{l:"Alle",v:"all" as const}].map(f=>(<button key={f.v} onClick={()=>setFilter(f.v)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter===f.v?"bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-white":"bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"}`}>{f.l}</button>))}</div>
      {/* Marker Inputs */}
      <div className={`rounded-2xl border shadow-sm p-5 ${cc.bg} ${cc.border}`}>
        {filtered.length === 0 && <p className="text-sm text-stone-400 dark:text-stone-500 py-4 text-center">Keine Marker in dieser Kategorie mit dem aktuellen Filter.</p>}
        {filtered.map(marker => {
          const hasValue = editValues[marker.id] && editValues[marker.id] !== "";
          const explanation = MARKER_EXPLANATIONS[marker.id];
          return (
            <div key={marker.id} className={`flex items-center gap-4 py-3.5 border-b border-stone-100/50 dark:border-stone-800/50 last:border-0 ${hasValue ? "" : "opacity-60"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><PriorityDot priority={marker.priority} /><span className="font-medium text-base">{marker.name}</span>{hasValue && <span className="text-xs text-emerald-600 font-medium">✓</span>}</div>
                <div className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{marker.name_de} · Ref: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</div>
                {explanation && <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{explanation}</div>}
              </div>
              <div className="flex items-center gap-2">
                <input type="number" step="any" value={editValues[marker.id] || ""} onChange={(e:any) => setEditValues(pv => ({ ...pv, [marker.id]: e.target.value }))} placeholder="—" className="w-24 px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-base text-right focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white dark:bg-stone-900" />
                <span className="text-xs text-stone-400 dark:text-stone-500 min-w-[52px]">{marker.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => onSaveEdit(panel.id, editDate, editLab, editValues)} disabled={saving || filledCount === 0} className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{saving ? "Speichern…" : `Änderungen speichern (${filledCount} Werte)`}</button>
        <button onClick={() => setScreen("viewpanel")} className="px-6 py-3.5 border border-stone-200 dark:border-stone-700 rounded-xl text-base hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">Abbrechen</button>
      </div>
    </div>
  );
}

/* ─── VIEW PANEL ────────────────────────────────────────────────── */
function ViewPanelScreen({ currentPanel, panels, sex, setScreen, onDelete, onExportPdf, showLongevity, setShowLongevity, onSelectMarker }: any) {
  const p = currentPanel||panels[panels.length-1]; if(!p) return null;
  const panelIdx = panels.findIndex((pan:Panel) => pan.id === p.id);
  const prevPanel = panelIdx > 0 ? panels[panelIdx - 1] : null;
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen("dashboard")} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-4">← Zurück</button>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div><h2 className="font-display text-3xl mb-1">Panel Ergebnisse</h2><p className="text-base text-stone-500 dark:text-stone-400">{new Date(p.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}{p.lab_name&&` · ${p.lab_name}`} · {p.values.length} Marker</p></div>
        <div className="flex gap-2 flex-wrap">
          <LongevityToggle enabled={showLongevity} onToggle={() => setShowLongevity(!showLongevity)} />
          <button onClick={() => setScreen("editpanel")} className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">✏️ Bearbeiten</button>
          <button onClick={()=>onExportPdf(p)} className="px-4 py-2.5 bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors">📄 PDF Export</button>
          <button onClick={()=>onDelete(p.id)} className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">Löschen</button>
        </div>
      </div>

      {showLongevity && (
        <div className="flex items-center gap-4 mb-6 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded bg-amber-200/70" />
            <span>Referenzbereich</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded bg-emerald-300/80 border border-emerald-400/30" />
            <span>Longevity-Optimal (nach Attia)</span>
          </div>
        </div>
      )}

      {getSortedCategories().map(cat=>{
        const cc = getCatColor(cat);
        const cv=p.values.filter((v:any)=>BLOOD_MARKERS.find(bm=>bm.id===v.markerId)?.category===cat);if(!cv.length) return null;
        return (<div key={cat} className="mb-7">
          <CategoryHeader category={cat} />
          {cv.map((v:any)=>{const marker=BLOOD_MARKERS.find(m=>m.id===v.markerId);if(!marker) return null;const si=getStatus(v.value,marker,sex);const prevVal=prevPanel?.values.find((pv:any)=>pv.markerId===v.markerId);
            const sx = sex==="female"?"f":"m";
            const explanation = MARKER_EXPLANATIONS[marker.id];
            const [showNote, setShowNote] = useState(false);
          return (<div key={v.markerId} className={`rounded-2xl border shadow-sm p-5 mb-3 ${cc.bg} ${cc.border}`}>
            <div className="flex justify-between items-center flex-wrap gap-2"><div className="flex-1"><div className="flex items-center gap-2.5"><PriorityDot priority={marker.priority} /><span className="font-semibold text-base">{marker.name}</span><StatusBadge status={si.status} />{prevVal&&<DeltaIndicator current={v.value} previous={prevVal.value} />}</div>
            <div className="text-sm text-stone-400 dark:text-stone-500">{marker.name_de}</div>
            {explanation && <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed max-w-lg">{explanation}</div>}
            </div><div className="text-xl font-bold" style={{color:si.color}}>{v.value} <span className="text-sm font-normal text-stone-400 dark:text-stone-500">{marker.unit}</span></div></div>
            <RangeBar value={v.value} marker={marker} sex={sex} showLongevity={showLongevity} />
            <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
              <div className="flex gap-5 text-xs text-stone-400 dark:text-stone-500">
                <span>Referenz: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                {showLongevity && <span className="text-emerald-600 font-medium">Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>}
              </div>
              <div className="flex items-center gap-3">
                {showLongevity && marker.longevity_note && <button onClick={()=>setShowNote(!showNote)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{showNote ? "Weniger ▴" : "Longevity-Info ▾"}</button>}
                <button onClick={()=>onSelectMarker(v.markerId)} className="text-xs text-stone-400 dark:text-stone-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors">Details →</button>
              </div>
            </div>
            {showNote && showLongevity && marker.longevity_note && <div className="mt-3 p-3 rounded-xl bg-teal-50 text-sm text-teal-800 leading-relaxed dark:bg-teal-950/40 dark:text-teal-200">{marker.longevity_note}</div>}
          </div>);})}</div>);
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── HISTORY ───────────────────────────────────────────────────── */
function HistoryScreen({ panels, sex, setScreen, setCurrentPanel, getHistory, showLongevity }: any) {
  if(!panels.length) return (<div className="max-w-lg mx-auto mt-16 px-6 text-center"><p className="text-stone-500 dark:text-stone-400 text-base mb-5">Noch keine Panels vorhanden.</p><button onClick={()=>setScreen("addpanel")} className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">+ Panel hinzufügen</button></div>);
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="font-display text-3xl mb-6">Verlauf</h2>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">Alle Panels</h3>
      {[...panels].reverse().map((p:any)=>(<div key={p.id} onClick={()=>{setCurrentPanel(p);setScreen("viewpanel");}} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5 mb-3 cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"><div className="flex justify-between items-center"><div><span className="font-semibold text-base">{new Date(p.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}</span>{p.lab_name&&<span className="text-stone-400 dark:text-stone-500 text-sm ml-3">· {p.lab_name}</span>}</div><span className="text-sm text-stone-500 dark:text-stone-400">{p.values.length} Marker →</span></div></div>))}
      <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-8 mb-3">Trends</h3>
      {BLOOD_MARKERS.filter(m=>m.priority!=="extended").map(marker=>{const h=getHistory(marker.id);if(h.length<2) return null;const lsi=getStatus(h[h.length-1].value,marker,sex);const prev=h[h.length-2];
        const cc = getCatColor(marker.category);
        return (<div key={marker.id} className={`rounded-2xl border shadow-sm p-5 mb-3 ${cc.bg} ${cc.border}`}><div className="flex justify-between items-center flex-wrap gap-3"><div className="flex items-center gap-2"><PriorityDot priority={marker.priority} /><span className="font-semibold text-base">{marker.name}</span><span className="text-sm text-stone-400 dark:text-stone-500">{marker.name_de}</span><DeltaIndicator current={h[h.length-1].value} previous={prev.value} /></div><div className="flex items-center gap-4"><Sparkline data={h.map((x:any)=>x.value)} color={lsi.color} /><div className="text-right"><div className="text-lg font-bold" style={{color:lsi.color}}>{h[h.length-1].value}</div><div className="text-xs text-stone-400 dark:text-stone-500">{marker.unit}</div></div></div></div><div className="flex gap-2 mt-3 flex-wrap">{h.map((x:any,i:number)=><span key={i} className="text-xs text-stone-400 dark:text-stone-500 bg-white/60 dark:bg-stone-800/60 px-2.5 py-1 rounded-lg">{new Date(x.date).toLocaleDateString("de-AT",{month:"short",year:"2-digit"})}: {x.value}</span>)}</div></div>);
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── PROFILE ───────────────────────────────────────────────────── */
function ProfileScreenView({ user, profile, setProfile, onUpdateProfile, onLogout, setScreen }: any) {
  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="font-display text-3xl mb-6">Profil</h2>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 mb-4">
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Name</label><input value={profile?.display_name||""} onChange={(e:any)=>setProfile((p:any)=>p?{...p,display_name:e.target.value}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none" /></div>
        <div className="mb-5 opacity-60"><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Email</label><input value={user?.email||""} disabled className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base bg-stone-50 dark:bg-stone-900" /></div>
        <div className="grid grid-cols-2 gap-4 mb-5"><div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Biologisches Geschlecht</label><select value={profile?.sex||"male"} onChange={(e:any)=>setProfile((p:any)=>p?{...p,sex:e.target.value}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base bg-white dark:bg-stone-900"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Geburtsjahr</label><input type="number" value={profile?.birth_year||1990} onChange={(e:any)=>setProfile((p:any)=>p?{...p,birth_year:parseInt(e.target.value)}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-base focus:border-teal-500 focus:outline-none" /></div></div>
        <button onClick={()=>profile&&onUpdateProfile({display_name:profile.display_name,sex:profile.sex,birth_year:profile.birth_year})} className="w-full py-3 bg-teal-600 text-white rounded-xl text-base font-medium hover:bg-teal-700 transition-colors">Profil speichern</button>
      </div>
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-6 border-l-[3px] border-l-red-500"><h3 className="text-base font-semibold text-red-600 mb-1">Gefahrenzone</h3><p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Alle Daten permanent löschen.</p><button onClick={()=>{if(confirm("Alle Daten löschen? Das kann nicht rückgängig gemacht werden."))onLogout();}} className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">Alle Daten löschen</button></div>
      <button onClick={()=>setScreen("privacy")} className="mt-5 text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300">Datenschutz →</button>
    </div>
  );
}

/* ─── MARKER DETAIL ─────────────────────────────────────────────── */
function MarkerDetailScreen({ markerId, setScreen, getHistory, sex, showLongevity, markerPrevScreen }: any) {
  const marker = BLOOD_MARKERS.find(m => m.id === markerId);
  if (!marker) return null;
  const history = getHistory(markerId);
  const latest = history[history.length - 1];
  const s = sex === "female" ? "f" : "m";
  const si = latest ? getStatus(latest.value, marker, sex) : null;
  const influences = MARKER_INFLUENCES[markerId];
  const cc = getCatColor(marker.category);
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back */}
      <button onClick={() => setScreen(markerPrevScreen || "dashboard")} className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-6 transition-colors">← Zurück</button>

      {/* Title + Current Value */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${cc.light} ${cc.text}`}>{marker.category}</span>
            <PriorityDot priority={marker.priority} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl mb-1">{marker.name_de}</h1>
          <p className="text-base text-stone-500 dark:text-stone-400">{marker.name} · {marker.unit}</p>
        </div>
        {si && latest && (
          <div className="text-right flex-shrink-0">
            <div className="text-5xl font-bold leading-none" style={{ color: si.color }}>{latest.value}</div>
            <div className="text-sm text-stone-400 dark:text-stone-500 mt-1">{marker.unit}</div>
            <div className="mt-2"><StatusBadge status={si.status} /></div>
          </div>
        )}
      </div>

      {/* Range bar + ranges */}
      {latest && (
        <div className={`rounded-2xl border p-5 mb-6 ${cc.bg} ${cc.border}`}>
          <RangeBar value={latest.value} marker={marker} sex={sex} showLongevity={true} />
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-stone-500 dark:text-stone-400">Referenz: <span className="font-medium text-stone-700 dark:text-stone-200">{marker[`ref_min_${s}` as keyof BloodMarker]}–{marker[`ref_max_${s}` as keyof BloodMarker]} {marker.unit}</span></span>
            <span className="text-emerald-600 dark:text-emerald-400">Longevity-Optimal: <span className="font-medium">{marker[`opt_min_${s}` as keyof BloodMarker]}–{marker[`opt_max_${s}` as keyof BloodMarker]} {marker.unit}</span></span>
          </div>
        </div>
      )}

      {/* History Chart */}
      {history.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Verlauf</h2>
            <span className="text-xs text-stone-400 dark:text-stone-500">{history.length} Messung{history.length !== 1 ? "en" : ""}</span>
          </div>
          <MarkerHistoryChart history={history} marker={marker} sex={sex} showLongevity={showLongevity} />
          <div className="flex gap-2 mt-3 flex-wrap">
            {history.map((h: any, i: number) => (
              <span key={i} className="text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                {new Date(h.date).toLocaleDateString("de-AT", { day: "numeric", month: "short", year: "numeric" })}: <span className="font-medium text-stone-700 dark:text-stone-300">{h.value}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 mb-6 text-center">
          <p className="text-stone-400 dark:text-stone-500 text-sm">Noch keine Messwerte für diesen Marker erfasst.</p>
        </div>
      )}

      {/* About */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5 mb-6">
        <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Was misst dieser Marker?</h2>
        <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-2">{marker.description_de}</p>
        {MARKER_EXPLANATIONS[markerId] && (
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">{MARKER_EXPLANATIONS[markerId]}</p>
        )}
      </div>

      {/* Longevity Note */}
      {marker.longevity_note && (
        <div className="rounded-2xl border border-teal-200/60 dark:border-teal-800/40 bg-teal-50/60 dark:bg-teal-950/30 p-5 mb-6">
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">Longevity-Perspektive</p>
          <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">{marker.longevity_note}</p>
        </div>
      )}

      {/* Influences */}
      {influences && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">Einflussfaktoren</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-2.5">Erhöht den Wert ↑</p>
              <ul className="space-y-2">
                {influences.up.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <span className="text-red-400 mt-0.5 flex-shrink-0 text-[10px]">▲</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 uppercase tracking-wide mb-2.5">Senkt den Wert ↓</p>
              <ul className="space-y-2">
                {influences.down.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-300">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-[10px]">▼</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ranges by sex */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5 mb-8">
        <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">Referenzbereiche</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 dark:border-stone-800">
              <th className="text-left pb-2 font-medium text-stone-400 dark:text-stone-500">Bereich</th>
              <th className="text-right pb-2 font-medium text-stone-400 dark:text-stone-500">Männer</th>
              <th className="text-right pb-2 font-medium text-stone-400 dark:text-stone-500">Frauen</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-stone-50 dark:border-stone-800/50">
              <td className="py-2.5 text-amber-600 dark:text-amber-400 font-medium">Klinischer Referenzbereich</td>
              <td className="text-right py-2.5 text-stone-700 dark:text-stone-300">{marker.ref_min_m}–{marker.ref_max_m} {marker.unit}</td>
              <td className="text-right py-2.5 text-stone-700 dark:text-stone-300">{marker.ref_min_f}–{marker.ref_max_f} {marker.unit}</td>
            </tr>
            <tr>
              <td className="py-2.5 text-emerald-600 dark:text-emerald-400 font-medium">Longevity-Optimal (Attia)</td>
              <td className="text-right py-2.5 text-stone-700 dark:text-stone-300">{marker.opt_min_m}–{marker.opt_max_m} {marker.unit}</td>
              <td className="text-right py-2.5 text-stone-700 dark:text-stone-300">{marker.opt_min_f}–{marker.opt_max_f} {marker.unit}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Disclaimer />
    </div>
  );
}

/* ─── PRIVACY ───────────────────────────────────────────────────── */
function PrivacyScreen({ user, setScreen }: any) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen(user?"dashboard":"landing")} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-4">← Zurück</button>
      <h2 className="font-display text-3xl mb-2">Datenschutz & DSGVO</h2>
      <p className="text-base text-stone-500 dark:text-stone-400 mb-8">Vitalis ist mit Datenschutz als Kernprinzip entwickelt.</p>
      {[{t:"Deine Daten bleiben bei dir",d:"Blutwerte werden in einer gesicherten Datenbank gespeichert, geschützt durch Row Level Security (RLS). Nur du kannst auf deine Daten zugreifen."},{t:"Kein anderer User sieht deine Daten",d:"Die Datenbank erzwingt auf technischer Ebene, dass jeder Nutzer nur seine eigenen Daten sehen kann — selbst bei einem Software-Fehler."},{t:"Deine Rechte nach DSGVO",d:"Du kannst jederzeit alle Daten einsehen, exportieren oder vollständig löschen."},{t:"Kein Medizinprodukt",d:"Vitalis ist ein Bildungstool. Es ist kein zertifiziertes Medizinprodukt. Es stellt keine Diagnosen und gibt keine Behandlungsempfehlungen."},{t:"Optimale Bereiche",d:"Basieren auf publizierter Longevity-Forschung. Pädagogisch, nicht diagnostisch. Bitte immer mit deinem Arzt besprechen."}].map((s,i)=>(<div key={i} className="mb-7"><h3 className="text-lg font-semibold mb-1.5">{s.t}</h3><p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed">{s.d}</p></div>))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP — all state lives here, components receive via props
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Prof|null>(null);
  const [screen, setScreen] = useState("landing");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [currentPanel, setCurrentPanel] = useState<Panel|null>(null);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);
  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [profileSex, setProfileSex] = useState("male");
  const [profileBirthYear, setProfileBirthYear] = useState("1990");
  const [panelDate, setPanelDate] = useState(new Date().toISOString().split("T")[0]);
  const [panelLab, setPanelLab] = useState("");
  const [panelValues, setPanelValues] = useState<Record<string,string>>({});
  const [panelCategory, setPanelCategory] = useState(CATEGORY_ORDER[0]);
  const [saving, setSaving] = useState(false);
  const [showLongevity, setShowLongevity] = useState(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerPrevScreen, setMarkerPrevScreen] = useState("dashboard");

  const openMarkerDetail = (markerId: string, fromScreen = "dashboard") => {
    setSelectedMarkerId(markerId);
    setMarkerPrevScreen(fromScreen);
    setScreen("markerdetail");
  };

  // Initialize theme from DOM (set by inline script in layout.tsx before hydration)
  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // Follow system preference when user has not manually chosen
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("vitalis-theme")) {
        const next = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", e.matches);
        setThemeState(next);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = (next: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("vitalis-theme", next);
    setThemeState(next);
  };

  const notify = (msg:string,type="ok") => {setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);loadPanels(session.user.id);setScreen("dashboard");}
      setLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_ev,session)=>{
      if(session?.user) setUser(session.user); else {setUser(null);setProfile(null);setPanels([]);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (uid:string) => {const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();if(data) setProfile(data);};
  const loadPanels = async (uid:string) => {
    const{data:pd}=await supabase.from("blood_panels").select("*").eq("user_id",uid).order("test_date",{ascending:true});
    if(!pd){setPanels([]);return;}
    const{data:vd}=await supabase.from("blood_values").select("*").eq("user_id",uid);
    setPanels(pd.map(p=>({...p,values:(vd||[]).filter((v:any)=>v.panel_id===p.id).map((v:any)=>({markerId:v.marker_id,value:parseFloat(v.value)}))})));
  };

  const handleSignup = async () => {
    if(!authEmail||!authPass||authPass.length<8){notify("Email & Passwort (min. 8 Zeichen) nötig","err");return;}
    setAuthLoading(true);
    const{data,error}=await supabase.auth.signUp({email:authEmail,password:authPass,options:{data:{display_name:authName||authEmail.split("@")[0]}}});
    if(error){notify(error.message,"err");setAuthLoading(false);return;}
    if(data.user){
      setUser(data.user);await new Promise(r=>setTimeout(r,800));
      await supabase.from("profiles").update({sex:profileSex,birth_year:parseInt(profileBirthYear),display_name:authName||authEmail.split("@")[0]}).eq("id",data.user.id);
      await loadProfile(data.user.id);setScreen("dashboard");setAuthEmail("");setAuthPass("");setAuthName("");notify("Willkommen bei Vitalis!");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if(!authEmail||!authPass){notify("Email & Passwort eingeben","err");return;}
    setAuthLoading(true);
    const{data,error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPass});
    if(error){notify(error.message,"err");setAuthLoading(false);return;}
    setUser(data.user);await loadProfile(data.user.id);await loadPanels(data.user.id);setScreen("dashboard");setAuthEmail("");setAuthPass("");notify("Willkommen zurück!");setAuthLoading(false);
  };

  const handleLogout = async ()=>{await supabase.auth.signOut();setUser(null);setProfile(null);setPanels([]);setScreen("landing");};

  /* ─── Save panel ──────────────────────────────────────────────── */
  const handleSavePanel = async () => {
    const vals = Object.entries(panelValues).filter(([_,v])=>v!==""&&v!==undefined).map(([id,v])=>({markerId:id,value:parseFloat(v as string)})).filter(e=>!isNaN(e.value));
    if(!vals.length){notify("Mindestens einen Wert eingeben","err");return;}
    setSaving(true);
    try {
      const{data:panelRow,error:panelErr}=await supabase.from("blood_panels").insert([{user_id:user.id,test_date:panelDate,lab_name:panelLab||null}]).select().single();
      if(panelErr) throw panelErr;
      if(!panelRow) throw new Error("Panel konnte nicht erstellt werden");
      const valueRows = vals.map(v=>({panel_id:panelRow.id,user_id:user.id,marker_id:v.markerId,value:v.value}));
      const{error:valErr}=await supabase.from("blood_values").insert(valueRows);
      if(valErr) throw valErr;
      await loadPanels(user.id);
      setCurrentPanel({...panelRow,values:vals});
      setPanelValues({});setPanelDate(new Date().toISOString().split("T")[0]);setPanelLab("");
      setScreen("viewpanel");
      notify(`Gespeichert — ${vals.length} Marker erfasst`);
    } catch(e:any) {
      console.error("Save error:",e);
      notify("Fehler beim Speichern: "+(e.message||"Unbekannter Fehler"),"err");
    }
    setSaving(false);
  };

  /* ─── Edit panel (UPDATE existing) ────────────────────────────── */
  const handleEditPanel = async (panelId: string, date: string, lab: string, values: Record<string,string>) => {
    const vals = Object.entries(values).filter(([_,v]) => v !== "" && v !== undefined).map(([id,v]) => ({ markerId: id, value: parseFloat(v as string) })).filter(e => !isNaN(e.value));
    if (!vals.length) { notify("Mindestens einen Wert eingeben", "err"); return; }
    setSaving(true);
    try {
      // Update panel metadata
      const { error: panelErr } = await supabase.from("blood_panels").update({ test_date: date, lab_name: lab || null }).eq("id", panelId);
      if (panelErr) throw panelErr;

      // Delete old values and insert new ones
      const { error: delErr } = await supabase.from("blood_values").delete().eq("panel_id", panelId);
      if (delErr) throw delErr;

      const valueRows = vals.map(v => ({ panel_id: panelId, user_id: user.id, marker_id: v.markerId, value: v.value }));
      const { error: valErr } = await supabase.from("blood_values").insert(valueRows);
      if (valErr) throw valErr;

      await loadPanels(user.id);
      const updatedPanel = { id: panelId, user_id: user.id, test_date: date, lab_name: lab || null, values: vals };
      setCurrentPanel(updatedPanel);
      setScreen("viewpanel");
      notify(`Aktualisiert — ${vals.length} Marker gespeichert`);
    } catch (e: any) {
      console.error("Edit error:", e);
      notify("Fehler beim Aktualisieren: " + (e.message || "Unbekannter Fehler"), "err");
    }
    setSaving(false);
  };

  const handleDeletePanel = async (pid:string)=>{
    if(!confirm("Panel wirklich löschen?")) return;
    await supabase.from("blood_values").delete().eq("panel_id",pid);
    await supabase.from("blood_panels").delete().eq("id",pid);
    await loadPanels(user.id);setScreen("dashboard");notify("Panel gelöscht");
  };

  const handleUpdateProfile = async (updates:Partial<Prof>)=>{
    await supabase.from("profiles").update(updates).eq("id",user.id);
    setProfile(prev=>prev?{...prev,...updates}:null);notify("Profil aktualisiert");
  };

  /* ─── PDF EXPORT ──────────────────────────────────────────────── */
  const handleExportPdf = (panel: Panel) => {
    const sex = profile?.sex || "male";
    const sx = sex === "female" ? "f" : "m";
    const name = profile?.display_name || "Patient";
    const date = new Date(panel.test_date).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });
    
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Vitalis Blutbild — ${date}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;color:#1c1917;padding:40px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #0d9488}
      .logo{display:flex;align-items:center;gap:10px}.logo-box{width:36px;height:36px;background:#0d9488;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}
      .logo-text{font-size:24px;font-weight:400;font-family:Georgia,serif}.meta{text-align:right;font-size:13px;color:#57534e}
      .cat-title{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #f5f5f4}
      .marker-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #fafaf9}
      .marker-name{font-weight:600;font-size:14px}.marker-de{font-size:11px;color:#a8a29e}
      .value{font-size:18px;font-weight:700}.unit{font-size:11px;color:#a8a29e;margin-left:4px}
      .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
      .optimal{background:#ecfdf5;color:#059669}.normal{background:#fffbeb;color:#d97706}.low,.high{background:#fef2f2;color:#dc2626}
      .ranges{font-size:10px;color:#a8a29e;margin-top:2px}
      .disclaimer{margin-top:32px;padding:16px;background:#f5f5f4;border-radius:8px;font-size:11px;color:#78716c;line-height:1.6;border-left:3px solid #d6d3d1}
      .footer{margin-top:24px;text-align:center;font-size:10px;color:#a8a29e}
      @media print{body{padding:20px}@page{margin:1cm}}
    </style></head><body>`;
    html += `<div class="header"><div class="logo"><div class="logo-box">V</div><div class="logo-text">Vitalis</div></div><div class="meta"><strong>${name}</strong><br>${date}${panel.lab_name ? `<br>${panel.lab_name}` : ""}<br>${panel.values.length} Marker</div></div>`;
    
    getSortedCategories().forEach(cat => {
      const cv = panel.values.filter(v => BLOOD_MARKERS.find(bm => bm.id === v.markerId)?.category === cat);
      if (!cv.length) return;
      html += `<div class="cat-title">${cat}</div>`;
      cv.forEach(v => {
        const m = BLOOD_MARKERS.find(bm => bm.id === v.markerId);
        if (!m) return;
        const si = getStatus(v.value, m, sex);
        html += `<div class="marker-row"><div><div class="marker-name">${m.name} <span class="badge ${si.status}">${si.label}</span></div><div class="marker-de">${m.name_de}</div><div class="ranges">Ref: ${m[`ref_min_${sx}` as keyof BloodMarker]}–${m[`ref_max_${sx}` as keyof BloodMarker]} ${m.unit} · Optimal: ${m[`opt_min_${sx}` as keyof BloodMarker]}–${m[`opt_max_${sx}` as keyof BloodMarker]} ${m.unit}</div></div><div style="text-align:right"><span class="value" style="color:${si.color}">${v.value}</span><span class="unit">${m.unit}</span></div></div>`;
      });
    });
    
    html += `<div class="disclaimer"><strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool. Die hier dargestellten optimalen Bereiche basieren auf publizierter Longevity-Forschung und ersetzen keine ärztliche Beratung.</div>`;
    html += `<div class="footer">Erstellt mit Vitalis · vitalis.vercel.app · ${new Date().toLocaleDateString("de-AT")}</div>`;
    html += `</body></html>`;
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => { setTimeout(() => { win.print(); }, 500); };
    }
  };

  const getHistory = (mid:string)=>panels.filter(p=>p.values.some(v=>v.markerId===mid)).map(p=>({date:p.test_date,value:p.values.find(v=>v.markerId===mid)?.value!})).filter(h=>h.value!==undefined).sort((a,b)=>a.date.localeCompare(b.date));
  const sex = profile?.sex||"male";

  if(loading) return (<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-teal-600/20">V</div><div className="text-stone-400 dark:text-stone-500 text-base">Laden…</div></div></div>);

  return (<>
    <AppHeader user={user} screen={screen} setScreen={setScreen} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
    {toast&&<div className={`toast-animate fixed top-[72px] left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-xl text-sm font-medium shadow-lg z-[200] ${toast.type==="err"?"bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300":"bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>{toast.msg}</div>}
    {screen==="landing"&&<LandingScreen setScreen={setScreen} />}
    {screen==="login"&&<AuthScreen isSignup={false} authEmail={authEmail} setAuthEmail={setAuthEmail} authPass={authPass} setAuthPass={setAuthPass} authName={authName} setAuthName={setAuthName} profileSex={profileSex} setProfileSex={setProfileSex} profileBirthYear={profileBirthYear} setProfileBirthYear={setProfileBirthYear} authLoading={authLoading} onSignup={handleSignup} onLogin={handleLogin} setScreen={setScreen} />}
    {screen==="signup"&&<AuthScreen isSignup={true} authEmail={authEmail} setAuthEmail={setAuthEmail} authPass={authPass} setAuthPass={setAuthPass} authName={authName} setAuthName={setAuthName} profileSex={profileSex} setProfileSex={setProfileSex} profileBirthYear={profileBirthYear} setProfileBirthYear={setProfileBirthYear} authLoading={authLoading} onSignup={handleSignup} onLogin={handleLogin} setScreen={setScreen} />}
    {screen==="dashboard"&&<DashboardScreen panels={panels} profile={profile} user={user} sex={sex} setScreen={setScreen} setPanelValues={setPanelValues} setPanelCategory={setPanelCategory} getHistory={getHistory} showLongevity={showLongevity} setShowLongevity={setShowLongevity} onSelectMarker={(id:string)=>openMarkerDetail(id,"dashboard")} />}
    {screen==="addpanel"&&<AddPanelScreen sex={sex} panelDate={panelDate} setPanelDate={setPanelDate} panelLab={panelLab} setPanelLab={setPanelLab} panelValues={panelValues} setPanelValues={setPanelValues} panelCategory={panelCategory} setPanelCategory={setPanelCategory} saving={saving} onSave={handleSavePanel} setScreen={setScreen} />}
    {screen==="editpanel"&&currentPanel&&<EditPanelScreen panel={currentPanel} sex={sex} saving={saving} onSaveEdit={handleEditPanel} setScreen={setScreen} />}
    {screen==="viewpanel"&&<ViewPanelScreen currentPanel={currentPanel} panels={panels} sex={sex} setScreen={setScreen} onDelete={handleDeletePanel} onExportPdf={handleExportPdf} showLongevity={showLongevity} setShowLongevity={setShowLongevity} onSelectMarker={(id:string)=>openMarkerDetail(id,"viewpanel")} />}
    {screen==="markerdetail"&&selectedMarkerId&&<MarkerDetailScreen markerId={selectedMarkerId} setScreen={setScreen} getHistory={getHistory} sex={sex} showLongevity={showLongevity} markerPrevScreen={markerPrevScreen} />}
    {screen==="history"&&<HistoryScreen panels={panels} sex={sex} setScreen={setScreen} setCurrentPanel={setCurrentPanel} getHistory={getHistory} showLongevity={showLongevity} />}
    {screen==="profile"&&<ProfileScreenView user={user} profile={profile} setProfile={setProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} setScreen={setScreen} />}
    {screen==="privacy"&&<PrivacyScreen user={user} setScreen={setScreen} />}
  </>);
}
