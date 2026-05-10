/**
 * i18n entry point.
 *
 * Usage:
 *   import { t } from "@/lib/i18n";
 *   <h1>{t.auth.signupTitle}</h1>
 *   notify(t.toast.welcome);
 *   notify(t.toast.panelSaved(vals.length)); // function templates
 *
 * Today: only German is wired up. The English file mirrors the shape and
 * lives at lib/i18n/en.ts; switch by changing the line below or wrapping
 * `t` in a runtime locale switcher when we add a language toggle.
 *
 * Why no React context yet: the app currently has no language toggle UI,
 * so a module-level export is simplest and zero-overhead. When we add a
 * toggle, replace `t = de` with a Proxy that reads the active locale from
 * a context/localStorage — no call sites need to change.
 */
import { de } from "./i18n/de";

export const t = de;
export type Strings = typeof de;

// Available locales (kept here so adding "en" later is one-line)
export const LOCALES = ["de"] as const;
export type Locale = (typeof LOCALES)[number];

// Stub for future locale switching. No-op today.
let _activeLocale: Locale = "de";
export const getLocale = (): Locale => _activeLocale;
export const setLocale = (l: Locale) => {
  _activeLocale = l;
};
