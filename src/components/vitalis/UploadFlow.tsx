"use client";
import { useEffect, useMemo, useState } from "react";
import { BLOOD_MARKERS, getStatus } from "@/lib/markers";
import { ScoreRing } from "./ScoreRing";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";
import { Pill } from "./Pill";
import { ROYAL, STATUS, SURFACE } from "./tokens";
import { useDarkMode } from "./useDarkMode";
import { normalizeStatus } from "./adapters";

type Step = "scan" | "ocr" | "confirm" | "success";

interface UploadFlowProps {
  sex: string;
  /** Vorhandene Panels (für Delta-Vergleich im Confirm-Step). */
  prevValues?: Record<string, number>;
  /** Wird aufgerufen, wenn der Nutzer "Speichern" tappt — committed das Panel. */
  onCommit: (
    date: string,
    lab: string,
    values: Record<string, number>
  ) => Promise<void> | void;
  onCancel: () => void;
  /** Nach Erfolgs-Screen-Tap: zurück zum Dashboard. */
  onDone: () => void;
}

/**
 * Vitalis Upload-Flow: Scan → OCR → Bestätigung → Erfolg.
 * Entspricht `Vitalis Upload Flow.html`.
 *
 * UI-only OCR — wir erzeugen plausible Mock-Werte aus den Essential-Markern
 * und zeigen den Animations-Flow. Beim Confirm-Step wird real gespeichert.
 */
export function UploadFlow({
  sex,
  prevValues,
  onCommit,
  onCancel,
  onDone,
}: UploadFlowProps) {
  const [step, setStep] = useState<Step>("scan");
  const [recognized, setRecognized] = useState<RecognizedMarker[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [lab, setLab] = useState("");
  const [savingError, setSavingError] = useState<string | null>(null);
  const [committedCount, setCommittedCount] = useState(0);

  const handleScanComplete = () => {
    setRecognized(generateMockRecognition(sex));
    setStep("ocr");
  };

  const handleOcrComplete = () => {
    setStep("confirm");
  };

  const handleSave = async (final: RecognizedMarker[]) => {
    setSavingError(null);
    const valuesObj: Record<string, number> = {};
    let n = 0;
    for (const r of final) {
      if (!r.confirmed) continue;
      if (typeof r.value !== "number" || isNaN(r.value)) continue;
      valuesObj[r.markerId] = r.value;
      n++;
    }
    if (n === 0) {
      setSavingError("Bitte mindestens einen Wert bestätigen.");
      return;
    }
    try {
      await onCommit(date, lab, valuesObj);
      setCommittedCount(n);
      setStep("success");
    } catch (e: any) {
      setSavingError(e?.message || "Speichern fehlgeschlagen.");
    }
  };

  if (step === "scan") {
    return <ScanStep onShutter={handleScanComplete} onCancel={onCancel} />;
  }
  if (step === "ocr") {
    return <OcrStep recognized={recognized} onContinue={handleOcrComplete} />;
  }
  if (step === "confirm") {
    return (
      <ConfirmStep
        initial={recognized}
        sex={sex}
        date={date}
        lab={lab}
        onDateChange={setDate}
        onLabChange={setLab}
        prevValues={prevValues}
        onSave={handleSave}
        onCancel={onCancel}
        savingError={savingError}
      />
    );
  }
  return <SuccessStep count={committedCount} onDone={onDone} />;
}

/* ─── Step 1: Scan ──────────────────────────────────────── */

function ScanStep({
  onShutter,
  onCancel,
}: {
  onShutter: () => void;
  onCancel: () => void;
}) {
  const [recognized, setRecognized] = useState(false);
  const [flash, setFlash] = useState(false);

  // Simuliere Erkennung nach 2s
  useEffect(() => {
    const t = setTimeout(() => setRecognized(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const cornerColor = recognized ? STATUS.optimal : "#ffffff";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#000000", color: "#ffffff" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 pt-5 pb-3"
        style={{ paddingTop: "max(20px, env(safe-area-inset-top))" }}
      >
        <button
          type="button"
          aria-label="Schließen"
          onClick={onCancel}
          className="flex items-center justify-center transition-opacity hover:opacity-70"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Blitz"
          aria-pressed={flash}
          onClick={() => setFlash((f) => !f)}
          className="flex items-center justify-center transition-opacity hover:opacity-70"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: flash ? "#fbbf24" : "rgba(255,255,255,0.12)",
            color: flash ? "#000" : "#fff",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>
      </div>

      {/* Scan-Frame */}
      <div className="flex-1 flex items-center justify-center px-8 relative">
        <div
          className="relative"
          style={{
            width: "100%",
            maxWidth: 320,
            aspectRatio: "3 / 4",
          }}
        >
          {/* 4 Corner pieces */}
          <Corner pos="tl" color={cornerColor} />
          <Corner pos="tr" color={cornerColor} />
          <Corner pos="bl" color={cornerColor} />
          <Corner pos="br" color={cornerColor} />

          {/* Scan-Laser */}
          {!recognized && (
            <div
              className="animate-scan-laser"
              style={{
                position: "absolute",
                left: 8,
                right: 8,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${ROYAL}, transparent)`,
                boxShadow: `0 0 12px ${ROYAL}`,
                borderRadius: 1,
              }}
            />
          )}

          {/* Recognized: Check + Pulse-Ring */}
          {recognized && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: STATUS.optimal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                aria-hidden="true"
                className="animate-pulse-ring"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${STATUS.optimal}`,
                }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Bottom tray */}
      <div
        className="px-6 pb-8 pt-4 flex flex-col items-center gap-4"
        style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom))" }}
      >
        <p className="text-[12px] text-stone-300 text-center max-w-[240px]">
          {recognized
            ? "Dokument erkannt — bereit zum Aufnehmen"
            : "Halte den Befund im Rahmen — gut beleuchtet und gerade"}
        </p>
        <div className="flex items-center gap-6 w-full justify-center">
          <button
            type="button"
            aria-label="Aus Galerie wählen"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Aufnehmen"
            onClick={onShutter}
            className="transition-transform active:scale-95"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: recognized ? STATUS.optimal : "#ffffff",
              border: "3px solid rgba(255,255,255,0.4)",
              boxShadow: recognized
                ? `0 0 24px ${STATUS.optimal}`
                : "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />
          <button
            type="button"
            aria-label="Info"
            className="flex items-center justify-center transition-opacity hover:opacity-70"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Corner({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const size = 22;
  const stroke = 3;
  const offset = -2;
  const base = {
    position: "absolute" as const,
    width: size,
    height: size,
    borderColor: color,
    borderStyle: "solid",
    transition: "border-color 0.4s ease",
  };
  const styles: Record<string, React.CSSProperties> = {
    tl: { ...base, top: offset, left: offset, borderTopWidth: stroke, borderLeftWidth: stroke, borderRadius: "6px 0 0 0" },
    tr: { ...base, top: offset, right: offset, borderTopWidth: stroke, borderRightWidth: stroke, borderRadius: "0 6px 0 0" },
    bl: { ...base, bottom: offset, left: offset, borderBottomWidth: stroke, borderLeftWidth: stroke, borderRadius: "0 0 0 6px" },
    br: { ...base, bottom: offset, right: offset, borderBottomWidth: stroke, borderRightWidth: stroke, borderRadius: "0 0 6px 0" },
  };
  return <div style={styles[pos]} aria-hidden="true" />;
}

/* ─── Step 2: OCR-Feedback ──────────────────────────────── */

interface RecognizedMarker {
  markerId: string;
  name: string;
  unit: string;
  value: number;
  confidence: number; // 0-100
  confirmed: boolean;
}

function OcrStep({
  recognized,
  onContinue,
}: {
  recognized: RecognizedMarker[];
  onContinue: () => void;
}) {
  const dark = useDarkMode();
  const [progress, setProgress] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const total = recognized.length;
  const done = progress >= 100 && revealedCount >= total;

  // Progress 0 → 100 über 2400ms
  useEffect(() => {
    const start = Date.now();
    const dur = 2400;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / dur);
      setProgress(Math.round(t * 100));
      if (t >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Reihen erscheinen sequenziell mit 180ms Delay
  useEffect(() => {
    const timeouts: number[] = [];
    for (let i = 0; i < total; i++) {
      const id = window.setTimeout(() => setRevealedCount(i + 1), 180 * (i + 1));
      timeouts.push(id);
    }
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [total]);

  return (
    <div className="max-w-[480px] mx-auto px-6 pt-12 pb-24">
      {/* Spinner / Check */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: done
              ? STATUS.optimal
              : dark
              ? SURFACE.card.d
              : "#f5f4f2",
            border: `2px solid ${done ? STATUS.optimal : ROYAL}`,
            transition: "all 0.3s ease",
          }}
        >
          {done ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={ROYAL} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1.2s" repeatCount="indefinite" />
              </path>
            </svg>
          )}
        </div>
        <h2 className="text-[18px] font-extrabold tracking-tight mb-1">
          {done ? "Erkennung abgeschlossen" : "Werte werden erkannt …"}
        </h2>
        <p className="text-[12px] text-stone-500 dark:text-stone-400">
          {done
            ? `${total} Marker gefunden`
            : "Bitte einen Moment Geduld"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">
            Fortschritt
          </span>
          <span className="text-[12px] font-bold tabular-nums" style={{ color: ROYAL }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: dark ? SURFACE.border.d : SURFACE.border.l,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: ROYAL,
              transition: "width 0.18s linear",
            }}
          />
        </div>
      </div>

      {/* Marker-Liste mit Reveal-Animation */}
      <div className="flex flex-col gap-2 mb-6">
        {recognized.map((r, i) => {
          const visible = i < revealedCount;
          return (
            <div
              key={r.markerId}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
            >
              {visible ? (
                <OcrRow row={r} dark={dark} />
              ) : (
                <Shimmer dark={dark} />
              )}
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      {done && (
        <div className="animate-fade-up">
          <Button variant="primary" size="lg" block onClick={onContinue}>
            Werte überprüfen →
          </Button>
        </div>
      )}
    </div>
  );
}

function OcrRow({ row, dark }: { row: RecognizedMarker; dark: boolean }) {
  const m = BLOOD_MARKERS.find((b) => b.id === row.markerId);
  const status = m
    ? normalizeStatus(getStatus(row.value, m, "male").status)
    : "normal";
  const confColor =
    row.confidence >= 95 ? STATUS.optimal : row.confidence >= 88 ? STATUS.normal : STATUS.kritisch;

  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: STATUS[status],
            flexShrink: 0,
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-semibold tracking-tight truncate">
              {row.name}
            </span>
            <span className="text-[13px] font-bold tabular-nums">
              {row.value}{" "}
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                {row.unit}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div
              style={{
                flex: 1,
                height: 3,
                borderRadius: 1.5,
                background: dark ? SURFACE.border.d : SURFACE.border.l,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${row.confidence}%`,
                  background: confColor,
                }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: confColor, minWidth: 28 }}>
              {row.confidence}%
            </span>
            <StatusBadge status={status} small />
          </div>
        </div>
      </div>
    </div>
  );
}

function Shimmer({ dark }: { dark: boolean }) {
  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        height: 60,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, transparent, ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}, transparent)`,
          animation: "vitalis-shimmer 1.4s linear infinite",
        }}
      />
      <style>{`
        @keyframes vitalis-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

/* ─── Step 3: Confirm ────────────────────────────────────── */

function ConfirmStep({
  initial,
  sex,
  date,
  lab,
  onDateChange,
  onLabChange,
  prevValues,
  onSave,
  onCancel,
  savingError,
}: {
  initial: RecognizedMarker[];
  sex: string;
  date: string;
  lab: string;
  onDateChange: (d: string) => void;
  onLabChange: (l: string) => void;
  prevValues?: Record<string, number>;
  onSave: (final: RecognizedMarker[]) => Promise<void> | void;
  onCancel: () => void;
  savingError: string | null;
}) {
  const dark = useDarkMode();
  const [rows, setRows] = useState<RecognizedMarker[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const counts = useMemo(() => {
    let confirmed = 0;
    let needsCheck = 0;
    for (const r of rows) {
      if (!r.confirmed) continue;
      confirmed++;
      if (r.confidence < 88) needsCheck++;
    }
    return { recognized: rows.length, confirmed, needsCheck };
  }, [rows]);

  const updateRow = (id: string, patch: Partial<RecognizedMarker>) => {
    setRows((prev) =>
      prev.map((r) => (r.markerId === id ? { ...r, ...patch } : r))
    );
  };

  const lowConf = rows.filter((r) => r.confidence < 88);
  const highConf = rows.filter((r) => r.confidence >= 88);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(rows);
    setSaving(false);
  };

  return (
    <div className="max-w-[480px] mx-auto px-6 pt-6 pb-32">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-extrabold tracking-tight mb-1">
          Werte bestätigen
        </h1>
        <p className="text-[13px] text-stone-500 dark:text-stone-400">
          Prüfe die erkannten Werte. Tippe auf den Stift zum Bearbeiten.
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <SummaryChip label="Erkannt" count={counts.recognized} color={ROYAL} dark={dark} />
        <SummaryChip label="Bestätigt" count={counts.confirmed} color={STATUS.optimal} dark={dark} />
        <SummaryChip label="Prüfen" count={counts.needsCheck} color={STATUS.normal} dark={dark} />
      </div>

      {/* Date + Lab */}
      <div
        className="rounded-2xl p-4 mb-5 border grid grid-cols-2 gap-3"
        style={{
          background: dark ? SURFACE.card.d : SURFACE.card.l,
          borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
        }}
      >
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            Testdatum
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full text-[13px] font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-royal rounded px-1 py-0.5 -mx-1"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-1">
            Labor
          </label>
          <input
            type="text"
            value={lab}
            onChange={(e) => onLabChange(e.target.value)}
            placeholder="optional"
            className="w-full text-[13px] font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-royal rounded px-1 py-0.5 -mx-1"
          />
        </div>
      </div>

      {/* Bitte prüfen */}
      {lowConf.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Pill bg={dark ? "#1c1200" : "#fffbeb"} color={dark ? "#fbbf24" : "#92400e"} dot={STATUS.normal} small uppercase>
              Bitte prüfen
            </Pill>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              Niedrige Erkennungs-Konfidenz
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {lowConf.map((r) => (
              <ConfirmRow
                key={r.markerId}
                row={r}
                editing={editingId === r.markerId}
                prevValue={prevValues?.[r.markerId]}
                onEdit={() => setEditingId(r.markerId)}
                onClose={() => setEditingId(null)}
                onChange={(patch) => updateRow(r.markerId, patch)}
                dark={dark}
                sex={sex}
                emphasis="warn"
              />
            ))}
          </div>
        </section>
      )}

      {/* Bestätigte */}
      {highConf.length > 0 && (
        <section className="mb-5">
          <p className="text-[11px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-2">
            Bestätigt
          </p>
          <div className="flex flex-col gap-2">
            {highConf.map((r) => (
              <ConfirmRow
                key={r.markerId}
                row={r}
                editing={editingId === r.markerId}
                prevValue={prevValues?.[r.markerId]}
                onEdit={() => setEditingId(r.markerId)}
                onClose={() => setEditingId(null)}
                onChange={(patch) => updateRow(r.markerId, patch)}
                dark={dark}
                sex={sex}
              />
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {savingError && (
        <p
          className="text-[12px] mb-3 px-3 py-2 rounded-lg"
          style={{
            background: dark ? "rgba(220, 38, 38, 0.1)" : "#fef2f2",
            color: dark ? "#fca5a5" : "#991b1b",
          }}
        >
          {savingError}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="ghost" size="md" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          size="md"
          block
          onClick={handleSubmit}
          disabled={saving || counts.confirmed === 0}
        >
          {saving ? "Speichern…" : `${counts.confirmed} Werte speichern`}
        </Button>
      </div>
    </div>
  );
}

function SummaryChip({
  label,
  count,
  color,
  dark,
}: {
  label: string;
  count: number;
  color: string;
  dark: boolean;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2 border flex-1 min-w-[88px]"
      style={{
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        borderColor: dark ? SURFACE.border.d : SURFACE.border.l,
      }}
    >
      <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">
        {label}
      </p>
      <p className="text-[18px] font-extrabold tabular-nums" style={{ color }}>
        {count}
      </p>
    </div>
  );
}

function ConfirmRow({
  row,
  editing,
  prevValue,
  onEdit,
  onClose,
  onChange,
  dark,
  sex,
  emphasis,
}: {
  row: RecognizedMarker;
  editing: boolean;
  prevValue?: number;
  onEdit: () => void;
  onClose: () => void;
  onChange: (patch: Partial<RecognizedMarker>) => void;
  dark: boolean;
  sex: string;
  emphasis?: "warn";
}) {
  const m = BLOOD_MARKERS.find((b) => b.id === row.markerId);
  const status = m ? normalizeStatus(getStatus(row.value, m, sex).status) : "normal";
  const delta =
    prevValue !== undefined && prevValue !== 0
      ? Math.round(((row.value - prevValue) / prevValue) * 100)
      : null;

  const borderColor = emphasis === "warn"
    ? STATUS.normal
    : !row.confirmed
    ? dark ? SURFACE.border.d : SURFACE.border.l
    : dark ? SURFACE.border.d : SURFACE.border.l;

  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: dark ? SURFACE.card.d : SURFACE.card.l,
        borderColor,
        borderWidth: emphasis === "warn" ? 1 : 1,
        opacity: row.confirmed ? 1 : 0.55,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Confirm-Toggle */}
        <button
          type="button"
          aria-label={row.confirmed ? "Bestätigt — abwählen" : "Bestätigen"}
          onClick={() => onChange({ confirmed: !row.confirmed })}
          className="flex-shrink-0 flex items-center justify-center transition-colors"
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: row.confirmed ? STATUS.optimal : "transparent",
            border: `2px solid ${row.confirmed ? STATUS.optimal : dark ? SURFACE.border.d : SURFACE.border.l}`,
          }}
        >
          {row.confirmed && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold tracking-tight truncate">
              {row.name}
            </span>
            <StatusBadge status={status} small />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <span>{row.unit}</span>
            {delta !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span style={{ color: delta > 0 ? STATUS.kritisch : STATUS.optimal }}>
                  {delta > 0 ? "↑" : delta < 0 ? "↓" : "±"} {Math.abs(delta)}% vs. letztes Panel
                </span>
              </>
            )}
          </div>
        </div>

        {/* Value: anzeigen oder editieren */}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="any"
              value={row.value}
              onChange={(e) => onChange({ value: parseFloat(e.target.value) || 0 })}
              autoFocus
              className="w-20 text-[15px] font-bold text-right tabular-nums px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-royal"
              style={{
                background: dark ? SURFACE.bg.d : "#f5f4f2",
                color: STATUS[status],
              }}
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Fertig"
              className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded"
              style={{ color: ROYAL }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 hover:opacity-80 transition-opacity"
            aria-label={`${row.name} bearbeiten`}
          >
            <span
              className="text-[15px] font-bold tabular-nums"
              style={{ color: STATUS[status] }}
            >
              {row.value}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-600">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Step 4: Success ────────────────────────────────────── */

function SuccessStep({ count, onDone }: { count: number; onDone: () => void }) {
  const [score] = useState(100); // Animations-Trigger über ScoreRing
  return (
    <div className="max-w-[480px] mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center">
      <div className="mb-6">
        <ScoreRing score={score} size={140} accentColor={STATUS.optimal} showPercent={false} animate />
      </div>
      <h1 className="text-[24px] font-extrabold tracking-tight mb-2">
        Gespeichert!
      </h1>
      <p className="text-stone-500 dark:text-stone-400 text-[14px] mb-8 max-w-xs">
        {count} {count === 1 ? "Wert wurde" : "Werte wurden"} deinem Profil hinzugefügt. Dein Longevity-Score ist auf dem neusten Stand.
      </p>
      <Button variant="primary" size="lg" block onClick={onDone}>
        Zum Dashboard
      </Button>
    </div>
  );
}

/* ─── Mock-Daten-Generator ──────────────────────────────── */

function generateMockRecognition(sex: string): RecognizedMarker[] {
  const essentialIds = [
    "hb", "wbc", "glucose", "hba1c", "ldl", "hdl", "trig", "crp", "alt", "vitd", "tsh", "ferritin",
  ];
  const s = sex === "female" ? "f" : "m";
  return essentialIds
    .map((id) => {
      const m = BLOOD_MARKERS.find((bm) => bm.id === id);
      if (!m) return null;
      const lo = m[`ref_min_${s}` as keyof typeof m] as number;
      const hi = m[`ref_max_${s}` as keyof typeof m] as number;
      const span = hi - lo;
      // 70% Wahrscheinlichkeit innerhalb Range, sonst leicht außerhalb
      const inRange = Math.random() < 0.7;
      const raw = inRange
        ? lo + Math.random() * span
        : Math.random() < 0.5
        ? lo - span * 0.05
        : hi + span * 0.08;
      // Auf sinnvolle Dezimalstellen runden
      const decimals = span < 5 ? 1 : 0;
      const value = parseFloat(raw.toFixed(decimals));
      // Konfidenz 80–99
      const confidence = Math.floor(80 + Math.random() * 20);
      return {
        markerId: id,
        name: m.name_de,
        unit: m.unit,
        value,
        confidence,
        confirmed: confidence >= 88, // unter 88% defaultmäßig nicht bestätigt
      };
    })
    .filter((x): x is RecognizedMarker => x !== null);
}
