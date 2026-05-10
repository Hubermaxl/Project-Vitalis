"use client";
import { useEffect, useState } from "react";
import { SURFACE, scoreAccent } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface ScoreRingProps {
  /** 0–100 */
  score: number;
  /** Pixel-Größe (Quadrat). Default 160. */
  size?: number;
  /** Stroke-Breite. Default 10. */
  strokeWidth?: number;
  /** Override Akzent-Farbe. Wenn null/undefined → grün ≥70, amber ≥50, rot <50. */
  accentColor?: string | null;
  /** Wenn `false`, wird die Mount-Animation übersprungen (z.B. für Server-rendered Snapshots). */
  animate?: boolean;
  /** Nutzt Prozentzeichen hinter der Zahl. Default true. */
  showPercent?: boolean;
}

/**
 * Animierter SVG-Ring zur Score-Anzeige (0–100).
 *
 * Spec: stroke-dasharray Animation 1.4s cubic-bezier(0.34, 1.4, 0.64, 1).
 * Score-Text zentriert, Farbe = accent. Track = stone-200 / stone-800 (dark).
 */
export function ScoreRing({
  score,
  size = 160,
  strokeWidth = 10,
  accentColor = null,
  animate = true,
  showPercent = true,
}: ScoreRingProps) {
  const dark = useDarkMode();
  const clamped = Math.max(0, Math.min(100, score));
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const targetFilled = (clamped / 100) * circ;
  const color = accentColor ?? scoreAccent(clamped);
  const trackColor = dark ? SURFACE.border.d : SURFACE.border.l;
  const subColor   = dark ? SURFACE.fg3.d   : SURFACE.fg2.l;

  // Animations-Trigger: starte bei 0, setze nach Mount auf Zielwert
  // → Browser interpoliert per CSS-transition.
  const [filled, setFilled] = useState(animate ? 0 : targetFilled);
  useEffect(() => {
    if (!animate) {
      setFilled(targetFilled);
      return;
    }
    // Doppeltes rAF stellt sicher, dass der Initial-Wert (0) gepainted wurde,
    // bevor wir auf den Zielwert wechseln — sonst springt der Ring direkt.
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => setFilled(targetFilled));
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, [targetFilled, animate]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${clamped}${showPercent ? "%" : ""}`}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{
          transition: animate
            ? "stroke-dasharray 1.4s cubic-bezier(0.34, 1.4, 0.64, 1)"
            : undefined,
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          // Hinweis: dashoffset = circ/4 dreht den Startpunkt nach oben
          // (zusätzlich zur transform-rotate für die Richtung).
        }}
      />
      {/* Score-Text */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.26}
        fontWeight={800}
        fontFamily="var(--font-dm-sans), DM Sans, sans-serif"
        style={{ letterSpacing: "-0.04em" }}
      >
        {clamped}
        {showPercent && (
          <tspan fontSize={size * 0.12} fontWeight={500} fill={subColor} dx="2">
            %
          </tspan>
        )}
      </text>
    </svg>
  );
}
