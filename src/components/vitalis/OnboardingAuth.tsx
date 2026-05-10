"use client";
import { useState } from "react";
import { ScoreRing } from "./ScoreRing";
import { Button } from "./Button";
import { ROYAL, STATUS, SURFACE } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface OnboardingAuthProps {
  isSignup: boolean;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPass: string;
  setAuthPass: (v: string) => void;
  authName: string;
  setAuthName: (v: string) => void;
  profileSex: string;
  setProfileSex: (v: string) => void;
  profileBirthYear: string;
  setProfileBirthYear: (v: string) => void;
  authLoading: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  onSignup: () => void;
  onLogin: () => void;
  setScreen: (s: string) => void;
  /** i18n strings (ist im bestehenden System schon zentralisiert) */
  t: any;
}

/**
 * Auth-Flow im Onboarding-Stil mit Welcome-Ring und Progress-Dots (für Signup).
 * Spec-Quelle: `Vitalis Onboarding.html`. Behält die bestehende Auth-Logik
 * via Props — wir tauschen nur die Optik.
 */
export function OnboardingAuth(props: OnboardingAuthProps) {
  const dark = useDarkMode();
  const {
    isSignup, authEmail, setAuthEmail, authPass, setAuthPass,
    authName, setAuthName, profileSex, setProfileSex,
    profileBirthYear, setProfileBirthYear,
    authLoading, termsAccepted, setTermsAccepted,
    onSignup, onLogin, setScreen, t,
  } = props;

  // Multi-Step nur für Signup. Login ist 1 Step.
  const totalSteps = isSignup ? 2 : 1;
  const [step, setStep] = useState(0);

  const canAdvanceStep0 =
    authEmail.trim().length > 3 &&
    authEmail.includes("@") &&
    authPass.length >= 6;
  const canSubmitSignup =
    canAdvanceStep0 &&
    authName.trim().length > 0 &&
    /^\d{4}$/.test(profileBirthYear) &&
    termsAccepted;

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-royal transition-colors";
  const inputStyle: React.CSSProperties = {
    background: dark ? SURFACE.card.d : "#ffffff",
    border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
    color: dark ? SURFACE.fg.d : SURFACE.fg.l,
  };

  return (
    <div className="max-w-[480px] mx-auto px-6 pt-10 pb-12">
      {/* Progress-Dots (nur bei Signup mit 2 Steps) */}
      {isSignup && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 99,
                background:
                  i === step ? ROYAL : dark ? SURFACE.border.d : "#d4cdc8",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Step 0: Welcome + Credentials */}
      {step === 0 && (
        <div className="animate-fade-up">
          <div className="flex flex-col items-center mb-8">
            <ScoreRing
              score={isSignup ? 0 : 74}
              size={120}
              accentColor={ROYAL}
              showPercent={false}
              animate
            />
            <h1
              className="text-[28px] font-extrabold tracking-tight mt-6 text-center"
              style={{ letterSpacing: "-0.04em" }}
            >
              {isSignup ? "Dein Blutbild." : "Willkommen zurück."}
            </h1>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed text-center mt-2 max-w-[280px]">
              {isSignup
                ? "Verstehe deine Werte. Optimiere deine Longevity. Privat und sicher."
                : "Melde dich an, um deine Blutwerte zu sehen."}
            </p>
          </div>

          <Field label={t.auth.email}>
            <input
              type="email"
              autoComplete="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className={inputClass}
              style={inputStyle}
            />
          </Field>
          <Field label={t.auth.password}>
            <input
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={authPass}
              onChange={(e) => setAuthPass(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              className={inputClass}
              style={inputStyle}
            />
            {isSignup && (
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 px-1">
                Mindestens 6 Zeichen
              </p>
            )}
          </Field>

          {!isSignup ? (
            <Button
              variant="primary"
              size="lg"
              block
              onClick={onLogin}
              disabled={authLoading || !canAdvanceStep0}
              className="mt-2"
            >
              {authLoading ? t.auth.submitLoading : t.auth.submitLogin}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => setStep(1)}
              disabled={!canAdvanceStep0}
              className="mt-2"
            >
              Weiter →
            </Button>
          )}

          <p className="text-center text-[12px] text-stone-500 dark:text-stone-400 mt-6">
            {isSignup ? t.auth.haveAccount : t.auth.noAccount}{" "}
            <button
              type="button"
              onClick={() => setScreen(isSignup ? "login" : "signup")}
              className="font-semibold hover:underline underline-offset-4"
              style={{ color: ROYAL }}
            >
              {isSignup ? t.auth.switchToLogin : t.auth.switchToSignup}
            </button>
          </p>
        </div>
      )}

      {/* Step 1: Profil-Details (nur Signup) */}
      {isSignup && step === 1 && (
        <div className="animate-fade-up">
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-extrabold tracking-tight" style={{ letterSpacing: "-0.04em" }}>
              Erzähl uns von dir
            </h1>
            <p className="text-[13px] text-stone-500 dark:text-stone-400 mt-2 max-w-[300px] mx-auto">
              Geschlecht und Geburtsjahr brauchen wir für die korrekten Referenzbereiche.
            </p>
          </div>

          <Field label={t.auth.name}>
            <input
              type="text"
              autoComplete="given-name"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              placeholder={t.auth.namePlaceholder}
              className={inputClass}
              style={inputStyle}
            />
          </Field>

          <Field label={t.auth.sex}>
            <SegmentControl
              value={profileSex}
              onChange={setProfileSex}
              options={[
                { value: "male", label: t.auth.sexMale },
                { value: "female", label: t.auth.sexFemale },
              ]}
              dark={dark}
            />
          </Field>

          <Field label={t.auth.birthYear}>
            <input
              type="number"
              inputMode="numeric"
              value={profileBirthYear}
              onChange={(e) => setProfileBirthYear(e.target.value)}
              min="1920"
              max="2010"
              placeholder="1990"
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 px-1">
              {t.auth.sexAgeNote}
            </p>
          </Field>

          {/* Terms */}
          <label className="flex items-start gap-3 mt-2 mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 cursor-pointer"
              style={{ accentColor: ROYAL }}
            />
            <span className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
              {t.auth.termsAcceptPrefix}
              <button type="button" onClick={() => setScreen("terms")} className="font-semibold hover:underline underline-offset-4" style={{ color: ROYAL }}>
                {t.auth.termsLink}
              </button>
              {t.auth.termsAcceptMid1}
              <button type="button" onClick={() => setScreen("privacy")} className="font-semibold hover:underline underline-offset-4" style={{ color: ROYAL }}>
                {t.auth.privacyLink}
              </button>
              {t.auth.termsAcceptMid2}
              <button type="button" onClick={() => setScreen("disclaimer")} className="font-semibold hover:underline underline-offset-4" style={{ color: ROYAL }}>
                {t.auth.disclaimerLink}
              </button>
              {t.auth.termsAcceptSuffix}
            </span>
          </label>

          <div className="flex gap-2">
            <Button variant="ghost" size="md" onClick={() => setStep(0)}>
              ← Zurück
            </Button>
            <Button
              variant="primary"
              size="md"
              block
              onClick={onSignup}
              disabled={authLoading || !canSubmitSignup}
            >
              {authLoading ? t.auth.submitLoading : t.auth.submitSignup}
            </Button>
          </div>

          {/* Erfolgs-Hint */}
          <div
            className="mt-6 rounded-xl p-3 flex items-center gap-3"
            style={{
              background: dark ? "rgba(5, 150, 105, 0.1)" : "rgba(5, 150, 105, 0.06)",
              border: `1px solid ${dark ? "rgba(5, 150, 105, 0.3)" : "rgba(5, 150, 105, 0.2)"}`,
            }}
          >
            <span style={{ fontSize: 18 }} aria-hidden="true">🔒</span>
            <p className="text-[11px] leading-relaxed" style={{ color: STATUS.optimal }}>
              Deine Daten sind End-to-End verschlüsselt und werden niemals weitergegeben.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper: Field-Wrapper ──────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1.5 px-1">
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Helper: Segment-Control ────────────────────────────── */

function SegmentControl({
  value,
  onChange,
  options,
  dark,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  dark: boolean;
}) {
  return (
    <div
      role="radiogroup"
      className="flex gap-1 p-1 rounded-xl"
      style={{
        background: dark ? SURFACE.card.d : "#f5f4f2",
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className="flex-1 transition-all"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "10px 12px",
              borderRadius: 8,
              background: active ? (dark ? SURFACE.bg.d : "#ffffff") : "transparent",
              color: active ? (dark ? SURFACE.fg.d : SURFACE.fg.l) : dark ? SURFACE.fg2.d : SURFACE.fg2.l,
              boxShadow: active
                ? dark
                  ? "0 1px 3px rgba(0,0,0,0.4)"
                  : "0 1px 3px rgba(0,0,0,0.06)"
                : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
