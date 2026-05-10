"use client";
import { useMemo } from "react";
import { BLOOD_MARKERS, getStatus, getSortedCategories } from "@/lib/markers";
import { ScoreRing } from "./ScoreRing";
import { SparkLine } from "./SparkLine";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Pill } from "./Pill";
import { ROYAL, STATUS, SURFACE, getCat } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import {
  getCategoryColorKey,
  getVitalisStatus,
  normalizeStatus,
} from "./adapters";

interface Panel {
  id: string;
  test_date: string;
  lab_name: string | null;
  values: { markerId: string; value: number }[];
}
interface Profile {
  display_name: string;
  sex: string;
  birth_year: number;
}

interface MobileDashboardProps {
  panels: Panel[];
  profile: Profile | null;
  user: { email?: string | null } | null;
  sex: string;
  onUpload: () => void;
  onAddManual: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectMarker?: (markerId: string) => void;
}

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
};

const initialsOf = (name?: string | null, email?: string | null): string => {
  const src = (name || email?.split("@")[0] || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
};

/**
 * Mobile Dashboard nach `Vitalis Mobile.html` Spec.
 * Verantwortet:
 * - Header mit Greeting + Avatar
 * - Score-Card (ScoreRing 110px + Status-Counts)
 * - CTA-Row (Hochladen / Eingeben)
 * - Kategorie-Liste mit linkem Royal-Border, Dot, SparkLine, Progress-Bar
 *
 * Responsive: zentriert auf größeren Bildschirmen mit max-width 480px.
 * Volle Desktop-Variante (Sidebar) kommt in Task 12.
 */
export function MobileDashboard({
  panels,
  profile,
  user,
  sex,
  onUpload,
  onAddManual,
  onSelectCategory,
  onSelectMarker,
}: MobileDashboardProps) {
  const dark = useDarkMode();
  const latest = panels[panels.length - 1];

  // Score & Counts — Hooks müssen vor jedem early return aufgerufen werden,
  // sonst Hook-Rules-Verstoß. Defensiv mit `latest?` arbeiten.
  const counts = useMemo(() => {
    const c = { optimal: 0, normal: 0, kritisch: 0 };
    if (!latest) return c;
    for (const v of latest.values) {
      const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
      if (!m) continue;
      const s = normalizeStatus(getStatus(v.value, m, sex).status);
      c[s]++;
    }
    return c;
  }, [latest, sex]);

  const categoryRows = useMemo(() => {
    if (!latest) return [];
    const cats = getSortedCategories();
    return cats
      .map((cat) => {
        const valuesInCat = latest.values.filter(
          (v) =>
            BLOOD_MARKERS.find((bm) => bm.id === v.markerId)?.category === cat
        );
        if (valuesInCat.length === 0) return null;

        let optimal = 0;
        let kritisch = 0;
        for (const v of valuesInCat) {
          const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
          if (!m) continue;
          const s = getVitalisStatus(v.value, m, sex);
          if (s === "optimal") optimal++;
          else if (s === "kritisch") kritisch++;
        }

        // Spark-Serie über die Score-Historie der Kategorie
        const sparkData =
          panels
            .map((p) => {
              const vals = p.values.filter(
                (v) =>
                  BLOOD_MARKERS.find((bm) => bm.id === v.markerId)?.category === cat
              );
              if (vals.length === 0) return null;
              let opt = 0;
              for (const v of vals) {
                const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId)!;
                if (getVitalisStatus(v.value, m, sex) === "optimal") opt++;
              }
              return Math.round((opt / vals.length) * 100);
            })
            .filter((x): x is number => x !== null)
            .slice(-4);

        return {
          name: cat,
          colorKey: getCategoryColorKey(cat),
          optimal,
          kritisch,
          total: valuesInCat.length,
          sparkData,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [panels, latest, sex]);

  // Empty-State, wenn noch kein Panel existiert
  if (!latest) {
    return (
      <div className="max-w-[480px] mx-auto px-6 pt-16 pb-12 text-center">
        <div className="mx-auto mb-6" style={{ width: 140, height: 140 }}>
          <ScoreRing score={0} size={140} accentColor={ROYAL} />
        </div>
        <h2 className="text-[22px] font-extrabold tracking-tight mb-2">
          Dein Blutbild.
        </h2>
        <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Lade deinen Laborbefund hoch oder gib ihn manuell ein — wir berechnen deinen Longevity-Score.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" size="lg" block onClick={onUpload}>
            Hochladen
          </Button>
          <Button variant="secondary" size="lg" block onClick={onAddManual}>
            Eingeben
          </Button>
        </div>
      </div>
    );
  }

  const total = latest.values.length;
  const score = total > 0 ? Math.round((counts.optimal / total) * 100) : 0;
  const displayName =
    profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <div className="max-w-[480px] mx-auto px-6 pb-24 pt-12">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[13px] text-stone-500 dark:text-stone-400 font-medium mb-0.5">
            {greeting()}
          </p>
          <h1 className="text-[22px] font-extrabold tracking-tight">
            {displayName || "—"}
          </h1>
        </div>
        <div
          className="rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ width: 38, height: 38, background: ROYAL, letterSpacing: "0.02em" }}
        >
          {initialsOf(profile?.display_name, user?.email)}
        </div>
      </div>

      {/* ─── Score-Card ──────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-4 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <ScoreRing score={score} size={110} accentColor={ROYAL} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Longevity-Score
            </p>
            <p className="text-[13px] font-medium text-stone-700 dark:text-stone-200 mb-3">
              {counts.optimal}/{total} optimal
            </p>
            <div className="flex flex-wrap gap-1.5">
              {counts.optimal > 0 && (
                <Pill bg={dark ? "#021a0f" : "#ecfdf5"} color={dark ? "#34d399" : "#065f46"} dot={STATUS.optimal} small>
                  {counts.optimal} optimal
                </Pill>
              )}
              {counts.normal > 0 && (
                <Pill bg={dark ? "#1c1200" : "#fffbeb"} color={dark ? "#fbbf24" : "#92400e"} dot={STATUS.normal} small>
                  {counts.normal} normal
                </Pill>
              )}
              {counts.kritisch > 0 && (
                <Pill bg={dark ? "#1f0a0a" : "#fef2f2"} color={dark ? "#f87171" : "#991b1b"} dot={STATUS.kritisch} small>
                  {counts.kritisch} kritisch
                </Pill>
              )}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-4">
          {new Date(latest.test_date).toLocaleDateString("de-AT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {latest.lab_name ? ` · ${latest.lab_name}` : ""}
        </p>
      </div>

      {/* ─── CTA-Row ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        <Button variant="primary" size="md" block onClick={onUpload}>
          Hochladen
        </Button>
        <Button variant="ghost" size="md" block onClick={onAddManual}>
          Eingeben
        </Button>
      </div>

      {/* ─── Kategorie-Liste ─────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {categoryRows.map((row, idx) => {
          const c = getCat(row.colorKey, dark);
          const pct = Math.round((row.optimal / row.total) * 100);
          const pctColor =
            pct >= 70 ? STATUS.optimal : pct >= 50 ? STATUS.normal : STATUS.kritisch;
          return (
            <button
              key={row.name}
              type="button"
              onClick={() => onSelectCategory(row.name)}
              className="text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/50 animate-fade-up"
              style={{
                background: dark ? SURFACE.card.d : SURFACE.card.l,
                border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
                borderLeft: `3px solid ${ROYAL}`,
                borderRadius: 14,
                padding: "12px 14px 12px 12px",
                animationDelay: `${idx * 60}ms`,
                animationFillMode: "both",
              }}
            >
              {/* Name + Dot links, Prozent rechts */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: c.accent,
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-[14px] font-semibold tracking-tight truncate">
                    {row.name}
                  </span>
                </div>
                <span
                  className="text-[15px] font-bold flex-shrink-0 ml-3"
                  style={{ color: pctColor }}
                >
                  {pct}%
                </span>
              </div>

              {/* Counter + SparkLine */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  {row.optimal}/{row.total} optimal
                  {row.kritisch > 0 && (
                    <span style={{ color: STATUS.kritisch, marginLeft: 6 }}>
                      · {row.kritisch} kritisch
                    </span>
                  )}
                </span>
                {row.sparkData.length >= 2 && (
                  <div className="ml-auto">
                    <SparkLine
                      data={row.sparkData}
                      color={c.accent}
                      width={56}
                      height={18}
                    />
                  </div>
                )}
              </div>

              {/* Progress-Bar */}
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: dark ? SURFACE.border.d : SURFACE.border.l,
                  overflow: "hidden",
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
            </button>
          );
        })}
      </div>

      {/* Mini-Disclaimer am Fuß */}
      <p className="text-[10px] text-stone-400 dark:text-stone-600 text-center mt-8 leading-relaxed">
        Keine medizinische Diagnose. Bei Fragen zur Interpretation deiner Werte wende dich an deine Ärztin oder deinen Arzt.
      </p>
    </div>
  );
}
