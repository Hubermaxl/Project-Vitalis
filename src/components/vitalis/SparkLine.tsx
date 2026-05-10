"use client";
import { STATUS } from "./tokens";

interface SparkLineProps {
  /** Min. 2 Punkte. Bei nur einem Punkt wird eine waagrechte Mini-Linie gerendert. */
  data: number[];
  /** Linien- und Endpunkt-Farbe. Default: STATUS.optimal. */
  color?: string;
  width?: number;
  height?: number;
  /** Strokewidth der Linie. Default 1.5. */
  strokeWidth?: number;
  /** Radius des Endpunkt-Dots. Default 2.5. */
  dotRadius?: number;
}

/**
 * Mini-Trendlinie mit farbigem Endpunkt-Dot.
 * Spec: SparkLine immer mit Endpunkt-Dot in der Marker-Farbe.
 */
export function SparkLine({
  data,
  color = STATUS.optimal,
  width = 60,
  height = 22,
  strokeWidth = 1.5,
  dotRadius = 2.5,
}: SparkLineProps) {
  if (!data || data.length === 0) return null;

  // Bei einzelnem Datenpunkt: zentrierter Dot, keine Linie.
  if (data.length === 1) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible", display: "block" }}
        aria-hidden="true"
      >
        <circle cx={width / 2} cy={height / 2} r={dotRadius} fill={color} />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padY = dotRadius + 0.5; // Endpunkt-Dot soll nicht clippen

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padY - ((v - min) / range) * (height - padY * 2);
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={dotRadius} fill={color} />
    </svg>
  );
}
