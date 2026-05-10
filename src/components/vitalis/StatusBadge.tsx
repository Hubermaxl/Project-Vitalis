"use client";
import type { Status } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface StatusBadgeProps {
  status: Status;
  /** Kompaktere Variante (kleinerer Dot, weniger Padding). */
  small?: boolean;
  /** Optionales Label-Override (z.B. für i18n). Default: deutsche Status-Namen. */
  label?: string;
}

// Light/Dark-Pärchen pro Status. Dot-Farbe ist in beiden Modi gleich (= Statusfarbe).
const CFG: Record<Status, {
  label: string;
  lBg: string; dBg: string;
  lTx: string; dTx: string;
  dot: string;
}> = {
  optimal: {
    label: "Optimal",
    lBg: "#ecfdf5", dBg: "#021a0f",
    lTx: "#065f46", dTx: "#34d399",
    dot: "#059669",
  },
  normal: {
    label: "Normal",
    lBg: "#fffbeb", dBg: "#1c1200",
    lTx: "#92400e", dTx: "#fbbf24",
    dot: "#d97706",
  },
  kritisch: {
    label: "Kritisch",
    lBg: "#fef2f2", dBg: "#1f0a0a",
    lTx: "#991b1b", dTx: "#f87171",
    dot: "#dc2626",
  },
};

/**
 * Pill-Badge mit farbigem Dot. Spec: StatusBadge immer mit Dot, nie nur Text.
 */
export function StatusBadge({ status, small = false, label }: StatusBadgeProps) {
  const dark = useDarkMode();
  const cfg = CFG[status];
  const dotSize = small ? 4 : 5;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: small ? 3 : 4,
        padding: small ? "1px 6px" : "2px 8px",
        borderRadius: 99,
        background: dark ? cfg.dBg : cfg.lBg,
        color: dark ? cfg.dTx : cfg.lTx,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
      {label ?? cfg.label}
    </span>
  );
}
