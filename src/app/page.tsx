"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BLOOD_MARKERS, CATEGORIES, getStatus, type BloodMarker } from "@/lib/markers";

interface Panel { id: string; user_id: string; test_date: string; lab_name: string | null; values: { markerId: string; value: number }[]; }
interface Profile { id: string; display_name: string; sex: string; birth_year: number; }

function RangeBar({ value, marker, sex }: { value: number; marker: BloodMarker; sex: string }) {
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;
  const dMin = Math.min(refMin * 0.5, value * 0.8, 0);
  const dMax = Math.max(refMax * 1.3, value * 1.2);
  const rng = dMax - dMin || 1;
  const toP = (v: number) => Math.max(0, Math.min(100, ((v - dMin) / rng) * 100));
  const si = getStatus(value, marker, sex);
  return (
    <div className="relative h-9 mt-2.5">
      <div className="absolute top-3 left-0 right-0 h-2.5 rounded-full bg-slate-100" />
      <div className="absolute top-3 h-2.5 rounded-full bg-amber-200 opacity-50" style={{ left: `${toP(refMin)}%`, width: `${toP(refMax) - toP(refMin)}%` }} />
      <div className="absolute top-2.5 h-3.5 rounded-full bg-emerald-300 opacity-60" style={{ left: `${toP(optMin)}%`, width: `${toP(optMax) - toP(optMin)}%` }} />
      <div className="absolute top-1.5 w-6 h-6 rounded-full border-[3px] border-white z-[2] transition-all duration-500 ease-out"
        style={{ left: `calc(${toP(value)}% - 12px)`, background: si.color, boxShadow: `0 0 0 1px ${si.color}30, 0 2px 8px ${si.color}25` }} />
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data) * 0.9, mx = Math.max(...data) * 1.1, rng = mx - mn || 1;
  const w = 120, h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - mn) / rng) * h} r={i === data.length - 1 ? 3.5 : 1.5} fill={i === data.length - 1 ? color : color + "80"} />)}
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { l: string; c: string; bg: string; i: string }> = {
    optimal: { l: "Optimal", c: "text-emerald-600", bg: "bg-emerald-50", i: "✓" },
    normal: { l: "Normal", c: "text-amber-600", bg: "bg-amber-50", i: "~" },
    low: { l: "Niedrig", c: "text-red-600", bg: "bg-red-50", i: "↓" },
    high: { l: "Hoch", c: "text-red-600", bg: "bg-red-50", i: "↑" },
  };
  const s = c[status] || c.normal;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${s.c} ${s.bg}`}><span className="text-[10px]">{s.i}</span> {s.l}</span>;
}

function MarkerCard({ v, marker, sex, history }: { v: { markerId: string; value: number }; marker: BloodMarker; sex: string; history: number[] }) {
  const si = getStatus(v.value, marker, sex);
  const sx = sex === "female" ? "f" : "m";
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-4">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2 mb-0.5"><span className="font-semibold text-sm">{marker.name}</span><StatusBadge status={si.status} /></div>
          <div className="text-[11px] text-stone-400">{marker.name_de} · {marker.description}</div>
        </div>
        <div className="text-right min-w-[80px]">
          <div className="text-xl font-bold leading-none" style={{ color: si.color }}>{v.value}</div>
          <div className="text-[10px] text-stone-400">{marker.unit}</div>
        </div>
        {history.length >= 2 && <Sparkline data={history} color={si.color} />}
      </div>
      <RangeBar value={v.value} marker={marker} sex={sex} />
      <div className="flex gap-4 text-[10px] text-stone-400 mt-1 flex-wrap">
        <span>Ref: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
        <span className="text-teal-600">Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [screen, setScreen] = useState("landing");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [currentPanel, setCurrentPanel] = useState<Panel | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [profileSex, setProfileSex] = useState("male");
  const [profileBirthYear, setProfileBirthYear] = useState("1990");

  const [panelDate, setPanelDate] = useState(new Date().toISOString().split("T")[0]);
  const [panelLab, setPanelLab] = useState("");
  const [panelValues, setPanelValues] = useState<Record<string, string>>({});
  const [panelCategory, setPanelCategory] = useState(CATEGORIES[0]);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSex, setEditSex] = useState("male");
  const [editBirthYear, setEditBirthYear] = useState(1990);

  const notify = (msg: string, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); loadPanels(session.user.id); setScreen("dashboard"); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user); else { setUser(null); setProfile(null); setPanels([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) { setProfile(data); setEditName(data.display_name || ""); setEditSex(data.sex || "male"); setEditBirthYear(data.birth_year || 1990); }
  };

  const loadPanels = async (userId: string) => {
    const { data: pd } = await supabase.from("blood_panels").select("*").eq("user_id", userId).order("test_date", { ascending: true });
    if (!pd) { setPanels([]); return; }
    const { data: vd } = await supabase.from("blood_values").select("*").eq("user_id", userId);
    setPanels(pd.map(p => ({ ...p, values: (vd || []).filter((v: any) => v.panel_id === p.id).map((v: any) => ({ markerId: v.marker_id, value: parseFloat(v.value) })) })));
  };

  const handleSignup = async () => {
    if (!authEmail || !authPass || authPass.length < 8) { notify("Email & Passwort (min. 8 Zeichen) nötig", "err"); return; }
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPass, options: { data: { display_name: authName || authEmail.split("@")[0] } } });
    if (error) { notify(error.message, "err"); setAuthLoading(false); return; }
    if (data.user) {
      setUser(data.user);
      await new Promise(r => setTimeout(r, 500));
      await supabase.from("profiles").update({ sex: profileSex, birth_year: parseInt(profileBirthYear), display_name: authName || authEmail.split("@")[0] }).eq("id", data.user.id);
      await loadProfile(data.user.id); setScreen("dashboard"); setAuthEmail(""); setAuthPass(""); setAuthName(""); notify("Willkommen bei BlutBild!");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if (!authEmail || !authPass) { notify("Email & Passwort eingeben", "err"); return; }
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
    if (error) { notify(error.message, "err"); setAuthLoading(false); return; }
    setUser(data.user); await loadProfile(data.user.id); await loadPanels(data.user.id);
    setScreen("dashboard"); setAuthEmail(""); setAuthPass(""); notify("Willkommen zurück!"); setAuthLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); setPanels([]); setScreen("landing"); };

  const handleSavePanel = async () => {
    const vals = Object.entries(panelValues).filter(([_, v]) => v !== "").map(([id, v]) => ({ markerId: id, value: parseFloat(v) })).filter(e => !isNaN(e.value));
    if (!vals.length) { notify("Mindestens einen Wert eingeben", "err"); return; }
    setSaving(true);
    const { data: pr, error } = await supabase.from("blood_panels").insert({ user_id: user.id, test_date: panelDate, lab_name: panelLab || null }).select("*").single();
    if (error || !pr) { notify("Fehler: " + (error?.message || "unbekannt"), "err"); setSaving(false); return; }
    await supabase.from("blood_values").insert(vals.map(v => ({ panel_id: pr.id, user_id: user.id, marker_id: v.markerId, value: v.value })));
    await loadPanels(user.id); setCurrentPanel({ ...pr, values: vals });
    setPanelValues({}); setPanelDate(new Date().toISOString().split("T")[0]); setPanelLab(""); setScreen("viewpanel");
    notify(`Gespeichert — ${vals.length} Marker erfasst`); setSaving(false);
  };

  const handleDeletePanel = async (panelId: string) => {
    if (!confirm("Panel wirklich löschen?")) return;
    await supabase.from("blood_values").delete().eq("panel_id", panelId);
    await supabase.from("blood_panels").delete().eq("id", panelId);
    await loadPanels(user.id); setScreen("dashboard"); notify("Panel gelöscht");
  };

  const handleUpdateProfile = async () => {
    await supabase.from("profiles").update({ display_name: editName, sex: editSex, birth_year: editBirthYear }).eq("id", user.id);
    setProfile(prev => prev ? { ...prev, display_name: editName, sex: editSex, birth_year: editBirthYear } : null);
    notify("Profil aktualisiert");
  };

  const getHistory = (mid: string) => panels.filter(p => p.values.some(v => v.markerId === mid)).map(p => ({ date: p.test_date, value: p.values.find(v => v.markerId === mid)?.value! })).filter(h => h.value !== undefined).sort((a, b) => a.date.localeCompare(b.date));

  const sex = profile?.sex || "male";
  const sx = sex === "female" ? "f" : "m";
  const latest = panels.length > 0 ? panels[panels.length - 1] : null;
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";
  const viewP = currentPanel || latest;
  const counts = { optimal: 0, normal: 0, low: 0, high: 0 };
  if (latest) latest.values.forEach(v => { const m = BLOOD_MARKERS.find(bm => bm.id === v.markerId); if (m) counts[getStatus(v.value, m, sex).status]++; });

  if (loading) return (<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">B</div><div className="text-stone-400 text-sm">Laden…</div></div></div>);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-3.5 border-b border-stone-100 bg-stone-50/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setScreen(user ? "dashboard" : "landing")}>
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm font-bold">B</div>
          <span className="font-display text-xl">BlutBild</span>
        </div>
        {user && (<nav className="flex items-center gap-0.5">
          {[{ l: "Dashboard", s: "dashboard" }, { l: "Verlauf", s: "history" }, { l: "Profil", s: "profile" }].map(n => (
            <button key={n.s} onClick={() => setScreen(n.s)} className={`px-3 py-1.5 rounded-md text-sm transition-colors ${screen === n.s ? "text-teal-600 font-semibold" : "text-stone-500 hover:text-stone-700"}`}>{n.l}</button>
          ))}
          <button onClick={handleLogout} className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">Abmelden</button>
        </nav>)}
      </header>

      {toast && (<div className={`toast-animate fixed top-16 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg text-sm font-medium shadow-lg z-[200] ${toast.type === "err" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{toast.msg}</div>)}

      {/* LANDING */}
      {screen === "landing" && (
        <div className="text-center px-6 py-20 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-7 shadow-lg shadow-teal-600/30">B</div>
          <h1 className="font-display text-4xl sm:text-5xl font-normal leading-tight mb-5 tracking-tight">Deine Blutwerte,<br /><span className="text-teal-600">klar verstanden.</span></h1>
          <p className="text-lg text-stone-500 max-w-lg mx-auto mb-9 leading-relaxed">Verfolge deine Blutwerte über Zeit. Sieh was optimal ist, was Aufmerksamkeit braucht — privat und sicher.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setScreen("signup")} className="px-8 py-3.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">Kostenlos starten</button>
            <button onClick={() => setScreen("login")} className="px-8 py-3.5 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-colors">Anmelden</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-20 text-left">
            {[{ icon: "🔒", title: "Privat by Default", desc: "Deine Daten gehören nur dir." }, { icon: "📊", title: "Visuelle Klarheit", desc: "Optimal, normal oder auffällig — auf einen Blick." }, { icon: "📈", title: "Zeitverläufe", desc: "Vergleiche Blutbilder über Monate und Jahre." }, { icon: "🇦🇹", title: "Für Österreich", desc: "Österreichische Referenzwerte. DSGVO-konform." }].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-100 shadow-sm p-5"><div className="text-2xl mb-2.5">{f.icon}</div><h3 className="text-sm font-semibold mb-1">{f.title}</h3><p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p></div>
            ))}
          </div>
          <button onClick={() => setScreen("privacy")} className="mt-10 text-sm text-stone-400 hover:text-stone-600">Datenschutz</button>
        </div>
      )}

      {/* AUTH */}
      {(screen === "signup" || screen === "login") && (
        <div className="max-w-sm mx-auto mt-16 px-6">
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-6">
            <h2 className="font-display text-2xl mb-1">{screen === "signup" ? "Konto erstellen" : "Willkommen zurück"}</h2>
            <p className="text-sm text-stone-500 mb-6">{screen === "signup" ? "Beginne deine Marker privat zu tracken." : "Melde dich an."}</p>
            {screen === "signup" && <div className="mb-4"><label className="block text-sm font-medium text-stone-500 mb-1.5">Name</label><input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Dein Name" className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>}
            <div className="mb-4"><label className="block text-sm font-medium text-stone-500 mb-1.5">Email</label><input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="du@beispiel.com" className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            <div className="mb-4"><label className="block text-sm font-medium text-stone-500 mb-1.5">Passwort</label><input type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} placeholder="Min. 8 Zeichen" className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            {screen === "signup" && (<><div className="grid grid-cols-2 gap-3 mb-4"><div><label className="block text-sm font-medium text-stone-500 mb-1.5">Geschlecht</label><select value={profileSex} onChange={e => setProfileSex(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm bg-white"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-500 mb-1.5">Geburtsjahr</label><input type="number" value={profileBirthYear} onChange={e => setProfileBirthYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div></div><p className="text-[11px] text-stone-400 -mt-2 mb-4">Beeinflusst deine Referenzwerte.</p></>)}
            <button onClick={screen === "signup" ? handleSignup : handleLogin} disabled={authLoading} className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors">{authLoading ? "Laden…" : screen === "signup" ? "Konto erstellen" : "Anmelden"}</button>
            <p className="text-center text-sm text-stone-400 mt-4">{screen === "signup" ? "Schon ein Konto? " : "Noch kein Konto? "}<span className="text-teal-600 cursor-pointer font-medium" onClick={() => { setScreen(screen === "signup" ? "login" : "signup"); setAuthEmail(""); setAuthPass(""); }}>{screen === "signup" ? "Anmelden" : "Registrieren"}</span></p>
          </div>
        </div>
      )}

      {/* DASHBOARD EMPTY */}
      {screen === "dashboard" && !latest && (
        <div className="max-w-lg mx-auto mt-20 px-6 text-center">
          <div className="text-6xl mb-5">🩸</div>
          <h2 className="font-display text-3xl mb-3">Erstes Blutbild hinzufügen</h2>
          <p className="text-stone-500 mb-7 leading-relaxed">Gib deine letzten Blutwerte ein und sieh wie sie abschneiden.</p>
          <button onClick={() => { setPanelValues({}); setPanelCategory(CATEGORIES[0]); setScreen("addpanel"); }} className="px-7 py-3.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">+ Blutbild hinzufügen</button>
          <div className="p-3.5 rounded-lg text-xs text-stone-500 bg-stone-100 mt-5 leading-relaxed border-l-[3px] border-stone-300"><strong>⚕️ Kein medizinischer Befund.</strong> BlutBild ist ein Bildungstool.</div>
        </div>
      )}

      {/* DASHBOARD WITH DATA */}
      {screen === "dashboard" && latest && (
        <div className="max-w-4xl mx-auto px-6 py-7">
          <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
            <div><h1 className="font-display text-3xl mb-1">Hallo {displayName}</h1><p className="text-sm text-stone-500">Letztes Panel: {new Date(latest.test_date).toLocaleDateString("de-AT")}{latest.lab_name && ` · ${latest.lab_name}`} · {latest.values.length} Marker</p></div>
            <button onClick={() => { setPanelValues({}); setPanelCategory(CATEGORIES[0]); setScreen("addpanel"); }} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">+ Neues Panel</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
            {[{ l: "Optimal", c: counts.optimal, cls: "border-l-emerald-500 text-emerald-600" }, { l: "Normal", c: counts.normal, cls: "border-l-amber-500 text-amber-600" }, { l: "Niedrig", c: counts.low, cls: "border-l-red-500 text-red-600" }, { l: "Hoch", c: counts.high, cls: "border-l-red-500 text-red-600" }].map((s, i) => (
              <div key={i} className={`bg-white rounded-xl border border-stone-100 shadow-sm p-4 text-center border-l-[3px] ${s.cls}`}><div className="text-2xl font-bold">{s.c}</div><div className="text-xs text-stone-500 font-medium">{s.l}</div></div>
            ))}
          </div>
          {CATEGORIES.map(cat => { const cv = latest.values.filter(v => BLOOD_MARKERS.find(bm => bm.id === v.markerId)?.category === cat); if (!cv.length) return null; return (
            <div key={cat} className="mb-7"><h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2.5 pb-1.5 border-b border-stone-100">{cat}</h3><div className="flex flex-col gap-2">{cv.map(v => { const marker = BLOOD_MARKERS.find(m => m.id === v.markerId); if (!marker) return null; return <MarkerCard key={v.markerId} v={v} marker={marker} sex={sex} history={getHistory(marker.id).map(h => h.value)} />; })}</div></div>
          ); })}
          <div className="p-3.5 rounded-lg text-xs text-stone-500 bg-stone-100 mt-5 leading-relaxed border-l-[3px] border-stone-300"><strong>⚕️ Kein medizinischer Befund.</strong> BlutBild ist ein Bildungstool. Bitte konsultiere immer einen Arzt.</div>
        </div>
      )}

      {/* ADD PANEL */}
      {screen === "addpanel" && (
        <div className="max-w-2xl mx-auto px-6 py-7">
          <button onClick={() => setScreen("dashboard")} className="text-sm text-stone-500 hover:text-stone-700 mb-3.5">← Zurück</button>
          <h2 className="font-display text-2xl mb-1">Blutbild hinzufügen</h2>
          <p className="text-sm text-stone-500 mb-6">Gib die Werte ein. Nur ausfüllen was du hast.</p>
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 mb-5"><div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-stone-500 mb-1.5">Testdatum</label><input type="date" value={panelDate} onChange={e => setPanelDate(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-stone-500 mb-1.5">Labor (optional)</label><input value={panelLab} onChange={e => setPanelLab(e.target.value)} placeholder="z.B. Labordiagnostik Wien" className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
          </div></div>
          <div className="flex gap-1 mb-4 flex-wrap">{CATEGORIES.map(cat => (<button key={cat} onClick={() => setPanelCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${panelCategory === cat ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>{cat}</button>))}</div>
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
            {BLOOD_MARKERS.filter(m => m.category === panelCategory).map(marker => (
              <div key={marker.id} className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
                <div className="flex-1 min-w-0"><div className="font-medium text-sm">{marker.name}</div><div className="text-[10px] text-stone-400">{marker.name_de} · Ref: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]}</div></div>
                <div className="flex items-center gap-1.5"><input type="number" step="any" value={panelValues[marker.id] || ""} onChange={e => setPanelValues(pv => ({ ...pv, [marker.id]: e.target.value }))} placeholder="—" className="w-20 px-2.5 py-2 rounded-lg border border-stone-200 text-sm text-right focus:border-teal-500 focus:outline-none" /><span className="text-[11px] text-stone-400 min-w-[48px]">{marker.unit}</span></div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSavePanel} disabled={saving} className="flex-1 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">{saving ? "Speichern…" : `Panel speichern (${Object.values(panelValues).filter(v => v !== "").length} Werte)`}</button>
            <button onClick={() => setScreen("dashboard")} className="px-5 py-3 border border-stone-200 rounded-lg text-sm hover:bg-stone-50">Abbrechen</button>
          </div>
        </div>
      )}

      {/* VIEW PANEL */}
      {screen === "viewpanel" && viewP && (
        <div className="max-w-4xl mx-auto px-6 py-7">
          <button onClick={() => setScreen("dashboard")} className="text-sm text-stone-500 hover:text-stone-700 mb-3.5">← Zurück</button>
          <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
            <div><h2 className="font-display text-2xl mb-1">Panel Ergebnisse</h2><p className="text-sm text-stone-500">{new Date(viewP.test_date).toLocaleDateString("de-AT")}{viewP.lab_name && ` · ${viewP.lab_name}`} · {viewP.values.length} Marker</p></div>
            <button onClick={() => handleDeletePanel(viewP.id)} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">Löschen</button>
          </div>
          {CATEGORIES.map(cat => { const cv = viewP.values.filter(v => BLOOD_MARKERS.find(bm => bm.id === v.markerId)?.category === cat); if (!cv.length) return null; return (
            <div key={cat} className="mb-6"><h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">{cat}</h3>
              {cv.map(v => { const marker = BLOOD_MARKERS.find(m => m.id === v.markerId); if (!marker) return null; const si = getStatus(v.value, marker, sex); return (
                <div key={v.markerId} className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-2"><div className="flex justify-between items-center flex-wrap gap-2"><div><span className="font-semibold text-sm">{marker.name}</span> <StatusBadge status={si.status} /></div><div className="text-lg font-bold" style={{ color: si.color }}>{v.value} <span className="text-[11px] font-normal text-stone-400">{marker.unit}</span></div></div><RangeBar value={v.value} marker={marker} sex={sex} /></div>
              ); })}
            </div>
          ); })}
          <div className="p-3.5 rounded-lg text-xs text-stone-500 bg-stone-100 mt-5 leading-relaxed border-l-[3px] border-stone-300"><strong>⚕️ Kein medizinischer Befund.</strong> BlutBild ist ein Bildungstool.</div>
        </div>
      )}

      {/* HISTORY */}
      {screen === "history" && !panels.length && (<div className="max-w-lg mx-auto mt-16 px-6 text-center"><p className="text-stone-500 mb-4">Noch keine Panels.</p><button onClick={() => setScreen("addpanel")} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">+ Panel hinzufügen</button></div>)}
      {screen === "history" && panels.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 py-7">
          <h2 className="font-display text-2xl mb-5">Verlauf</h2>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2.5">Alle Panels</h3>
          {[...panels].reverse().map(p => (<div key={p.id} onClick={() => { setCurrentPanel(p); setScreen("viewpanel"); }} className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-2 cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"><div className="flex justify-between items-center"><div><span className="font-semibold">{new Date(p.test_date).toLocaleDateString("de-AT")}</span>{p.lab_name && <span className="text-stone-400 text-xs ml-2">· {p.lab_name}</span>}</div><span className="text-xs text-stone-500">{p.values.length} Marker →</span></div></div>))}
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mt-6 mb-2.5">Trends</h3>
          {BLOOD_MARKERS.map(marker => { const h = getHistory(marker.id); if (h.length < 2) return null; const lsi = getStatus(h[h.length - 1].value, marker, sex); return (
            <div key={marker.id} className="bg-white rounded-xl border border-stone-100 shadow-sm p-4 mb-2"><div className="flex justify-between items-center flex-wrap gap-2"><div><span className="font-semibold text-sm">{marker.name}</span><span className="text-[11px] text-stone-400 ml-2">{marker.name_de}</span></div><div className="flex items-center gap-3.5"><Sparkline data={h.map(x => x.value)} color={lsi.color} /><div className="text-right"><div className="text-base font-bold" style={{ color: lsi.color }}>{h[h.length - 1].value}</div><div className="text-[10px] text-stone-400">{marker.unit}</div></div></div></div><div className="flex gap-1.5 mt-2 flex-wrap">{h.map((x, i) => <span key={i} className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded">{new Date(x.date).toLocaleDateString("de-AT", { month: "short", year: "2-digit" })}: {x.value}</span>)}</div></div>
          ); })}
        </div>
      )}

      {/* PROFILE */}
      {screen === "profile" && (
        <div className="max-w-md mx-auto px-6 py-7">
          <h2 className="font-display text-2xl mb-5">Profil</h2>
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 mb-4">
            <div className="mb-4"><label className="block text-sm font-medium text-stone-500 mb-1.5">Name</label><input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div>
            <div className="mb-4 opacity-60"><label className="block text-sm font-medium text-stone-500 mb-1.5">Email</label><input value={user?.email || ""} disabled className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm bg-stone-50" /></div>
            <div className="grid grid-cols-2 gap-3 mb-4"><div><label className="block text-sm font-medium text-stone-500 mb-1.5">Geschlecht</label><select value={editSex} onChange={e => setEditSex(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm bg-white"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-500 mb-1.5">Geburtsjahr</label><input type="number" value={editBirthYear} onChange={e => setEditBirthYear(parseInt(e.target.value) || 1990)} className="w-full px-3.5 py-2.5 rounded-lg border border-stone-200 text-sm focus:border-teal-500 focus:outline-none" /></div></div>
            <button onClick={handleUpdateProfile} className="w-full py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">Profil speichern</button>
          </div>
          <div className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 border-l-[3px] border-l-red-500"><h3 className="text-sm font-semibold text-red-600 mb-1">Gefahrenzone</h3><p className="text-xs text-stone-500 mb-3">Alle Daten permanent löschen.</p><button onClick={() => { if (confirm("Alle Daten löschen?")) handleLogout(); }} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">Alle Daten löschen</button></div>
          <button onClick={() => setScreen("privacy")} className="mt-4 text-sm text-stone-400 hover:text-stone-600">Datenschutz →</button>
        </div>
      )}

      {/* PRIVACY */}
      {screen === "privacy" && (
        <div className="max-w-2xl mx-auto px-6 py-7">
          <button onClick={() => setScreen(user ? "dashboard" : "landing")} className="text-sm text-stone-500 hover:text-stone-700 mb-3.5">← Zurück</button>
          <h2 className="font-display text-3xl mb-1">Datenschutz & DSGVO</h2>
          <p className="text-sm text-stone-500 mb-7">BlutBild ist mit Datenschutz als Kernprinzip entwickelt.</p>
          {[{ t: "Deine Daten bleiben bei dir", d: "Geschützt durch Row Level Security. Nur du hast Zugriff." }, { t: "Kein anderer User sieht deine Daten", d: "Technisch auf Datenbank-Ebene erzwungen." }, { t: "Deine Rechte nach DSGVO", d: "Jederzeit einsehen, exportieren oder löschen." }, { t: "Kein Medizinprodukt", d: "Bildungstool. Keine Diagnosen, keine Behandlungsempfehlungen." }, { t: "\"Optimale\" Bereiche", d: "Aus Longevity-Forschung. Pädagogisch, nicht diagnostisch." }].map((s, i) => (
            <div key={i} className="mb-6"><h3 className="text-base font-semibold mb-1">{s.t}</h3><p className="text-sm text-stone-500 leading-relaxed">{s.d}</p></div>
          ))}
        </div>
      )}
    </>
  );
}
