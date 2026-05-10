"use client";
import { useMemo } from "react";
import { BLOOD_MARKERS, getStatus, getSortedCategories } from "@/lib/markers";
import { ScoreRing } from "./ScoreRing";
import { Button } from "./Button";
import { Pill } from "./Pill";
import { CategoryCard, type CategoryCardData } from "./CategoryCard";
import { ROYAL, STATUS, SURFACE } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import { getCategoryColorKey, getVitalisStatus, normalizeStatus } from "./adapters";

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

interface DesktopDashboardProps {
  panels: Panel[];
  profile: Profile | null;
  user: { email?: string | null } | null;
  sex: string;
  onUpload: () => void;
  onSelectCategory: (cat: string) => void;
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });
const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("de-AT", { month: "short", year: "2-digit" });

/**
 * Desktop Dashboard nach `Vitalis Dashboard.html` Variant B "Momentum".
 *
 * Top: Score-Hero (Ring 160 + Pills + History + Upload).
 * Body: 3-spaltige CategoryCard-Grid (responsive auf 2/1).
 *
 * Bewusst ohne fixe Sidebar — der bestehende AppHeader übernimmt Top-Nav.
 */
export function DesktopDashboard({
  panels, profile, user, sex, onUpload, onSelectCategory,
}: DesktopDashboardProps) {
  const dark = useDarkMode();
  const latest = panels[panels.length - 1];

  const counts = useMemo(() => {
    const c = { optimal: 0, normal: 0, kritisch: 0 };
    if (!latest) return c;
    for (const v of latest.values) {
      const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
      if (!m) continue;
      c[normalizeStatus(getStatus(v.value, m, sex).status)]++;
    }
    return c;
  }, [latest, sex]);

  const categories: CategoryCardData[] = useMemo(() => {
    if (!latest) return [];
    return getSortedCategories()
      .map((cat) => {
        const valuesInCat = latest.values.filter(
          (v) => BLOOD_MARKERS.find((bm) => bm.id === v.markerId)?.category === cat
        );
        if (valuesInCat.length === 0) return null;
        let optimal = 0;
        const previews = [];
        for (const v of valuesInCat) {
          const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
          if (!m) continue;
          const s = getVitalisStatus(v.value, m, sex);
          if (s === "optimal") optimal++;
          if (previews.length < 2) {
            // Spark aus History dieses Markers über alle Panels
            const spark: number[] = [];
            for (const p of panels) {
              const pv = p.values.find((x) => x.markerId === v.markerId);
              if (pv) spark.push(pv.value);
            }
            previews.push({ name: m.name_de, spark: spark.slice(-4), status: s });
          }
        }
        return {
          name: cat,
          colorKey: getCategoryColorKey(cat),
          optimal,
          total: valuesInCat.length,
          markers: previews,
        };
      })
      .filter((x): x is CategoryCardData => x !== null);
  }, [panels, latest, sex]);

  const total = latest?.values.length ?? 0;
  const score = total > 0 ? Math.round((counts.optimal / total) * 100) : 0;
  const displayName = profile?.display_name?.split(" ")[0] || user?.email?.split("@")[0] || "";

  if (!latest) {
    return (
      <div className="max-w-6xl mx-auto px-12 pt-16 pb-24 text-center">
        <div className="mx-auto mb-8" style={{ width: 180 }}>
          <ScoreRing score={0} size={180} accentColor={ROYAL} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-3" style={{ letterSpacing: "-0.045em" }}>
          Dein Blutbild.
        </h1>
        <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-8">
          Lade deinen ersten Befund hoch, um deinen Longevity-Score zu sehen.
        </p>
        <Button variant="primary" size="lg" onClick={onUpload}>
          Befund hochladen
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 pt-10 pb-20">
      {/* ─── Header-Greeting ────────────────────────────── */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-[12px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            Dashboard
          </p>
          <h1 className="text-[34px] font-extrabold tracking-tight" style={{ letterSpacing: "-0.04em" }}>
            Hallo {displayName}
          </h1>
        </div>
        <Button variant="primary" size="md" onClick={onUpload}>
          + Neues Panel
        </Button>
      </div>

      {/* ─── Score-Hero ─────────────────────────────────── */}
      <section
        className="rounded-2xl p-8 mb-10 border"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <div className="flex items-center gap-10 flex-wrap">
          <div className="flex-shrink-0">
            <ScoreRing score={score} size={160} accentColor={ROYAL} animate />
          </div>
          <div className="flex-1 min-w-[260px]">
            <p className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
              Longevity-Score
            </p>
            <p className="text-[20px] font-bold tracking-tight mb-3" style={{ letterSpacing: "-0.02em" }}>
              {counts.optimal}/{total} Marker im optimalen Bereich
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
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
            <p className="text-[12px] text-stone-500 dark:text-stone-400">
              {fmt(latest.test_date)}
              {latest.lab_name ? ` · ${latest.lab_name}` : ""}
            </p>
          </div>

          {/* Score-History */}
          {panels.length > 1 && (
            <div className="flex flex-col gap-2 flex-shrink-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
                Vorherige Panels
              </p>
              <div className="flex gap-2">
                {panels.slice(-3, -1).reverse().map((p) => {
                  let opt = 0;
                  for (const v of p.values) {
                    const m = BLOOD_MARKERS.find((bm) => bm.id === v.markerId);
                    if (!m) continue;
                    if (getVitalisStatus(v.value, m, sex) === "optimal") opt++;
                  }
                  const pct = p.values.length > 0 ? Math.round((opt / p.values.length) * 100) : 0;
                  const c = pct >= 70 ? STATUS.optimal : pct >= 50 ? STATUS.normal : STATUS.kritisch;
                  return (
                    <div
                      key={p.id}
                      className="rounded-lg px-3 py-2 text-center"
                      style={{
                        background: dark ? SURFACE.bg.d : "#f5f4f2",
                        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
                        minWidth: 88,
                      }}
                    >
                      <p className="text-[16px] font-extrabold tabular-nums" style={{ color: c, letterSpacing: "-0.02em" }}>
                        {pct}%
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{fmtShort(p.test_date)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Kategorie-Grid ─────────────────────────────── */}
      <h2 className="text-[14px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-4">
        Kategorien
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <div
            key={cat.name}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CategoryCard cat={cat} onClick={() => onSelectCategory(cat.name)} />
          </div>
        ))}
      </div>
    </div>
  );
}
