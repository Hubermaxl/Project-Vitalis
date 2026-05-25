"use client";
import { BLOOD_MARKERS, getStatus } from "@/lib/markers";
import { SparkLine } from "./SparkLine";
import { StatusBadge } from "./StatusBadge";
import { getCategoryColorKey, normalizeStatus } from "./adapters";
import { CAT_COLORS, STATUS } from "./tokens";

interface Panel {
  id: string;
  test_date: string;
  lab_name: string | null;
  values: { markerId: string; value: number }[];
}

interface HistoryEntry {
  date: string;
  value: number;
}

interface HistoryScreenProps {
  panels: Panel[];
  sex: string;
  onSelectPanel: (panel: Panel) => void;
  onCompare: () => void;
  onAddPanel: () => void;
  getHistory: (markerId: string) => HistoryEntry[];
}

function DeltaChip({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / previous) * 100) : 0;
  if (Math.abs(pct) < 1)
    return <span className="text-xs text-stone-400 dark:text-stone-500">—</span>;
  const up = diff > 0;
  return (
    <span
      className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
        up
          ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
          : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
      }`}
    >
      {up ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  );
}

function EmptyState({ onAddPanel }: { onAddPanel: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      </div>
      <h2 className="font-extrabold text-2xl tracking-tight mb-2 text-stone-900 dark:text-stone-100">
        Noch kein Blutbild
      </h2>
      <p className="text-stone-500 dark:text-stone-400 text-sm mb-6 max-w-xs leading-relaxed">
        Lade dein erstes Blutbild hoch oder trage Werte manuell ein.
      </p>
      <button
        onClick={onAddPanel}
        className="px-6 py-3 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-800 transition-colors shadow-sm shadow-royal/20"
      >
        + Panel hinzufügen
      </button>
    </div>
  );
}

export function HistoryScreen({
  panels,
  sex,
  onSelectPanel,
  onCompare,
  onAddPanel,
  getHistory,
}: HistoryScreenProps) {
  if (!panels.length) return <EmptyState onAddPanel={onAddPanel} />;

  const sortedPanels = [...panels].reverse();
  const trendMarkers = BLOOD_MARKERS.filter(
    (m) => m.priority !== "extended" && getHistory(m.id).length >= 2
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-extrabold tracking-tight text-3xl lg:text-4xl text-stone-900 dark:text-stone-100">
            Verlauf
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {panels.length} {panels.length === 1 ? "Panel" : "Panels"}
          </p>
        </div>
        {panels.length >= 2 && (
          <button
            onClick={onCompare}
            className="flex items-center gap-2 px-4 py-2.5 bg-royal text-white rounded-xl text-sm font-semibold hover:bg-royal-800 transition-colors shadow-sm shadow-royal/20"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" />
            </svg>
            Panels vergleichen
          </button>
        )}
      </div>

      {/* Panel Cards */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
          Alle Panels
        </h2>
        <div className="space-y-3">
          {sortedPanels.map((p, i) => {
            const date = new Date(p.test_date);
            const isLatest = i === 0;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPanel(p)}
                className="w-full text-left bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-px transition-all overflow-hidden group"
              >
                <div className="flex">
                  <div className="w-1 shrink-0 bg-royal rounded-l-2xl" />
                  <div className="flex items-center justify-between w-full px-5 py-4 gap-4">
                    {/* Date block */}
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center w-12 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                          {date.toLocaleDateString("de-AT", { month: "short" })}
                        </span>
                        <span className="font-extrabold text-2xl leading-none text-stone-900 dark:text-stone-100">
                          {date.getDate()}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">
                          {date.getFullYear()}
                        </span>
                      </div>
                      <div className="w-px h-10 bg-stone-100 dark:bg-stone-800 shrink-0" />
                      <div>
                        <p className="font-semibold text-base text-stone-900 dark:text-stone-100 leading-snug">
                          {date.toLocaleDateString("de-AT", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="text-sm text-stone-400 dark:text-stone-500 mt-0.5">
                          {p.lab_name ? `${p.lab_name} · ` : ""}
                          {p.values.length} Marker
                        </p>
                      </div>
                    </div>
                    {/* Right side */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isLatest && (
                        <span className="hidden sm:inline text-xs font-semibold px-2.5 py-1 rounded-full bg-royal-50 text-royal dark:bg-royal-900/40 dark:text-royal-300">
                          Aktuell
                        </span>
                      )}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-stone-300 dark:text-stone-600 group-hover:text-royal transition-colors"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trends */}
      {trendMarkers.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-3">
            Trends ({trendMarkers.length} Marker)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {trendMarkers.map((marker) => {
              const history = getHistory(marker.id);
              const latest = history[history.length - 1];
              const prev = history[history.length - 2];
              const si = getStatus(latest.value, marker, sex);
              const vitStatus = normalizeStatus(si.status);
              const statusColor = STATUS[vitStatus];
              const catKey = getCategoryColorKey(marker.category);
              const catAccent = CAT_COLORS[catKey].l.accent;

              return (
                <div
                  key={marker.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full mt-[5px] shrink-0"
                        style={{ background: catAccent }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base text-stone-900 dark:text-stone-100">
                            {marker.name}
                          </span>
                          <DeltaChip current={latest.value} previous={prev.value} />
                        </div>
                        <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                          {marker.name_de}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <SparkLine
                        data={history.map((h) => h.value)}
                        color={statusColor}
                        width={72}
                        height={24}
                      />
                      <span
                        className="font-bold text-lg leading-none"
                        style={{ color: statusColor }}
                      >
                        {latest.value}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        {marker.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50 dark:border-stone-800 flex-wrap gap-2">
                    <StatusBadge status={vitStatus} />
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {history.map((h, idx) => (
                        <span
                          key={idx}
                          className="text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800 px-2 py-0.5 rounded-lg"
                        >
                          {new Date(h.date).toLocaleDateString("de-AT", {
                            month: "short",
                            year: "2-digit",
                          })}
                          : {h.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="mt-10 p-4 rounded-xl text-sm text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 border-l-[3px] border-stone-300 dark:border-stone-700 leading-relaxed">
        <strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool
        inspiriert von der Longevity-Medizin. Bitte konsultiere immer einen Arzt.
        Optimale Bereiche stammen aus publizierter Forschung und gelten möglicherweise
        nicht für deine individuelle Situation.
      </div>
    </div>
  );
}
