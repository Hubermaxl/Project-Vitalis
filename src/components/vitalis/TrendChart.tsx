"use client";
import { useId } from "react";
import { STATUS, SURFACE } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface TrendPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  history: TrendPoint[];
  /** Y-Achse: Optimal-Band (grün, gestrichelt). */
  optMin: number;
  optMax: number;
  /** Y-Achse: Referenz-Band (amber, gestrichelt). */
  refMin: number;
  refMax: number;
  /** Akzentfarbe für Linie + Endpunkt. Default Royal-Blau. */
  color?: string;
  /** SVG-Größe. */
  width?: number;
  height?: number;
  /** Einheit für Y-Label. */
  unit?: string;
}

const PADDING = { top: 16, right: 16, bottom: 32, left: 36 } as const;

/**
 * Verlaufs-Chart nach Marker-Detail Spec:
 *   - Padding 16/16/32/36
 *   - Area-Fill: color 18% → transparent
 *   - Line: color 40% → 100% Gradient
 *   - Datenpunkte: Grau 2.5px, letzter farbig 4px + Glow-Ring
 *   - X-Labels: Erster, Mitte, Letzter
 *   - Opt-Band grün, Ref-Band amber, beide gestrichelt
 *
 * Skaliert sich auf beliebige Anzahl Datenpunkte (1+). Bei nur einem Punkt:
 * waagrechte Mini-Linie + Endpunkt.
 */
export function TrendChart({
  history,
  optMin,
  optMax,
  refMin,
  refMax,
  color = "#1d4ed8",
  width = 320,
  height = 140,
  unit,
}: TrendChartProps) {
  const dark = useDarkMode();
  const uid = useId().replace(/:/g, "");
  const lineGradId = `vit-line-${uid}`;
  const areaGradId = `vit-area-${uid}`;
  const glowId = `vit-glow-${uid}`;

  if (!history || history.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: dark ? SURFACE.fg2.d : SURFACE.fg2.l,
          fontSize: 12,
        }}
      >
        Noch keine Messdaten
      </div>
    );
  }

  const innerW = width - PADDING.left - PADDING.right;
  const innerH = height - PADDING.top - PADDING.bottom;

  // Y-Skala: alle Werte + Bands berücksichtigen, mit Puffer
  const allValues = history.map((h) => h.value);
  const yMin = Math.min(...allValues, refMin, optMin);
  const yMax = Math.max(...allValues, refMax, optMax);
  const yPad = (yMax - yMin) * 0.1 || 1;
  const yLo = yMin - yPad;
  const yHi = yMax + yPad;
  const ySpan = yHi - yLo || 1;

  const yToPx = (v: number) =>
    PADDING.top + ((yHi - v) / ySpan) * innerH;

  const xToPx = (i: number, total: number) =>
    PADDING.left + (total === 1 ? innerW / 2 : (i / (total - 1)) * innerW);

  // Linien-Pfad
  const points = history.map((h, i) => ({
    x: xToPx(i, history.length),
    y: yToPx(h.value),
    date: h.date,
    value: h.value,
  }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
  // Area-Pfad: Linie + Schluss zur Bottom-Edge
  const baselineY = PADDING.top + innerH;
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)},${baselineY} L${points[0].x.toFixed(2)},${baselineY} Z`;

  // Y-Positions der Bands
  const refTop = yToPx(refMax);
  const refBottom = yToPx(refMin);
  const optTop = yToPx(optMax);
  const optBottom = yToPx(optMin);

  const trackBorder = dark ? SURFACE.border.d : SURFACE.border.l;
  const labelColor = dark ? SURFACE.fg2.d : SURFACE.fg2.l;
  const dotGray = dark ? "#57534e" : "#a8a29e";

  // X-Labels: Erster, Mitte, Letzter
  const xLabelIdxs =
    history.length === 1
      ? [0]
      : history.length === 2
      ? [0, 1]
      : [0, Math.floor((history.length - 1) / 2), history.length - 1];

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("de-AT", { month: "short", year: "2-digit" });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Werteverlauf"
    >
      <defs>
        <linearGradient id={lineGradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={areaGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Plot-Frame Linie unten */}
      <line
        x1={PADDING.left}
        y1={baselineY}
        x2={width - PADDING.right}
        y2={baselineY}
        stroke={trackBorder}
        strokeWidth={1}
      />

      {/* Referenz-Band (Amber, gestrichelt) */}
      <rect
        x={PADDING.left}
        y={refTop}
        width={innerW}
        height={Math.max(0, refBottom - refTop)}
        fill={dark ? "#451a03" : "#fef3c7"}
        opacity={0.35}
      />
      <line x1={PADDING.left} y1={refTop} x2={width - PADDING.right} y2={refTop} stroke={STATUS.normal} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
      <line x1={PADDING.left} y1={refBottom} x2={width - PADDING.right} y2={refBottom} stroke={STATUS.normal} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />

      {/* Optimal-Band (Grün, gestrichelt, oben drauf) */}
      <rect
        x={PADDING.left}
        y={optTop}
        width={innerW}
        height={Math.max(0, optBottom - optTop)}
        fill={dark ? "#064e3b" : "#a7f3d0"}
        opacity={0.4}
      />
      <line x1={PADDING.left} y1={optTop} x2={width - PADDING.right} y2={optTop} stroke={STATUS.optimal} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
      <line x1={PADDING.left} y1={optBottom} x2={width - PADDING.right} y2={optBottom} stroke={STATUS.optimal} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />

      {/* Opt-Band Label rechts */}
      <text
        x={width - PADDING.right - 4}
        y={optTop - 3}
        textAnchor="end"
        fontSize={9}
        fontWeight={600}
        fill={STATUS.optimal}
        fontFamily="var(--font-dm-sans), sans-serif"
      >
        Opt
      </text>

      {/* Y-Labels */}
      <text x={PADDING.left - 6} y={yToPx(yHi - yPad / 2) + 3} textAnchor="end" fontSize={9} fill={labelColor} fontFamily="var(--font-dm-sans), sans-serif">
        {Math.round(yHi - yPad / 2)}
      </text>
      <text x={PADDING.left - 6} y={baselineY - 1} textAnchor="end" fontSize={9} fill={labelColor} fontFamily="var(--font-dm-sans), sans-serif">
        {Math.round(yLo + yPad / 2)}
      </text>

      {/* Area + Line (nur wenn ≥ 2 Punkte) */}
      {history.length >= 2 && (
        <>
          <path d={areaPath} fill={`url(#${areaGradId})`} />
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${lineGradId})`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Datenpunkte */}
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        if (isLast) {
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={11} fill={`url(#${glowId})`} />
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={color}
                stroke={dark ? SURFACE.bg.d : "#ffffff"}
                strokeWidth={2}
              />
            </g>
          );
        }
        return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={dotGray} />;
      })}

      {/* X-Labels */}
      {xLabelIdxs.map((idx) => (
        <text
          key={idx}
          x={points[idx].x}
          y={baselineY + 14}
          textAnchor="middle"
          fontSize={10}
          fill={labelColor}
          fontFamily="var(--font-dm-sans), sans-serif"
        >
          {fmtDate(points[idx].date)}
        </text>
      ))}

      {/* Letzter Wert als Floating-Label */}
      {(() => {
        const last = points[points.length - 1];
        const labelY = Math.max(PADDING.top + 10, last.y - 10);
        return (
          <text
            x={Math.min(last.x, width - PADDING.right - 2)}
            y={labelY}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            fill={color}
            fontFamily="var(--font-dm-sans), sans-serif"
          >
            {last.value}
            {unit ? ` ${unit}` : ""}
          </text>
        );
      })()}
    </svg>
  );
}
