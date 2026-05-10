"use client";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ROYAL } from "./tokens";

type Variant = "primary" | "ghost" | "secondary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Optional Icon links vom Label. */
  leadingIcon?: ReactNode;
  /** Optional Icon rechts (z.B. Pfeil). */
  trailingIcon?: ReactNode;
  /** Volle Breite (z.B. Mobile-CTA). */
  block?: boolean;
}

const SIZES: Record<Size, { padX: number; padY: number; fontSize: number; radius: number }> = {
  sm: { padX: 12, padY: 7,  fontSize: 12, radius: 8 },
  md: { padX: 16, padY: 10, fontSize: 13, radius: 10 },
  lg: { padX: 20, padY: 14, fontSize: 14, radius: 12 },
};

/**
 * Vitalis-Button mit drei Varianten:
 * - `primary`: Royal-Blau Solid (CTA)
 * - `ghost`:   transparenter Hintergrund mit Border (Sekundär-Aktion neben primary)
 * - `secondary`: Stone-100 Hintergrund (z.B. "Eingeben"-Button neben Upload)
 *
 * Tailwind-Klassen für Hover/Dark statt inline styles, damit Theme-Wechsel ohne
 * useDarkMode-Re-Render funktioniert.
 */
export function Button({
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  block = false,
  children,
  className = "",
  style,
  ...rest
}: ButtonProps) {
  const sz = SIZES[size];

  // Tailwind-basierte Style-Klassen pro Variante
  const variantClasses = {
    primary:
      "bg-royal text-white hover:bg-royal-800 active:bg-royal-900 disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900",
    secondary:
      "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700",
  }[variant];

  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold tracking-tight",
        "transition-colors duration-150 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-royal focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 dark:focus-visible:ring-offset-stone-950",
        block ? "w-full" : "",
        variantClasses,
        className,
      ].join(" ")}
      style={{
        padding: `${sz.padY}px ${sz.padX}px`,
        fontSize: sz.fontSize,
        borderRadius: sz.radius,
        // Royal-Color als CSS-var, falls jemand inline override will
        ["--royal" as string]: ROYAL,
        ...style,
      }}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
