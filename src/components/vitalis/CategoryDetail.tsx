"use client";
import { useMemo } from "react";
import { BLOOD_MARKERS, type BloodMarker } from "@/lib/markers";
import { ScoreRing } from "./ScoreRing";
import { SparkLine } from "./SparkLine";
import { StatusBadge } from "./StatusBadge";
import { RangeBar } from "./RangeBar";
import { Pill } from "./Pill";
import { STATUS, SURFACE, getCat } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import {
  buildSpark,
  getCategoryColorKey,
  getRanges,
  getVitalisStatus,
} from "./adapters";

interface Panel {
  id: string;
  test_date: string;
  values: { markerId: string; value: number }[];
}

interface CategoryDetailProps {
  category: string;
  panels: Panel[];
  sex: string;
  onBack: () => void;
  onSelectMarker: (markerId: string) => void;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("de-AT", { day: "numeric", month: "short", year: "2-digit" });

/** Backbutton-Icon (Chevron Left). */
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * Mobile Kategorie-Detail nach `Vitalis Mobile.html` Screen B.
 *
 * Aufbau:
 * 1. Header: Back-Button + Kategorie-Tag (mit Dot) + Optimal-Prozent
 * 2. Summary-Bar: Progress-Bar + Panel-History-Pills (letzte 3 Panels)
 * 3. Marker-Liste: Karten mit Wert, SparkLine, RangeBar (Ref/Opt-Bands), StatusBadge
 */
export function CategoryDetail({
  category,
  panels,
  sex,
  onBack,
  onSelectMarker,
}: CategoryDetailProps) {
  const dark = useDarkMode();
  const colorKey = getCategoryColorKey(category);
  const c = getCat(colorKey, dark);
  const latest = panels[panels.length - 1];

  const data = useMemo(() => {
    if (!latest) return null;

    // Marker dieser Kategorie aus dem letzten Panel
    const rows = latest.values
      .map((v) => {
        const marker = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
        if (!marker || marker.category !== category) return null;
        const status = getVitalisStatus(v.value, marker, sex);
        const ranges = getRanges(marker, sex);
        const spark = buildSpark(panels, v.markerId);
        return { marker, value: v.value, status, ranges, spark };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    // Sortiere kritisch zuerst, dann normal, dann optimal
    const order: Record<string, number> = { kritisch: 0, normal: 1, optimal: 2 };
    rows.sort((a, b) => order[a.status] - order[b.status]);

    const optimal = rows.filter((r) => r.status === "optimal").length;
    const total = rows.length;
    const pct = total > 0 ? Math.round((optimal / total) * 100) : 0;

    // Panel-History für die kleinen Pills (% optimal je Panel, zeitlich sortiert)
    const history = panels
      .map((p) => {
        const vals = p.values.filter((v) =>
          (BLOOD_MARKERS.find((bm) => bm.id === v.markerId)?.category) === category
        );
        if (vals.length === 0) return null;
        let opt = 0;
        for (const v of vals) {
          const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId)!;
          if (getVitalisStatus(v.value, m, sex) === "optimal") opt++;
        }
        return {
          date: p.test_date,
          pct: Math.round((opt / vals.length) * 100),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .slice(-3);

    return { rows, optimal, total, pct, history };
  }, [latest, panels, sex, category]);

  if (!data || data.rows.length === 0) {
    return (
      <div className="max-w-[480px] mx-auto px-6 pt-12 pb-24">
        <BackButton onBack={onBack} dark={dark} />
        <p className="mt-12 text-center text-stone-500 dark:text-stone-400 text-sm">
          Keine Werte für „{category}" im aktuellen Panel.
        </p>
      </div>
    );
  }

  const { rows, optimal, total, pct, history } = data;
  const pctColor =
    pct >= 70 ? STATUS.optimal : pct >= 50 ? STATUS.normal : STATUS.kritisch;

  return (
    <div className="max-w-[480px] mx-auto px-6 pt-6 pb-24">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-start gap-3 mb-5">
        <BackButton onBack={onBack} dark={dark} />
        <div className="flex-1 min-w-0 pt-1">
          <Pill bg={c.bg} color={c.text} border={c.border} dot={c.accent} uppercase small>
            {category}
          </Pill>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
            {optimal} von {total} optimal
          </p>
        </div>
        <div className="flex-shrink-0 pt-1">
          <ScoreRing score={pct} size={56} strokeWidth={5} accentColor={pctColor} />
        </div>
      </div>

      {/* ─── Summary-Bar ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-4 mb-5 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
            Verlauf
          </span>
          <span className="text-[14px] font-bold" style={{ color: pctColor }}>
            {pct}% optimal
          </span>
        </div>
        {/* Progress-Bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: dark ? SURFACE.border.d : SURFACE.border.l,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pctColor,
              transition: "width 0.6s cubic-bezier(0.34, 1.4, 0.64, 1)",
            }}
          />
        </div>
        {/* Panel-History-Pills */}
        {history.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {history.map((h) => {
              const hColor = h.pct >= 70 ? STATUS.optimal : h.pct >= 50 ? STATUS.normal : STATUS.kritisch;
              return (
                <Pill
                  key={h.date}
                  bg={dark ? SURFACE.bg.d : "#f5f4f2"}
                  color={dark ? SURFACE.fg.d : SURFACE.fg.l}
                  border={dark ? SURFACE.border.d : SURFACE.border.l}
                  dot={hColor}
                  small
                >
                  {fmt(h.date)} · {h.pct}%
                </Pill>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Marker-Liste ────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {rows.map(({ marker, value, status, ranges, spark }) => (
          <MarkerRow
            key={marker.id}
            marker={marker}
            value={value}
            status={status}
            ranges={ranges}
            spark={spark}
            dark={dark}
            accentColor={c.accent}
            onClick={() => onSelectMarker(marker.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Hilfs-Komponenten ─────────────────────────────────── */

function BackButton({ onBack, dark }: { onBack: () => void; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Zurück"
      className="flex-shrink-0 inline-flex items-center justify-center transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        color: dark ? SURFACE.fg.d : SURFACE.fg.l,
        background: dark ? SURFACE.card.d : SURFACE.card.l,
      }}
    >
      <BackIcon />
    </button>
  );
}

interface MarkerRowProps {
  marker: BloodMarker;
  value: number;
  status: ReturnType<typeof getVitalisStatus>;
  ranges: { refMin: number; refMax: number; optMin: number; optMax: number };
  spark: number[];
  dark: boolean;
  accentColor: string;
  onClick: () => void;
}

function MarkerRow({
  marker,
  value,
  status,
  ranges,
  spark,
  dark,
  accentColor,
  onClick,
}: MarkerRowProps) {
  // absMin/absMax für die RangeBar-Skalierung. Nimm 10% Puffer um die Ranges
  // herum, damit der Wert auch bei knappen Über-/Unterschreitungen sichtbar wird.
  const span = ranges.refMax - ranges.refMin || 1;
  const absMin = Math.min(ranges.refMin, ranges.optMin, value) - span * 0.1;
  const absMax = Math.max(ranges.refMax, ranges.optMax, value) + span * 0.1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/50"
      style={{
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        borderRadius: 14,
        padding: "14px 14px 12px 14px",
      }}
    >
      {/* Top: Name + Wert + Chevron */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-[14px] font-semibold tracking-tight">
              {marker.name_de}
            </span>
            <StatusBadge status={status} small />
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
            {marker.description_de}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div
              className="text-[20px] font-bold leading-none tabular-nums"
              style={{ color: STATUS[status] }}
            >
              {value}
            </div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              {marker.unit}
            </div>
          </div>
          <div
            aria-hidden="true"
            className="text-stone-400 dark:text-stone-600 ml-1"
          >
            <ChevronRightIcon />
          </div>
        </div>
      </div>

      {/* SparkLine + RangeBar */}
      <div className="mb-2">
        <RangeBar
          value={value}
          absMin={absMin}
          absMax={absMax}
          refMin={ranges.refMin}
          refMax={ranges.refMax}
          optMin={ranges.optMin}
          optMax={ranges.optMax}
          status={status}
          height={10}
          dotSize={16}
        />
      </div>

      {/* Footer: Opt/Ref Labels + SparkLine */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3 text-[10px] text-stone-500 dark:text-stone-400 font-medium">
          <span>
            Opt {ranges.optMin}–{ranges.optMax}
          </span>
          <span className="text-stone-400 dark:text-stone-600">
            Ref {ranges.refMin}–{ranges.refMax}
          </span>
        </div>
        {spark.length >= 2 && (
          <SparkLine data={spark} color={accentColor} width={56} height={18} />
        )}
      </div>
    </button>
  );
}
