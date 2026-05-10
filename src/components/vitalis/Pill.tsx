"use client";
import type { CSSProperties, ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  /** Hintergrund-Farbe (Hex/RGB). */
  bg: string;
  /** Textfarbe. */
  color: string;
  /** Optionaler Border (z.B. für Kategorie-Tags). */
  border?: string;
  /** Farbiger Mini-Dot links neben dem Text. */
  dot?: string;
  /** UPPERCASE + Letter-Spacing für Tag-Optik. */
  uppercase?: boolean;
  /** Kompakter (10px Schrift, weniger Padding). */
  small?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Generisches Pill-Element. StatusBadge ist eine spezialisierte Variante hiervon —
 * diese Pill hier ist für alles andere (Kategorie-Tags, Score-History-Pills, Filter-Tabs).
 */
export function Pill({
  children,
  bg,
  color,
  border,
  dot,
  uppercase = false,
  small = false,
  className,
  style,
}: PillProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dot ? (small ? 4 : 5) : 0,
        padding: small ? "1px 6px" : "2px 8px",
        borderRadius: 99,
        background: bg,
        color,
        border: border ? `1px solid ${border}` : undefined,
        fontSize: small ? 10 : 11,
        fontWeight: uppercase ? 700 : 600,
        letterSpacing: uppercase ? "0.06em" : "0.02em",
        textTransform: uppercase ? "uppercase" : "none",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        ...style,
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: small ? 4 : 5,
            height: small ? 4 : 5,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
