"use client";
import { useState } from "react";
import { SURFACE, getCat, type CatColorKey, type Status } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import { SparkLine } from "./SparkLine";
import { StatusBadge } from "./StatusBadge";
import { Pill } from "./Pill";

/** Slim-Marker-Type für die Card-Vorschau. Adapter zu `BloodMarker` aus
 *  `lib/markers.ts` kommt beim Dashboard-Refactor (Task 6). */
export interface PreviewMarker {
  name: string;
  spark: number[];
  status: Status;
}

export interface CategoryCardData {
  name: string;
  /** Schlüssel in CAT_COLORS (rose, amber, violet, …). */
  colorKey: CatColorKey;
  /** Anzahl optimaler Marker. */
  optimal: number;
  /** Gesamtanzahl Marker. */
  total: number;
  /** Vorschau-Marker (üblicherweise 2, bei `compact` nur 1). */
  markers: PreviewMarker[];
}

interface CategoryCardProps {
  cat: CategoryCardData;
  onClick?: () => void;
  /** Kompakte Variante: weniger Padding, nur 1 Vorschau-Marker. */
  compact?: boolean;
}

/**
 * Karte für die Kategorie-Übersicht (Dashboard-Grid). Zeigt:
 * - Kategorie-Tag (Pill in Kategoriefarbe)
 * - "x/y optimal" Counter
 * - Optimal-Prozent in Status-Farbe (rechts oben groß)
 * - 1–2 Marker-Previews mit SparkLine + StatusBadge
 *
 * Hover: translateY(-2px) + Card-Shadow.
 */
export function CategoryCard({ cat, onClick, compact = false }: CategoryCardProps) {
  const dark = useDarkMode();
  const c = getCat(cat.colorKey, dark);
  const [hover, setHover] = useState(false);

  const pct = cat.total > 0 ? Math.round((cat.optimal / cat.total) * 100) : 0;
  const pctColor =
    pct >= 70 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626";

  const previewCount = compact ? 1 : 2;
  const previews = cat.markers.slice(0, previewCount);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        textAlign: "left",
        width: "100%",
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        borderRadius: 16,
        padding: compact ? 14 : 18,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        transform: hover && onClick ? "translateY(-2px)" : "none",
        boxShadow:
          hover && onClick
            ? dark
              ? "0 8px 24px rgba(0,0,0,0.40)"
              : "0 8px 24px rgba(0,0,0,0.08)"
            : "none",
        display: "block",
      }}
    >
      {/* Header: Tag + Counter links, Prozent rechts */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: compact ? 10 : 14,
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Pill
            bg={c.bg}
            color={c.text}
            border={c.border}
            uppercase
            small
            style={{ marginBottom: 5 }}
          >
            {cat.name}
          </Pill>
          <div
            style={{
              color: dark ? SURFACE.fg2.d : SURFACE.fg3.l,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {cat.optimal}/{cat.total} optimal
          </div>
        </div>
        <span
          style={{
            color: pctColor,
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {pct}%
        </span>
      </div>

      {/* Marker-Previews */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {previews.map((m) => (
          <div
            key={m.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 11,
                color: dark ? SURFACE.fg2.d : SURFACE.fg3.l,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: 500,
              }}
            >
              {m.name}
            </div>
            <SparkLine data={m.spark} color={c.accent} width={48} height={18} />
            <StatusBadge status={m.status} small />
          </div>
        ))}
      </div>
    </button>
  );
}
