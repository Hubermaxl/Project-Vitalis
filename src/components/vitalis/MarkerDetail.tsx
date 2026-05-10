"use client";
import { useMemo, useState } from "react";
import { BLOOD_MARKERS, getStatus, type BloodMarker } from "@/lib/markers";
import { MARKER_EXPLANATIONS, MARKER_INFLUENCES } from "@/lib/markerCopy";
import { ScoreRing } from "./ScoreRing";
import { StatusBadge } from "./StatusBadge";
import { RangeBar } from "./RangeBar";
import { Pill } from "./Pill";
import { TrendChart } from "./TrendChart";
import { ROYAL, STATUS, SURFACE, getCat } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import {
  getCategoryColorKey,
  getRanges,
  getVitalisStatus,
  normalizeStatus,
} from "./adapters";

interface HistoryPoint {
  date: string;
  value: number;
}

interface MarkerDetailProps {
  markerId: string;
  history: HistoryPoint[];
  sex: string;
  onBack: () => void;
}

type TabKey = "verlauf" | "erklaerung" | "massnahmen";

const TABS: { key: TabKey; label: string }[] = [
  { key: "verlauf", label: "Verlauf" },
  { key: "erklaerung", label: "Erklärung" },
  { key: "massnahmen", label: "Maßnahmen" },
];

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const fmtFull = (d: string) =>
  new Date(d).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });

/**
 * Marker-Detail-Screen mit 3 Tabs (Verlauf / Erklärung / Maßnahmen).
 * Spec: `Vitalis Marker Detail.html` Frame 2 & 3.
 */
export function MarkerDetail({ markerId, history, sex, onBack }: MarkerDetailProps) {
  const dark = useDarkMode();
  const [tab, setTab] = useState<TabKey>("verlauf");

  const marker = BLOOD_MARKERS.find((m) => m.id === markerId);
  if (!marker) {
    return (
      <div className="max-w-[480px] mx-auto px-6 pt-12 text-center">
        <p className="text-stone-500 dark:text-stone-400">Marker nicht gefunden.</p>
      </div>
    );
  }

  const colorKey = getCategoryColorKey(marker.category);
  const c = getCat(colorKey, dark);
  const ranges = getRanges(marker, sex);

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const status = latest ? getVitalisStatus(latest.value, marker, sex) : "normal";
  const rawStatus = latest ? getStatus(latest.value, marker, sex).status : "normal";

  // Delta in Prozent zum Vorwert
  const delta =
    latest && previous && previous.value !== 0
      ? Math.round(((latest.value - previous.value) / previous.value) * 100)
      : null;

  // Zielwert-Hinweis (zeigt das Ziel relativ zum Optimal-Range)
  const goalText = useMemo(() => {
    if (ranges.optMin <= 0 && ranges.optMax > 0) return `< ${ranges.optMax} ${marker.unit}`;
    if (ranges.optMax >= ranges.refMax) return `> ${ranges.optMin} ${marker.unit}`;
    return `${ranges.optMin}–${ranges.optMax} ${marker.unit}`;
  }, [ranges, marker.unit]);

  // RangeBar-Skala mit Puffer
  const span = ranges.refMax - ranges.refMin || 1;
  const valueForBar = latest?.value ?? ranges.optMin;
  const absMin =
    Math.min(ranges.refMin, ranges.optMin, valueForBar) - span * 0.1;
  const absMax =
    Math.max(ranges.refMax, ranges.optMax, valueForBar) + span * 0.1;

  return (
    <div className="max-w-[480px] mx-auto px-6 pt-6 pb-24">
      {/* ─── Header: Back + Breadcrumb ───────────────────── */}
      <div className="flex items-center gap-3 mb-4">
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
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
            <span style={{ color: c.accent }}>{marker.category}</span>
            <span className="mx-1.5 opacity-60">·</span>
            Marker-Detail
          </p>
        </div>
      </div>

      {/* ─── Title + StatusBadge ─────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <h1 className="text-[22px] font-extrabold tracking-tight">
          {marker.name_de}
        </h1>
        <StatusBadge status={status} />
      </div>
      <p className="text-[12px] text-stone-500 dark:text-stone-400 mb-4">
        {marker.name} · {marker.description_de}
      </p>

      {/* ─── Hero-Card: Wert + Delta + Zielwert ──────────── */}
      <div
        className="rounded-2xl p-5 mb-3 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <div className="flex items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            {latest ? (
              <>
                <div
                  className="font-extrabold leading-none tabular-nums"
                  style={{ fontSize: 42, color: STATUS[status], letterSpacing: "-0.04em" }}
                >
                  {latest.value}
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[12px] text-stone-500 dark:text-stone-400">
                    {marker.unit}
                  </span>
                  {delta !== null && (
                    <DeltaPill delta={delta} dark={dark} />
                  )}
                </div>
              </>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Noch keine Messung
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Zielwert
            </p>
            <p className="text-[14px] font-bold" style={{ color: STATUS.optimal }}>
              {goalText}
            </p>
          </div>
        </div>
        {latest && (
          <RangeBar
            value={latest.value}
            absMin={absMin}
            absMax={absMax}
            refMin={ranges.refMin}
            refMax={ranges.refMax}
            optMin={ranges.optMin}
            optMax={ranges.optMax}
            status={status}
            height={10}
            dotSize={18}
          />
        )}
      </div>

      {/* ─── Tab-Bar ─────────────────────────────────────── */}
      <div
        className="flex gap-1 p-1 mb-4 rounded-xl"
        style={{
          background: dark ? SURFACE.card.d : "#f5f4f2",
          border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        }}
        role="tablist"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className="flex-1 transition-all"
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 10px",
                borderRadius: 8,
                background: active
                  ? dark
                    ? SURFACE.bg.d
                    : "#ffffff"
                  : "transparent",
                color: active
                  ? dark
                    ? SURFACE.fg.d
                    : SURFACE.fg.l
                  : dark
                  ? SURFACE.fg2.d
                  : SURFACE.fg2.l,
                boxShadow: active
                  ? dark
                    ? "0 1px 3px rgba(0,0,0,0.4)"
                    : "0 1px 3px rgba(0,0,0,0.06)"
                  : "none",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── Tab-Content ─────────────────────────────────── */}
      {tab === "verlauf" && (
        <VerlaufTab history={history} marker={marker} ranges={ranges} accent={c.accent} dark={dark} />
      )}
      {tab === "erklaerung" && (
        <ErklaerungTab marker={marker} status={status} rawStatus={rawStatus} dark={dark} />
      )}
      {tab === "massnahmen" && (
        <MassnahmenTab marker={marker} rawStatus={rawStatus} dark={dark} />
      )}
    </div>
  );
}

/* ─── Verlauf-Tab ────────────────────────────────────────── */

function VerlaufTab({
  history,
  marker,
  ranges,
  accent,
  dark,
}: {
  history: HistoryPoint[];
  marker: BloodMarker;
  ranges: { refMin: number; refMax: number; optMin: number; optMax: number };
  accent: string;
  dark: boolean;
}) {
  return (
    <div>
      <div
        className="rounded-2xl p-4 mb-3 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        {history.length > 0 ? (
          <TrendChart
            history={history}
            optMin={ranges.optMin}
            optMax={ranges.optMax}
            refMin={ranges.refMin}
            refMax={ranges.refMax}
            color={ROYAL}
            unit={marker.unit}
            width={320}
            height={140}
          />
        ) : (
          <p className="text-center text-sm text-stone-500 dark:text-stone-400 py-8">
            Noch keine Messdaten erfasst.
          </p>
        )}
      </div>

      {history.length > 0 && (
        <>
          <h3 className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-2 mt-5">
            Messungen
          </h3>
          <div className="flex flex-col gap-1.5">
            {[...history].reverse().map((h, i) => {
              const s = normalizeStatus(getStatus(h.value, marker, "male").status);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{
                    background: dark ? SURFACE.card.d : SURFACE.card.l,
                    borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
                  }}
                >
                  <div>
                    <p className="text-[13px] font-semibold tracking-tight">
                      {fmtFull(h.date)}
                    </p>
                    {i === 0 && (
                      <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider mt-0.5">
                        Aktuell
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[16px] font-bold tabular-nums"
                      style={{ color: STATUS[s] }}
                    >
                      {h.value}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">
                      {marker.unit}
                    </span>
                    <StatusBadge status={s} small />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Erklärung-Tab ──────────────────────────────────────── */

function ErklaerungTab({
  marker,
  status,
  rawStatus,
  dark,
}: {
  marker: BloodMarker;
  status: ReturnType<typeof getVitalisStatus>;
  rawStatus: "optimal" | "normal" | "low" | "high";
  dark: boolean;
}) {
  const explanation = MARKER_EXPLANATIONS[marker.id];

  return (
    <div className="flex flex-col gap-3">
      {/* Was ist X? */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <h3 className="text-[15px] font-bold tracking-tight mb-2">
          Was ist {marker.name_de}?
        </h3>
        <p className="text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed mb-2">
          {marker.description_de}
        </p>
        {explanation && (
          <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed">
            {explanation}
          </p>
        )}
      </section>

      {/* Risiko-Stratifizierung — 3 Stufen */}
      <section
        className="rounded-2xl p-5 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <h3 className="text-[15px] font-bold tracking-tight mb-3">
          Bereiche im Detail
        </h3>
        <div className="flex flex-col gap-2">
          <RangeRow
            label="Optimal"
            value={`${marker.opt_min_m}–${marker.opt_max_m} ${marker.unit}`}
            color={STATUS.optimal}
            description="Longevity-optimal nach aktuellem Forschungsstand."
            active={status === "optimal"}
            dark={dark}
          />
          <RangeRow
            label="Referenz"
            value={`${marker.ref_min_m}–${marker.ref_max_m} ${marker.unit}`}
            color={STATUS.normal}
            description="Klinischer Normbereich — kein akuter Befund, aber auch nicht optimal."
            active={status === "normal"}
            dark={dark}
          />
          <RangeRow
            label="Auffällig"
            value={`< ${marker.ref_min_m} oder > ${marker.ref_max_m} ${marker.unit}`}
            color={STATUS.kritisch}
            description="Außerhalb des Referenzbereichs — ärztliche Abklärung empfohlen."
            active={status === "kritisch"}
            dark={dark}
          />
        </div>
      </section>

      {/* Longevity-Note (wenn vorhanden) */}
      {marker.longevity_note && (
        <section
          className="rounded-2xl p-5"
          style={{
            background: dark ? "rgba(29, 78, 216, 0.1)" : "rgba(29, 78, 216, 0.06)",
            border: `1px solid ${dark ? "rgba(29, 78, 216, 0.3)" : "rgba(29, 78, 216, 0.2)"}`,
          }}
        >
          <p className="text-[10px] uppercase font-bold tracking-wider mb-2" style={{ color: ROYAL }}>
            Longevity-Perspektive
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: dark ? "#bfdbfe" : "#1e3a8a" }}>
            {marker.longevity_note}
          </p>
        </section>
      )}

      {/* Warn-Box wenn kritisch */}
      {status === "kritisch" && (
        <section
          className="rounded-2xl p-4 flex gap-3 items-start"
          style={{
            background: dark ? "rgba(220, 38, 38, 0.12)" : "#fef2f2",
            border: `1px solid ${dark ? "rgba(220, 38, 38, 0.3)" : "#fecaca"}`,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <p className="text-[12px] font-bold mb-1" style={{ color: dark ? "#fca5a5" : "#991b1b" }}>
              Wert außerhalb des Referenzbereichs
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: dark ? "#fca5a5" : "#7f1d1d" }}>
              {rawStatus === "high"
                ? "Dein Wert liegt über der oberen Referenzgrenze. Sprich mit deiner Ärztin oder deinem Arzt über die Ursachen."
                : "Dein Wert liegt unter der unteren Referenzgrenze. Eine ärztliche Abklärung ist empfohlen."}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function RangeRow({
  label,
  value,
  color,
  description,
  active,
  dark,
}: {
  label: string;
  value: string;
  color: string;
  description: string;
  active: boolean;
  dark: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        background: active
          ? dark
            ? "rgba(255,255,255,0.04)"
            : "#fafaf9"
          : "transparent",
        border: `1px solid ${active ? color : dark ? SURFACE.border.d : SURFACE.border.l}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
            }}
          />
          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color }}>
            {label}
          </span>
          {active && (
            <Pill bg={color} color="#ffffff" small>
              Du
            </Pill>
          )}
        </div>
        <span className="text-[12px] font-semibold tabular-nums">{value}</span>
      </div>
      <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
        {description}
      </p>
    </div>
  );
}

/* ─── Maßnahmen-Tab ──────────────────────────────────────── */

function MassnahmenTab({
  marker,
  rawStatus,
  dark,
}: {
  marker: BloodMarker;
  rawStatus: "optimal" | "normal" | "low" | "high";
  dark: boolean;
}) {
  const inf = MARKER_INFLUENCES[marker.id];
  if (!inf) {
    return (
      <div
        className="rounded-2xl p-6 text-center border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <p className="text-[13px] text-stone-500 dark:text-stone-400">
          Für diesen Marker liegen noch keine Maßnahmen-Empfehlungen vor.
        </p>
      </div>
    );
  }

  // Wenn Wert zu niedrig: zeige "up"-Maßnahmen, sonst "down"-Maßnahmen.
  // Bei optimal: zeige "down" als Beibehaltungs-Strategien (i.d.R. Lifestyle).
  const showUp = rawStatus === "low";
  const items = showUp ? inf.up : inf.down;
  const headline =
    rawStatus === "optimal"
      ? "Was den Wert weiterhin in Form hält"
      : showUp
      ? "Was den Wert anhebt"
      : "Was den Wert senkt";

  // Generische Icons + Priorität-Labels (bewusst neutral, da `MARKER_INFLUENCES`
  // pro Item keine Priorität definiert).
  const ICONS = ["🥗", "🏃", "💧", "💊", "😴", "☀️"];
  const PRIORITIES = ["Hoch", "Hoch", "Mittel", "Mittel", "Niedrig", "Niedrig"];

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-bold tracking-tight">{headline}</h3>

      {items.slice(0, 4).map((item, i) => (
        <article
          key={i}
          className="rounded-2xl p-4 border"
          style={{
            background: dark ? SURFACE.card.d : SURFACE.card.l,
            borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: dark ? "rgba(29, 78, 216, 0.15)" : "rgba(29, 78, 216, 0.08)",
                fontSize: 18,
              }}
              aria-hidden="true"
            >
              {ICONS[i] ?? "•"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                <p className="text-[13px] font-semibold leading-snug flex-1 min-w-[160px]">
                  {item}
                </p>
                <Pill
                  bg={
                    PRIORITIES[i] === "Hoch"
                      ? dark
                        ? "rgba(29, 78, 216, 0.2)"
                        : "rgba(29, 78, 216, 0.1)"
                      : dark
                      ? SURFACE.bg.d
                      : "#f5f4f2"
                  }
                  color={
                    PRIORITIES[i] === "Hoch"
                      ? ROYAL
                      : dark
                      ? SURFACE.fg2.d
                      : SURFACE.fg2.l
                  }
                  small
                  uppercase
                >
                  {PRIORITIES[i] ?? "Tipp"}
                </Pill>
              </div>
            </div>
          </div>
        </article>
      ))}

      {/* Fußnote / Disclaimer */}
      <p className="text-[10px] text-stone-400 dark:text-stone-600 leading-relaxed mt-2 px-1">
        Allgemeine Hinweise auf Basis von Studien — kein Ersatz für eine ärztliche Beratung.
      </p>
    </div>
  );
}

/* ─── Helper: Delta-Pill ─────────────────────────────────── */

function DeltaPill({ delta, dark }: { delta: number; dark: boolean }) {
  if (delta === 0) {
    return (
      <Pill bg={dark ? SURFACE.bg.d : "#f5f4f2"} color={dark ? SURFACE.fg2.d : SURFACE.fg2.l} small>
        ±0%
      </Pill>
    );
  }
  const up = delta > 0;
  return (
    <Pill
      bg={up ? (dark ? "#1f0a0a" : "#fef2f2") : (dark ? "#021a0f" : "#ecfdf5")}
      color={up ? (dark ? "#f87171" : "#991b1b") : (dark ? "#34d399" : "#065f46")}
      small
    >
      {up ? "↑" : "↓"} {Math.abs(delta)}%
    </Pill>
  );
}
