"use client";
import { useState } from "react";
import { BLOOD_MARKERS, getStatus, getSortedCategories, type BloodMarker } from "@/lib/markers";
import { MARKER_EXPLANATIONS } from "@/lib/markerCopy";
import { StatusBadge } from "./StatusBadge";
import { RangeBar } from "./RangeBar";
import { getCategoryColorKey, normalizeStatus, getRanges } from "./adapters";
import { CAT_COLORS, STATUS } from "./tokens";

interface PanelValue {
  markerId: string;
  value: number;
}
interface Panel {
  id: string;
  user_id: string;
  test_date: string;
  lab_name: string | null;
  values: PanelValue[];
}

interface ViewPanelScreenProps {
  currentPanel: Panel | null;
  panels: Panel[];
  sex: string;
  onBack: () => void;
  onEdit: () => void;
  onShare: (p: Panel) => void;
  onExportPdf: (p: Panel) => void;
  onDelete: (id: string) => void;
  onSelectMarker: (markerId: string) => void;
  showLongevity: boolean;
  onToggleLongevity: () => void;
}

/* ── Delta-Chip ─────────────────────────────────────────────────── */
function DeltaChip({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / previous) * 100) : 0;
  if (Math.abs(pct) < 1)
    return <span className="text-xs text-stone-400 dark:text-stone-500">—</span>;
  const up = diff > 0;
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
      up
        ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
    }`}>
      {up ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

/* ── Longevity-Toggle ───────────────────────────────────────────── */
function LongevityToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 min-h-10 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
        enabled
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
          : "bg-stone-50 text-stone-500 border border-stone-200 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-400 dark:border-stone-700 dark:hover:bg-stone-800"
      }`}
    >
      <div className={`w-7 h-4 rounded-full flex items-center transition-all ${enabled ? "bg-emerald-500 justify-end" : "bg-stone-300 justify-start dark:bg-stone-600"}`}>
        <div className="w-3 h-3 rounded-full bg-white mx-0.5 shadow-sm" />
      </div>
      <span className="hidden sm:inline">Longevity</span>
      <span className="sm:hidden">LG</span>
    </button>
  );
}

/* ── Einzelne Marker-Karte (eigene Komponente, damit useState legal) */
function MarkerCard({
  marker,
  value,
  prevValue,
  sex,
  showLongevity,
  onSelectMarker,
  catAccent,
}: {
  marker: BloodMarker;
  value: number;
  prevValue: number | undefined;
  sex: string;
  showLongevity: boolean;
  onSelectMarker: (id: string) => void;
  catAccent: string;
}) {
  const [showNote, setShowNote] = useState(false);
  const si = getStatus(value, marker, sex);
  const vitStatus = normalizeStatus(si.status);
  const statusColor = STATUS[vitStatus];
  const sx = sex === "female" ? "f" : "m";
  const explanation = MARKER_EXPLANATIONS[marker.id];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm overflow-hidden">
      <div className="flex">
        {/* Left category stripe */}
        <div className="w-1 shrink-0" style={{ background: catAccent }} />
        <div className="flex-1 p-5">
          {/* Top row: name + value */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority dot */}
                {marker.priority === "essential" && (
                  <span className="w-2 h-2 rounded-full bg-royal shrink-0" title="Essentiell" />
                )}
                {marker.priority === "recommended" && (
                  <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 shrink-0" title="Empfohlen" />
                )}
                <span className="font-semibold text-base text-stone-900 dark:text-stone-100">
                  {marker.name}
                </span>
                <StatusBadge status={vitStatus} />
                {prevValue !== undefined && (
                  <DeltaChip current={value} previous={prevValue} />
                )}
              </div>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
                {marker.name_de}
              </p>
              {explanation && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed max-w-lg">
                  {explanation}
                </p>
              )}
            </div>
            {/* Value */}
            <div className="text-right shrink-0">
              <span className="text-2xl font-extrabold" style={{ color: statusColor }}>
                {value}
              </span>
              <span className="text-sm text-stone-400 dark:text-stone-500 ml-1">
                {marker.unit}
              </span>
            </div>
          </div>

          {/* RangeBar */}
          <div className="mt-1">
            {(() => {
              const ranges = getRanges(marker, sex);
              const absMin = Math.min(ranges.refMin * 0.5, value * 0.8, 0);
              const absMax = Math.max(ranges.refMax * 1.3, value * 1.2);
              return (
                <RangeBar
                  value={value}
                  absMin={absMin}
                  absMax={absMax}
                  refMin={ranges.refMin}
                  refMax={ranges.refMax}
                  optMin={ranges.optMin}
                  optMax={ranges.optMax}
                  status={vitStatus}
                  showOptimalRange={showLongevity}
                />
              );
            })()}
          </div>

          {/* Bottom row: ranges + actions */}
          <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
            <div className="flex gap-4 text-xs text-stone-400 dark:text-stone-500 flex-wrap">
              <span>
                Referenz: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}
              </span>
              {showLongevity && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {showLongevity && marker.longevity_note && (
                <button
                  onClick={() => setShowNote(!showNote)}
                  className="text-xs text-royal hover:text-royal-800 font-medium transition-colors"
                >
                  {showNote ? "Weniger ▴" : "Longevity-Info ▾"}
                </button>
              )}
              <button
                onClick={() => onSelectMarker(marker.id)}
                className="text-xs text-stone-400 dark:text-stone-500 hover:text-royal dark:hover:text-royal-400 font-medium transition-colors"
              >
                Details →
              </button>
            </div>
          </div>

          {/* Longevity note */}
          {showNote && showLongevity && marker.longevity_note && (
            <div className="mt-3 p-3 rounded-xl bg-royal-50 dark:bg-royal-900/40 text-sm text-royal-900 dark:text-royal-200 leading-relaxed">
              {marker.longevity_note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Haupt-Komponente ───────────────────────────────────────────── */
export function ViewPanelScreen({
  currentPanel,
  panels,
  sex,
  onBack,
  onEdit,
  onShare,
  onExportPdf,
  onDelete,
  onSelectMarker,
  showLongevity,
  onToggleLongevity,
}: ViewPanelScreenProps) {
  const p = currentPanel ?? panels[panels.length - 1];
  if (!p) return null;

  const panelIdx = panels.findIndex((pan) => pan.id === p.id);
  const prevPanel = panelIdx > 0 ? panels[panelIdx - 1] : null;

  const date = new Date(p.test_date);
  const dateStr = date.toLocaleDateString("de-AT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 mb-5 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Zurück
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-extrabold tracking-tight text-3xl lg:text-4xl text-stone-900 dark:text-stone-100">
            Panel Ergebnisse
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {dateStr}
            {p.lab_name && ` · ${p.lab_name}`}
            {` · ${p.values.length} Marker`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <LongevityToggle enabled={showLongevity} onToggle={onToggleLongevity} />
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 min-h-10 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-xl text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Bearbeiten
          </button>
          <button
            onClick={() => onShare(p)}
            className="flex items-center gap-1.5 min-h-10 px-3.5 py-2 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-800 transition-colors shadow-sm shadow-royal/20"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Teilen
          </button>
          <button
            onClick={() => onExportPdf(p)}
            className="flex items-center gap-1.5 min-h-10 px-3.5 py-2 bg-stone-800 dark:bg-stone-100 dark:text-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            PDF
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="flex items-center gap-1.5 min-h-10 px-3.5 py-2 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Löschen
          </button>
        </div>
      </div>

      {/* Longevity Legende */}
      {showLongevity && (
        <div className="flex items-center gap-5 mb-6 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-sm text-emerald-700 dark:text-emerald-300 flex-wrap gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded bg-amber-200/80" />
            <span>Referenzbereich</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-2.5 rounded bg-emerald-300/80 border border-emerald-400/30" />
            <span>Longevity-Optimal (nach Attia)</span>
          </div>
        </div>
      )}

      {/* Kategorien */}
      {getSortedCategories().map((cat) => {
        const catKey = getCategoryColorKey(cat);
        const catAccent = CAT_COLORS[catKey].l.accent;
        const catValues = p.values.filter(
          (v) => BLOOD_MARKERS.find((bm) => bm.id === v.markerId)?.category === cat
        );
        if (!catValues.length) return null;

        return (
          <section key={cat} className="mb-8">
            {/* Category header */}
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: catAccent }} />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                {cat}
              </h2>
              <span className="text-xs text-stone-300 dark:text-stone-600">
                {catValues.length} Marker
              </span>
            </div>

            {/* Marker cards */}
            <div className="space-y-3">
              {catValues.map((v) => {
                const marker = BLOOD_MARKERS.find((m) => m.id === v.markerId);
                if (!marker) return null;
                const prevVal = prevPanel?.values.find((pv) => pv.markerId === v.markerId);
                return (
                  <MarkerCard
                    key={v.markerId}
                    marker={marker}
                    value={v.value}
                    prevValue={prevVal?.value}
                    sex={sex}
                    showLongevity={showLongevity}
                    onSelectMarker={onSelectMarker}
                    catAccent={catAccent}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Disclaimer */}
      <div className="mt-4 p-4 rounded-xl text-sm text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 border-l-[3px] border-stone-300 dark:border-stone-700 leading-relaxed">
        <strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool
        inspiriert von der Longevity-Medizin. Bitte konsultiere immer einen Arzt.
      </div>
    </div>
  );
}
