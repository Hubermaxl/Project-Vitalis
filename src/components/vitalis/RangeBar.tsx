"use client";
import { STATUS, SURFACE, type Status } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface RangeBarProps {
  /** Aktueller Messwert. */
  value: number;
  /** Untere Grenze der absoluten Skala (Bar-Anfang). */
  absMin: number;
  /** Obere Grenze der absoluten Skala (Bar-Ende). */
  absMax: number;
  /** Laborreferenz-Range (Amber-Schicht). */
  refMin: number;
  refMax: number;
  /** Longevity-Optimum-Range (Grün-Schicht). */
  optMin: number;
  optMax: number;
  /** Status für Dot-Farbe. */
  status: Status;
  /** Höhe der Bar in px. Default 8. */
  height?: number;
  /** Dot-Durchmesser in px. Spec: 14–18px. Default 14. */
  dotSize?: number;
  /** Border-Stärke des Dots in px. Default 2. */
  dotBorder?: number;
  /** Wenn `false`, wird die Optimal-Range nicht eingeblendet (z.B. wenn der Nutzer
   * "Longevity"-Modus deaktiviert hat). Default true. */
  showOptimalRange?: boolean;
}

/**
 * Horizontale Wertebereichs-Bar mit drei Schichten:
 *
 *   Grau-Track  →  Amber Referenz-Range  →  Grün Optimal-Range  →  Farbiger Value-Dot
 *
 * Die wichtigste UX-Differenzierung der App (siehe README): immer beide Ranges zeigen,
 * damit Nutzer Labor-Norm vs. Longevity-Optimum auf einen Blick sehen.
 */
export function RangeBar({
  value,
  absMin,
  absMax,
  refMin,
  refMax,
  optMin,
  optMax,
  status,
  height = 8,
  dotSize = 14,
  dotBorder = 2,
  showOptimalRange = true,
}: RangeBarProps) {
  const dark = useDarkMode();

  // Robuste Skalierung: wenn absMax <= absMin, fallen wir auf 100% zurück
  // damit nichts NaN wird.
  const span = absMax - absMin || 1;
  const pct = (v: number) => {
    const raw = ((v - absMin) / span) * 100;
    return Math.max(0, Math.min(100, raw));
  };

  const refLeft  = pct(refMin);
  const refRight = pct(refMax);
  const optLeft  = pct(optMin);
  const optRight = pct(optMax);
  const valuePos = pct(value);

  const trackBg = dark ? SURFACE.border.d : SURFACE.border.l;
  const refBg   = dark ? "#451a03" : "#fde68a"; // amber-950 / amber-200
  const optBg   = dark ? "#064e3b" : "#6ee7b7"; // emerald-900 / emerald-300
  const dotBorderColor = dark ? SURFACE.bg.d : "#ffffff";
  const dotColor = STATUS[status];
  const radius = height / 2;

  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: radius,
        background: trackBg,
        width: "100%",
      }}
      role="img"
      aria-label={`Wert ${value} (Optimum ${optMin}–${optMax}, Referenz ${refMin}–${refMax})`}
    >
      {/* Referenz-Range (Amber) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${refLeft}%`,
          width: `${Math.max(0, refRight - refLeft)}%`,
          background: refBg,
          borderRadius: radius,
        }}
      />
      {/* Optimal-Range (Grün) — liegt über der Amber-Schicht */}
      {showOptimalRange && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${optLeft}%`,
            width: `${Math.max(0, optRight - optLeft)}%`,
            background: optBg,
            borderRadius: radius,
          }}
        />
      )}
      {/* Value-Dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${valuePos}%`,
          transform: "translate(-50%, -50%)",
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: dotColor,
          border: `${dotBorder}px solid ${dotBorderColor}`,
          boxShadow: dark
            ? "0 1px 4px rgba(0,0,0,0.6)"
            : "0 1px 4px rgba(0,0,0,0.25)",
          transition: "left 0.6s ease",
        }}
      />
    </div>
  );
}
