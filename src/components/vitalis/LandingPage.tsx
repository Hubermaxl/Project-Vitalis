"use client";
import { ScoreRing } from "./ScoreRing";
import { SparkLine } from "./SparkLine";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Pill } from "./Pill";
import { ROYAL, STATUS, SURFACE } from "./tokens";
import { useDarkMode } from "./useDarkMode";

interface LandingPageProps {
  onSignup: () => void;
  onLogin: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onImpressum: () => void;
  onDisclaimer: () => void;
}

/**
 * Vitalis Landing Page — Desktop-first Marketing-Seite.
 * Spec-Quelle: `Vitalis Landing Page.html`. Komprimierte Variante mit
 * Hero / Stats / Features / How-It-Works / Final-CTA / Footer.
 */
export function LandingPage({
  onSignup, onLogin, onPrivacy, onTerms, onImpressum, onDisclaimer,
}: LandingPageProps) {
  const dark = useDarkMode();

  return (
    <div
      className="min-h-screen"
      style={{
        background: dark ? SURFACE.bg.d : SURFACE.bg.l,
        color: dark ? SURFACE.fg.d : SURFACE.fg.l,
      }}
    >
      {/* ─── Nav ─────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-30 backdrop-blur"
        style={{
          background: dark ? "rgba(12, 10, 9, 0.8)" : "rgba(250, 250, 249, 0.8)",
          borderBottom: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="rounded-md flex items-center justify-center text-white font-extrabold"
              style={{ width: 28, height: 28, background: ROYAL, fontSize: 13, letterSpacing: "-0.04em" }}
            >
              V
            </div>
            <span className="text-[15px] font-extrabold tracking-tight">Vitalis</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLogin}>
              Anmelden
            </Button>
            <Button variant="primary" size="sm" onClick={onSignup}>
              Loslegen
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-fade-up">
            <Pill
              bg={dark ? "rgba(29, 78, 216, 0.15)" : "rgba(29, 78, 216, 0.08)"}
              color={ROYAL}
              dot={ROYAL}
              uppercase
              small
              style={{ marginBottom: 20 }}
            >
              Longevity-Tracking · DSGVO-konform
            </Pill>
            <h1
              className="font-extrabold tracking-tight leading-[1.05] mb-6"
              style={{
                fontSize: "clamp(36px, 6vw, 58px)",
                letterSpacing: "-0.04em",
              }}
            >
              Dein Blutbild.
              <br />
              <span style={{ color: ROYAL }}>Entschlüsselt.</span>
            </h1>
            <p className="text-[16px] lg:text-[17px] leading-relaxed mb-8 max-w-xl text-stone-600 dark:text-stone-300">
              Verstehe deine Werte. Sieh den Unterschied zwischen „normal" und{" "}
              <em>optimal</em>. Tracke deinen Longevity-Score über die Jahre — privat und sicher.
            </p>
            <div className="flex gap-3 flex-wrap mb-8">
              <Button variant="primary" size="lg" onClick={onSignup}>
                Kostenlos starten →
              </Button>
              <Button variant="ghost" size="lg" onClick={onLogin}>
                Anmelden
              </Button>
            </div>
            {/* Trust-Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex -space-x-2">
                {["#1d4ed8", "#7c3aed", "#059669", "#d97706"].map((c, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c,
                      border: `2px solid ${dark ? SURFACE.bg.d : SURFACE.bg.l}`,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-[12px] text-stone-500 dark:text-stone-400">
                <span className="font-bold text-stone-700 dark:text-stone-200">1.240+</span>{" "}
                Personen tracken bereits ihre Werte
              </p>
            </div>
          </div>

          {/* Right: ScoreRing + Floating Cards */}
          <div className="relative flex items-center justify-center" style={{ minHeight: 380 }}>
            {/* Background Glow */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${dark ? "rgba(29, 78, 216, 0.18)" : "rgba(29, 78, 216, 0.1)"}, transparent 70%)`,
              }}
            />
            <div className="relative">
              <ScoreRing score={74} size={260} accentColor={ROYAL} animate />
            </div>

            {/* Float Card A — top left */}
            <FloatCard
              dark={dark}
              className="animate-float-a"
              style={{ position: "absolute", top: 20, left: 0 }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                LDL
              </p>
              <p className="text-[18px] font-extrabold tabular-nums" style={{ color: STATUS.optimal }}>
                94 <span className="text-[10px] text-stone-500 font-normal">mg/dl</span>
              </p>
              <StatusBadge status="optimal" small />
            </FloatCard>

            {/* Float Card B — bottom right */}
            <FloatCard
              dark={dark}
              className="animate-float-b"
              style={{ position: "absolute", bottom: 30, right: 0 }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                HbA1c
              </p>
              <p className="text-[18px] font-extrabold tabular-nums" style={{ color: STATUS.optimal }}>
                5.2 <span className="text-[10px] text-stone-500 font-normal">%</span>
              </p>
              <StatusBadge status="optimal" small />
            </FloatCard>

            {/* Sparkline Card — middle right */}
            <FloatCard
              dark={dark}
              className="animate-float-a"
              style={{ position: "absolute", top: "50%", right: -8, transform: "translateY(-50%)" }}
            >
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Trend
              </p>
              <SparkLine data={[55, 60, 67, 72, 74]} color={ROYAL} width={72} height={24} strokeWidth={2} />
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                +19% in 12 Mo
              </p>
            </FloatCard>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ───────────────────────────────────── */}
      <section
        className="border-y"
        style={{
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
          background: dark ? SURFACE.card.d : "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-stone-200 dark:md:divide-stone-800">
          {[
            { num: "34", lbl: "Marker getrackt" },
            { num: "9", lbl: "Kategorien" },
            { num: "1.240+", lbl: "Frühe Nutzer" },
            { num: "100%", lbl: "DSGVO-konform" },
          ].map((s, i) => (
            <div key={i} className={`text-center ${i > 0 ? "md:pl-8" : ""}`}>
              <p className="text-[28px] font-extrabold tracking-tight" style={{ color: ROYAL, letterSpacing: "-0.04em" }}>
                {s.num}
              </p>
              <p className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mt-1">
                {s.lbl}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2
            className="font-extrabold tracking-tight mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.045em" }}
          >
            Was Vitalis anders macht
          </h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            Standard-Befunde sagen dir ob du krank bist. Vitalis zeigt dir, wie du am besten gesund bleibst.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "📊", title: "Optimal vs. normal", desc: "Sieh nicht nur den klinischen Referenzbereich, sondern auch den Longevity-Optimalbereich nach Dr. Peter Attia." },
            { icon: "📈", title: "Trend über Jahre", desc: "Werte ändern sich langsam. Vitalis zeigt dir auf einen Blick, ob du dich verbesserst oder stagnierst." },
            { icon: "🎯", title: "Pro Marker handeln", desc: "Jeder Wert kommt mit klaren Hinweisen, was ihn beeinflusst und welche Maßnahmen wirken." },
            { icon: "🔒", title: "Privat & sicher", desc: "Deine Werte liegen verschlüsselt auf EU-Servern. Kein Tracking, kein Verkauf, kein Werbung." },
            { icon: "🇦🇹", title: "Österreichische Referenz", desc: "Alle Werte sind auf österreichische Laborstandards kalibriert — keine US-Einheiten-Verwirrung." },
            { icon: "📷", title: "Befund fotografieren", desc: "Foto vom Laborbericht aufnehmen — Werte werden automatisch erkannt und übernommen." },
          ].map((f) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} dark={dark} />
          ))}
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────── */}
      <section
        className="border-t"
        style={{
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
          background: dark ? SURFACE.card.d : "#ffffff",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
          <div className="text-center mb-14">
            <h2
              className="font-extrabold tracking-tight mb-3"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.045em" }}
            >
              In drei Schritten
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector-Line */}
            <div
              aria-hidden="true"
              className="hidden md:block"
              style={{
                position: "absolute",
                top: 32,
                left: "16%",
                right: "16%",
                height: 2,
                background: dark ? SURFACE.border.d : SURFACE.border.l,
              }}
            />
            {[
              { n: 1, title: "Befund hochladen", desc: "Foto oder PDF deines Laborberichts. Werte werden automatisch erkannt." },
              { n: 2, title: "Werte verstehen", desc: "Sieh sofort, welche Werte optimal sind und welche Aufmerksamkeit verdienen." },
              { n: 3, title: "Trends erkennen", desc: "Tracke deinen Longevity-Score über die Zeit — und handle gezielt." },
            ].map((s) => (
              <div key={s.n} className="relative text-center">
                <div
                  className="mx-auto mb-4 flex items-center justify-center font-extrabold text-white"
                  style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: s.n === 1 ? ROYAL : dark ? SURFACE.card.d : "#ffffff",
                    border: s.n === 1 ? "none" : `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
                    color: s.n === 1 ? "#ffffff" : dark ? SURFACE.fg.d : SURFACE.fg.l,
                    fontSize: 22,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.n}
                </div>
                <h3 className="text-[16px] font-bold tracking-tight mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-[260px] mx-auto">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: ROYAL,
          color: "#ffffff",
        }}
      >
        {/* Grid-Texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 py-20 lg:py-28 text-center">
          <h2
            className="font-extrabold tracking-tight mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.045em" }}
          >
            Dein Blutbild verdient mehr.
          </h2>
          <p className="text-[15px] lg:text-[17px] mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>
            Starte kostenlos. Kein Abo, keine Werbung. Nur deine Werte und ihr ehrlicher Kontext.
          </p>
          <div className="flex justify-center">
            <button
              onClick={onSignup}
              className="font-bold transition-transform active:scale-95 hover:bg-stone-100"
              style={{
                background: "#ffffff",
                color: ROYAL,
                padding: "16px 32px",
                fontSize: 15,
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              }}
            >
              Kostenlos starten →
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer
        style={{
          background: dark ? "#0c0a09" : "#1c1917",
          color: "#a8a29e",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-14">
          <div className="grid sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="rounded-md flex items-center justify-center text-white font-extrabold"
                  style={{ width: 24, height: 24, background: ROYAL, fontSize: 11 }}
                >
                  V
                </div>
                <span className="text-[14px] font-extrabold text-white">Vitalis</span>
              </div>
              <p className="text-[12px] leading-relaxed">
                Longevity-Tracking aus Österreich. DSGVO-konform, ohne Tracking, ohne Werbung.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-3">
                Rechtliches
              </p>
              <ul className="space-y-2 text-[12px]">
                <li><button onClick={onPrivacy} className="hover:text-white transition-colors">Datenschutz</button></li>
                <li><button onClick={onTerms} className="hover:text-white transition-colors">Nutzungsbedingungen</button></li>
                <li><button onClick={onDisclaimer} className="hover:text-white transition-colors">Medizinischer Hinweis</button></li>
                <li><button onClick={onImpressum} className="hover:text-white transition-colors">Impressum</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-3">
                Vertrauen
              </p>
              <ul className="space-y-2 text-[12px]">
                <li>🇪🇺 EU-Server</li>
                <li>🔒 Verschlüsselt</li>
                <li>🇦🇹 Made in Austria</li>
                <li>🚫 Kein Tracking</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-stone-800 text-[11px] leading-relaxed">
            <strong className="text-stone-300">Hinweis:</strong> Vitalis ersetzt keine ärztliche Diagnose. Die Inhalte dienen
            ausschließlich der persönlichen Information. Bei Fragen zur Interpretation deiner Werte wende dich an deine
            Ärztin oder deinen Arzt.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Hilfs-Komponenten ─────────────────────────────────── */

function FloatCard({
  children,
  dark,
  className,
  style,
}: {
  children: React.ReactNode;
  dark: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        background: dark ? SURFACE.card.d : "#ffffff",
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
        borderRadius: 14,
        padding: "10px 12px",
        boxShadow: dark
          ? "0 8px 24px rgba(0,0,0,0.4)"
          : "0 8px 24px rgba(0,0,0,0.08)",
        minWidth: 100,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function FeatureCard({
  icon, title, desc, dark,
}: {
  icon: string; title: string; desc: string; dark: boolean;
}) {
  return (
    <article
      className="rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: dark ? SURFACE.card.d : "#ffffff",
        border: `1px solid ${dark ? SURFACE.border.d : SURFACE.border.l}`,
      }}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: dark ? "rgba(29, 78, 216, 0.15)" : "rgba(29, 78, 216, 0.08)",
          fontSize: 22,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="text-[15px] font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed">
        {desc}
      </p>
    </article>
  );
}
