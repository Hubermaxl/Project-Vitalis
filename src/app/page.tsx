"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  BLOOD_MARKERS,
  CATEGORY_ORDER,
  getStatus,
  getMarkersByCategory,
  getSummaryStats,
  type BloodMarker,
} from "@/lib/markers";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface PanelValue { markerId: string; value: number; }
interface Panel {
  id: string;
  user_id: string;
  test_date: string;
  lab_name: string | null;
  values: PanelValue[];
}
interface Profile {
  id: string;
  display_name: string;
  sex: string;
  birth_year: number;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

// ─── RANGE BAR ──────────────────────────────────────────────────────────────
function RangeBar({ value, marker, sex }: { value: number; marker: BloodMarker; sex: string }) {
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;

  const rangeSpan = refMax - refMin;
  const pad = rangeSpan * 0.25;
  const low = Math.max(0, refMin - pad);
  const high = refMax + pad;
  const total = high - low;

  const clamp = (v: number) => Math.min(100, Math.max(0, ((v - low) / total) * 100));
  const optLeft = clamp(optMin);
  const optWidth = clamp(optMax) - optLeft;
  const valPos = clamp(value);
  const si = getStatus(value, marker, sex);

  return (
    <div className="mt-2 mb-1">
      <div className="relative h-2 bg-stone-100 rounded-full overflow-visible">
        {/* Optimal zone */}
        <div
          className="absolute top-0 h-full rounded-full opacity-30"
          style={{ left: `${optLeft}%`, width: `${optWidth}%`, backgroundColor: "#059669" }}
        />
        {/* Value dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow z-10"
          style={{ left: `calc(${valPos}% - 6px)`, backgroundColor: si.color }}
        />
      </div>
      <div className="flex justify-between text-xs text-stone-400 mt-1">
        <span>{fmt(refMin)}</span>
        <span className="text-emerald-600 text-xs">
          Optimal: {fmt(optMin)}–{fmt(optMax)}
        </span>
        <span>{fmt(refMax)}</span>
      </div>
    </div>
  );
}

// ─── PRIORITY BADGE ──────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: BloodMarker["priority"] }) {
  if (priority === "core") return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
      ★ Attia Kern
    </span>
  );
  if (priority === "important") return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
      Wichtig
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-stone-50 text-stone-500 border border-stone-200">
      Ergänzend
    </span>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ value, marker, sex }: { value: number; marker: BloodMarker; sex: string }) {
  const si = getStatus(value, marker, sex);
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color: si.color, backgroundColor: si.bgColor }}
    >
      {si.label}
    </span>
  );
}

// ─── SUMMARY CARDS ───────────────────────────────────────────────────────────
function SummaryBar({ panel, sex }: { panel: Panel; sex: string }) {
  const stats = getSummaryStats(panel.values, sex);
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: "Optimal", count: stats.optimal, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
        { label: "Normal", count: stats.normal, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
        { label: "Kritisch", count: stats.attention, color: "text-red-600", bg: "bg-red-50 border-red-100" },
      ].map(item => (
        <div key={item.label} className={`rounded-xl border p-3 text-center ${item.bg}`}>
          <div className={`text-2xl font-semibold ${item.color}`}>{item.count}</div>
          <div className={`text-xs ${item.color} opacity-80`}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function BlutBildApp() {
  const [view, setView] = useState<"auth" | "dashboard" | "add" | "panel">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [activePanel, setActivePanel] = useState<Panel | null>(null);

  // Add panel form state
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [labName, setLabName] = useState("");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [activeCat, setActiveCat] = useState(CATEGORY_ORDER[0]);
  const [filterPriority, setFilterPriority] = useState<"all" | "core" | "important">("all");
  const [showAttia, setShowAttia] = useState<string | null>(null);

  // ── Auth & Data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async (userId: string) => {
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (prof) setProfile(prof as Profile);

    const { data: rawPanels } = await supabase
      .from("blood_panels")
      .select("*, blood_values(*)")
      .eq("user_id", userId)
      .order("test_date", { ascending: false });

    if (rawPanels) {
      const mapped = rawPanels.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        test_date: p.test_date,
        lab_name: p.lab_name,
        values: (p.blood_values || []).map((v: any) => ({
          markerId: v.marker_id,
          value: v.value,
        })),
      }));
      setPanels(mapped);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadData(session.user.id);
        setView("dashboard");
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        loadData(session.user.id);
        setView("dashboard");
      } else {
        setView("auth");
        setProfile(null);
        setPanels([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadData]);

  const handleAuth = async () => {
    setAuthError("");
    setLoading(true);
    if (authMode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError("Bestätigungs-E-Mail gesendet! Bitte E-Mail verifizieren.");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSavePanel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: panel, error } = await supabase
      .from("blood_panels")
      .insert({ user_id: user.id, test_date: testDate, lab_name: labName || null })
      .select()
      .single();

    if (error || !panel) return;

    const valuesToInsert = Object.entries(inputValues)
      .filter(([, v]) => v !== "")
      .map(([markerId, value]) => ({
        panel_id: panel.id,
        marker_id: markerId,
        value: parseFloat(value),
      }));

    if (valuesToInsert.length > 0) {
      await supabase.from("blood_values").insert(valuesToInsert);
    }

    setInputValues({});
    setLabName("");
    await loadData(user.id);
    setView("dashboard");
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-stone-400 text-sm">Laden…</div>
    </div>
  );

  // ── AUTH SCREEN ────────────────────────────────────────────────────────────
  if (view === "auth") return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-light tracking-tight text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
          BlutBild
        </h1>
        <p className="text-stone-500 text-sm mt-1">Deine Gesundheit. Klar verstanden.</p>
      </div>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <div className="flex gap-2 mb-6">
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => setAuthMode(m)}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all ${
                authMode === m
                  ? "bg-stone-900 text-white"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {m === "login" ? "Anmelden" : "Registrieren"}
            </button>
          ))}
        </div>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAuth()}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        {authError && <p className="text-xs text-red-500 mb-3">{authError}</p>}
        <button
          onClick={handleAuth}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl text-sm font-medium transition-colors"
        >
          {authMode === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
      </div>
      <p className="text-xs text-stone-400 mt-6 text-center max-w-xs">
        Deine Daten sind verschlüsselt und nur für dich sichtbar. Kein Datenweitergabe.
      </p>
    </div>
  );

  // ── PANEL DETAIL VIEW ──────────────────────────────────────────────────────
  if (view === "panel" && activePanel) {
    const sex = profile?.sex || "male";
    const orderedCats = CATEGORY_ORDER.filter(cat =>
      activePanel.values.some(v => {
        const m = BLOOD_MARKERS.find(bm => bm.id === v.markerId);
        return m?.category === cat;
      })
    );

    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setView("dashboard")}
            className="text-stone-400 hover:text-stone-700 text-xl leading-none"
          >
            ←
          </button>
          <div>
            <h2 className="font-medium text-stone-900 text-sm">
              {new Date(activePanel.test_date).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" })}
            </h2>
            {activePanel.lab_name && <p className="text-xs text-stone-400">{activePanel.lab_name}</p>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <SummaryBar panel={activePanel} sex={sex} />

          {orderedCats.map(cat => {
            const catValues = activePanel.values.filter(v => {
              const m = BLOOD_MARKERS.find(bm => bm.id === v.markerId);
              return m?.category === cat;
            });
            if (catValues.length === 0) return null;

            return (
              <div key={cat} className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">{cat}</h3>
                <div className="space-y-3">
                  {catValues.map(v => {
                    const marker = BLOOD_MARKERS.find(m => m.id === v.markerId);
                    if (!marker) return null;
                    const si = getStatus(v.value, marker, sex);
                    return (
                      <div
                        key={v.markerId}
                        className="bg-white rounded-2xl border border-stone-100 p-4 cursor-pointer hover:border-stone-200 transition-all"
                        onClick={() => setShowAttia(showAttia === v.markerId ? null : v.markerId)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-stone-900 text-sm">{marker.name_de}</span>
                              <PriorityBadge priority={marker.priority} />
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">{marker.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-semibold text-stone-900">{fmt(v.value)} <span className="text-xs font-normal text-stone-400">{marker.unit}</span></div>
                            <StatusBadge value={v.value} marker={marker} sex={sex} />
                          </div>
                        </div>
                        <RangeBar value={v.value} marker={marker} sex={sex} />
                        {showAttia === v.markerId && marker.attia_note && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-xs text-amber-800 leading-relaxed">
                              <span className="font-semibold">💡 Attia-Perspektive: </span>
                              {marker.attia_note}
                            </p>
                          </div>
                        )}
                        {marker.attia_note && (
                          <div className="mt-2 text-right">
                            <span className="text-xs text-stone-400">{showAttia === v.markerId ? "▲ weniger" : "▼ Attia-Hinweis"}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <p className="text-xs text-stone-400 text-center mt-8 px-4">
            BlutBild ist kein medizinisches Gerät. Diese Werte ersetzen keine ärztliche Beratung.
          </p>
        </div>
      </div>
    );
  }

  // ── ADD PANEL VIEW ─────────────────────────────────────────────────────────
  if (view === "add") {
    const catMarkers = getMarkersByCategory(activeCat).filter(m =>
      filterPriority === "all" ? true :
      filterPriority === "core" ? m.priority === "core" :
      m.priority === "core" || m.priority === "important"
    );

    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView("dashboard")} className="text-stone-400 hover:text-stone-700 text-xl">←</button>
          <h2 className="font-medium text-stone-900 flex-1">Blutbild eintragen</h2>
          <button
            onClick={handleSavePanel}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            Speichern
          </button>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Meta */}
          <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 block mb-1">Datum</label>
              <input
                type="date"
                value={testDate}
                onChange={e => setTestDate(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">Labor (optional)</label>
              <input
                type="text"
                placeholder="z.B. Synlab"
                value={labName}
                onChange={e => setLabName(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Priority filter */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "all", label: "Alle Marker" },
              { key: "important", label: "Wichtige" },
              { key: "core", label: "★ Attia Kern" },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilterPriority(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  filterPriority === f.key
                    ? "bg-stone-900 text-white border-stone-900"
                    : "text-stone-500 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORY_ORDER.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${
                  activeCat === cat
                    ? "bg-teal-600 text-white border-teal-600"
                    : "text-stone-500 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Marker inputs */}
          <div className="space-y-3">
            {catMarkers.map(marker => (
              <div key={marker.id} className="bg-white rounded-2xl border border-stone-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-stone-900">{marker.name_de}</span>
                      <PriorityBadge priority={marker.priority} />
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">{marker.description}</p>
                  </div>
                  <span className="text-xs text-stone-400 shrink-0">{marker.unit}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder={`z.B. ${marker[`opt_min_${profile?.sex === "female" ? "f" : "m"}` as keyof BloodMarker]}`}
                    value={inputValues[marker.id] || ""}
                    onChange={e => setInputValues(prev => ({ ...prev, [marker.id]: e.target.value }))}
                    className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  {inputValues[marker.id] && (
                    <StatusBadge
                      value={parseFloat(inputValues[marker.id])}
                      marker={marker}
                      sex={profile?.sex || "male"}
                    />
                  )}
                </div>
                {marker.attia_note && (
                  <p className="text-xs text-amber-700 mt-2 bg-amber-50 rounded-lg px-2 py-1.5 leading-relaxed">
                    💡 {marker.attia_note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="h-8" />
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-light tracking-tight text-stone-900" style={{ fontFamily: "Georgia, serif" }}>
          BlutBild
        </h1>
        <div className="flex items-center gap-2">
          {profile && (
            <span className="text-xs text-stone-400">{profile.display_name || profile.id.slice(0, 8)}</span>
          )}
          <button
            onClick={handleSignOut}
            className="text-xs text-stone-400 hover:text-stone-700 border border-stone-200 px-3 py-1.5 rounded-lg"
          >
            Abmelden
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome / quick stats */}
        {panels.length > 0 && profile && (
          <div className="mb-6">
            <p className="text-stone-500 text-sm mb-1">
              Zuletzt getestet:{" "}
              <span className="text-stone-900 font-medium">
                {new Date(panels[0].test_date).toLocaleDateString("de-AT", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </p>
            <SummaryBar panel={panels[0]} sex={profile.sex} />
          </div>
        )}

        {/* New panel button */}
        <button
          onClick={() => setView("add")}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl text-sm font-medium mb-6 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          Neues Blutbild eintragen
        </button>

        {/* Panels list */}
        {panels.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🩸</div>
            <h3 className="font-medium text-stone-700 mb-2">Noch keine Blutbilder</h3>
            <p className="text-stone-400 text-sm max-w-xs mx-auto">
              Trage dein erstes Blutbild ein und erhalte eine klare Übersicht über deine Werte.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
              Verlauf ({panels.length})
            </h2>
            {panels.map(panel => {
              const stats = getSummaryStats(panel.values, profile?.sex || "male");
              return (
                <div
                  key={panel.id}
                  onClick={() => { setActivePanel(panel); setView("panel"); }}
                  className="bg-white rounded-2xl border border-stone-100 p-4 cursor-pointer hover:border-teal-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-stone-900 text-sm">
                        {new Date(panel.test_date).toLocaleDateString("de-AT", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </div>
                      {panel.lab_name && (
                        <div className="text-xs text-stone-400 mt-0.5">{panel.lab_name}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 text-xs">
                        {stats.optimal > 0 && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                            {stats.optimal} ✓
                          </span>
                        )}
                        {stats.attention > 0 && (
                          <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                            {stats.attention} !
                          </span>
                        )}
                      </div>
                      <span className="text-stone-300 text-lg">›</span>
                    </div>
                  </div>
                  {stats.total > 0 && (
                    <div className="mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div className="bg-emerald-400" style={{ width: `${(stats.optimal / stats.total) * 100}%` }} />
                        <div className="bg-amber-400" style={{ width: `${(stats.normal / stats.total) * 100}%` }} />
                        <div className="bg-red-400" style={{ width: `${(stats.attention / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs text-stone-400 text-center mt-10 px-4">
          BlutBild ist kein Medizinprodukt. Diese Informationen ersetzen keine ärztliche Beratung.
        </p>
      </div>
    </div>
  );
}
