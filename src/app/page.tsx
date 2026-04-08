"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { BLOOD_MARKERS, CATEGORIES, CATEGORY_ORDER, getStatus, getSortedCategories, type BloodMarker, type StatusInfo } from "@/lib/markers";

interface Panel { id: string; user_id: string; test_date: string; lab_name: string | null; values: { markerId: string; value: number }[]; }
interface Prof { id: string; display_name: string; sex: string; birth_year: number; }

/* ─── SHARED UI ─────────────────────────────────────────────────── */
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
    <div className="relative h-10 mt-3">
      <div className="absolute top-[14px] left-0 right-0 h-3 rounded-full bg-slate-100" />
      <div className="absolute top-[14px] h-3 rounded-full bg-amber-200/50" style={{ left: `${toP(refMin)}%`, width: `${toP(refMax)-toP(refMin)}%` }} />
      <div className="absolute top-[12px] h-4 rounded-full bg-emerald-300/60" style={{ left: `${toP(optMin)}%`, width: `${toP(optMax)-toP(optMin)}%` }} />
      <div className="absolute top-[8px] w-7 h-7 rounded-full border-[3px] border-white z-[2] transition-all duration-500 ease-out shadow-md" style={{ left: `calc(${toP(value)}% - 14px)`, background: si.color }} />
      <div className="absolute top-[28px] text-[10px] text-stone-400" style={{ left: `${toP(refMin)}%`, transform: "translateX(-50%)" }}>{refMin}</div>
      <div className="absolute top-[28px] text-[10px] text-stone-400" style={{ left: `${toP(refMax)}%`, transform: "translateX(-50%)" }}>{refMax}</div>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data)*0.9, mx = Math.max(...data)*1.1, rng = mx-mn||1, w=140, h=36;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-mn)/rng)*h}`).join(" ");
  return (<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />{data.map((v,i)=><circle key={i} cx={(i/(data.length-1))*w} cy={h-((v-mn)/rng)*h} r={i===data.length-1?4:2} fill={i===data.length-1?color:color+"80"} />)}</svg>);
}

function StatusBadge({ status }: { status: string }) {
  const c: Record<string, { l:string; cls:string; i:string }> = { optimal:{l:"Optimal",cls:"text-emerald-700 bg-emerald-50",i:"✓"}, normal:{l:"Normal",cls:"text-amber-700 bg-amber-50",i:"~"}, low:{l:"Niedrig",cls:"text-red-700 bg-red-50",i:"↓"}, high:{l:"Hoch",cls:"text-red-700 bg-red-50",i:"↑"} };
  const s = c[status] || c.normal;
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.i} {s.l}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  if (priority === "essential") return <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" title="Wichtiger Marker" />;
  if (priority === "recommended") return <span className="w-2 h-2 rounded-full bg-stone-300 inline-block" title="Empfohlen" />;
  return null;
}

function DeltaIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / previous) * 100) : 0;
  if (Math.abs(pct) < 1) return <span className="text-xs text-stone-400">unverändert</span>;
  const up = diff > 0;
  return <span className={`text-xs font-medium ${up ? "text-rose-500" : "text-emerald-600"}`}>{up ? "↑" : "↓"} {Math.abs(pct)}%</span>;
}

function Disclaimer() {
  return <div className="p-4 rounded-xl text-sm text-stone-500 bg-stone-50 mt-8 leading-relaxed border-l-[3px] border-stone-300"><strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool inspiriert von der Longevity-Medizin. Bitte konsultiere immer einen Arzt. Optimale Bereiche stammen aus publizierter Forschung und gelten möglicherweise nicht für deine individuelle Situation.</div>;
}

/* ─── HEADER ────────────────────────────────────────────────────── */
function AppHeader({ user, screen, setScreen, onLogout }: any) {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100 bg-stone-50/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(user ? "dashboard" : "landing")}>
        <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white text-base font-bold shadow-sm shadow-teal-600/20">V</div>
        <span className="font-display text-[22px] tracking-tight">Vitalis</span>
      </div>
      {user && (<nav className="flex items-center gap-1">
        {[{l:"Dashboard",s:"dashboard"},{l:"Verlauf",s:"history"},{l:"Profil",s:"profile"}].map(n=>(<button key={n.s} onClick={()=>setScreen(n.s)} className={`px-3 py-2 rounded-lg text-sm transition-colors ${screen===n.s?"text-teal-600 font-semibold bg-teal-50":"text-stone-500 hover:text-stone-700 hover:bg-stone-100"}`}>{n.l}</button>))}
        <button onClick={onLogout} className="px-3 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors ml-2">Abmelden</button>
      </nav>)}
    </header>
  );
}

/* ─── ONBOARDING / LANDING ──────────────────────────────────────── */
function LandingScreen({ setScreen }: { setScreen: (s:string)=>void }) {
  return (
    <div className="px-6 py-16 max-w-3xl mx-auto">
      <div className="text-center mb-20">
        <div className="w-20 h-20 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-8 shadow-xl shadow-teal-600/25">V</div>
        <h1 className="font-display text-4xl sm:text-5xl font-normal leading-[1.1] mb-6 tracking-tight">Deine Blutwerte,<br /><span className="text-teal-600">optimiert verstanden.</span></h1>
        <p className="text-lg text-stone-500 max-w-xl mx-auto mb-4 leading-relaxed">Vitalis zeigt dir nicht nur ob deine Werte im Referenzbereich liegen — sondern ob sie <em>optimal für deine Gesundheit</em> sind.</p>
        <p className="text-base text-stone-400 max-w-lg mx-auto mb-10 leading-relaxed">Inspiriert von der Longevity-Medizin nach Dr. Peter Attia. Privat, sicher, und schön dargestellt — weil das Auge immer mitspielt.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={()=>setScreen("signup")} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">Kostenlos starten</button>
          <button onClick={()=>setScreen("login")} className="px-8 py-4 border border-stone-200 rounded-xl font-medium text-base hover:bg-stone-50 transition-colors">Anmelden</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[{icon:"📊",title:"Mehr als nur Referenzwerte",desc:"Standard-Labore sagen dir nur ob etwas 'normal' ist. Wir zeigen dir den optimalen Bereich — nach neuester Longevity-Forschung."},{icon:"📈",title:"Veränderungen sehen",desc:"Vergleiche deine Werte über Monate und Jahre. Sieh auf einen Blick was sich verbessert und was Aufmerksamkeit braucht."},{icon:"🔒",title:"100% Privat",desc:"Deine Gesundheitsdaten gehören nur dir. Verschlüsselt gespeichert, DSGVO-konform, kein Tracking, kein Datenverkauf."}].map((f,i)=>(
          <div key={i} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6"><div className="text-3xl mb-3">{f.icon}</div><h3 className="text-base font-semibold mb-2">{f.title}</h3><p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p></div>
        ))}
      </div>
      <div className="text-center"><p className="text-sm text-stone-400 mb-2">Gemacht in Österreich 🇦🇹</p><button onClick={()=>setScreen("privacy")} className="text-sm text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-4">Datenschutz</button></div>
    </div>
  );
}

/* ─── AUTH ───────────────────────────────────────────────────────── */
function AuthScreen({ isSignup, authEmail, setAuthEmail, authPass, setAuthPass, authName, setAuthName, profileSex, setProfileSex, profileBirthYear, setProfileBirthYear, authLoading, onSignup, onLogin, setScreen }: any) {
  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
        <h2 className="font-display text-3xl mb-2">{isSignup ? "Konto erstellen" : "Willkommen zurück"}</h2>
        <p className="text-sm text-stone-500 mb-8">{isSignup ? "Starte jetzt mit deinem persönlichen Longevity-Dashboard." : "Melde dich an."}</p>
        {isSignup && <div className="mb-5"><label className="block text-sm font-medium text-stone-600 mb-2">Name</label><input value={authName} onChange={(e:any)=>setAuthName(e.target.value)} placeholder="Dein Name" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>}
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 mb-2">Email</label><input type="email" value={authEmail} onChange={(e:any)=>setAuthEmail(e.target.value)} placeholder="du@beispiel.com" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 mb-2">Passwort</label><input type="password" value={authPass} onChange={(e:any)=>setAuthPass(e.target.value)} placeholder="Min. 8 Zeichen" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" /></div>
        {isSignup && (<><div className="grid grid-cols-2 gap-4 mb-5"><div><label className="block text-sm font-medium text-stone-600 mb-2">Biologisches Geschlecht</label><select value={profileSex} onChange={(e:any)=>setProfileSex(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base bg-white"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-600 mb-2">Geburtsjahr</label><input type="number" value={profileBirthYear} onChange={(e:any)=>setProfileBirthYear(e.target.value)} min="1920" max="2010" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none" /></div></div><p className="text-xs text-stone-400 -mt-2 mb-5">Geschlecht und Alter beeinflussen die Referenzwerte.</p></>)}
        <button onClick={isSignup?onSignup:onLogin} disabled={authLoading} className="w-full py-3.5 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 disabled:opacity-50 transition-colors">{authLoading?"Laden…":isSignup?"Konto erstellen":"Anmelden"}</button>
        <p className="text-center text-sm text-stone-400 mt-5">{isSignup?"Schon ein Konto? ":"Noch kein Konto? "}<span className="text-teal-600 cursor-pointer font-medium hover:underline" onClick={()=>setScreen(isSignup?"login":"signup")}>{isSignup?"Anmelden":"Registrieren"}</span></p>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────────────── */
function DashboardScreen({ panels, profile, user, sex, setScreen, setPanelValues, setPanelCategory, getHistory }: any) {
  const latest = panels[panels.length-1];
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "";
  if (!latest) return (
    <div className="max-w-lg mx-auto mt-20 px-6 text-center">
      <div className="text-7xl mb-6">🩸</div>
      <h2 className="font-display text-3xl mb-4">Dein erstes Blutbild</h2>
      <p className="text-stone-500 text-base mb-8 leading-relaxed">Gib deine letzten Blutwerte ein und sieh sofort wie sie im Vergleich zu Referenz- und optimalen Bereichen abschneiden.</p>
      <button onClick={()=>{setPanelValues({});setPanelCategory(CATEGORY_ORDER[0]);setScreen("addpanel");}} className="px-8 py-4 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">+ Blutbild hinzufügen</button>
      <Disclaimer />
    </div>);
  const counts: any = {optimal:0,normal:0,low:0,high:0};
  latest.values.forEach((v:any)=>{const m=BLOOD_MARKERS.find(bm=>bm.id===v.markerId);if(m)counts[getStatus(v.value,m,sex).status]++;});
  const total = latest.values.length;
  const optPct = total > 0 ? Math.round((counts.optimal / total) * 100) : 0;
  
  // Find previous panel for delta comparison
  const prevPanel = panels.length > 1 ? panels[panels.length - 2] : null;
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div><h1 className="font-display text-3xl mb-1">Hallo {displayName}</h1><p className="text-base text-stone-500">{new Date(latest.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}{latest.lab_name&&` · ${latest.lab_name}`} · {total} Marker</p></div>
        <button onClick={()=>{setPanelValues({});setPanelCategory(CATEGORY_ORDER[0]);setScreen("addpanel");}} className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20">+ Neues Panel</button>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray={`${optPct}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-bold text-emerald-600">{optPct}%</span></div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base font-medium text-stone-700 mb-3">{optPct >= 70 ? "Sehr gut — die meisten Werte sind optimal" : optPct >= 40 ? "Solide Basis — einige Werte verdienen Aufmerksamkeit" : "Mehrere Werte liegen außerhalb des optimalen Bereichs"}</p>
            <div className="flex gap-5 flex-wrap">
              {[{l:"Optimal",c:counts.optimal,cls:"text-emerald-600"},{l:"Normal",c:counts.normal,cls:"text-amber-600"},{l:"Kritisch",c:counts.low+counts.high,cls:"text-red-600"}].map((s,i)=>(
                <div key={i} className="flex items-center gap-2"><span className={`text-2xl font-bold ${s.cls}`}>{s.c}</span><span className="text-sm text-stone-500">{s.l}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Markers by Category */}
      {getSortedCategories().map(cat => {
        const cv = latest.values.filter((v:any)=>BLOOD_MARKERS.find(bm=>bm.id===v.markerId)?.category===cat);
        if(!cv.length) return null;
        return (
          <div key={cat} className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-3 pb-2 border-b border-stone-100">{cat}</h3>
            <div className="flex flex-col gap-3">
              {cv.map((v:any) => {
                const marker = BLOOD_MARKERS.find(m=>m.id===v.markerId); if(!marker) return null;
                const si = getStatus(v.value,marker,sex);
                const hist = getHistory(marker.id);
                const sx = sex==="female"?"f":"m";
                const prevVal = prevPanel?.values.find((pv:any) => pv.markerId === v.markerId);
                const [showNote, setShowNote] = useState(false);
                return (
                  <div key={v.markerId} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2.5 mb-1">
                          <PriorityDot priority={marker.priority} />
                          <span className="font-semibold text-base">{marker.name}</span>
                          <StatusBadge status={si.status} />
                          {prevVal && <DeltaIndicator current={v.value} previous={prevVal.value} />}
                        </div>
                        <div className="text-sm text-stone-400">{marker.name_de} · {marker.description_de}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold leading-none" style={{color:si.color}}>{v.value}</div>
                        <div className="text-xs text-stone-400 mt-0.5">{marker.unit}</div>
                      </div>
                      {hist.length >= 2 && <Sparkline data={hist.map((h:any)=>h.value)} color={si.color} />}
                    </div>
                    <RangeBar value={v.value} marker={marker} sex={sex} />
                    <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                      <div className="flex gap-5 text-xs text-stone-400">
                        <span>Referenz: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                        <span className="text-teal-600 font-medium">Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                      </div>
                      {marker.longevity_note && <button onClick={()=>setShowNote(!showNote)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">{showNote ? "Weniger ▴" : "Longevity-Info ▾"}</button>}
                    </div>
                    {showNote && marker.longevity_note && <div className="mt-3 p-3 rounded-xl bg-teal-50 text-sm text-teal-800 leading-relaxed">{marker.longevity_note}</div>}
                    {hist.length >= 2 && <div className="flex gap-2 mt-2 flex-wrap">{hist.map((h:any,i:number)=><span key={i} className="text-[11px] text-stone-400 bg-stone-50 px-2.5 py-1 rounded-lg">{new Date(h.date).toLocaleDateString("de-AT",{month:"short",year:"2-digit"})}: {h.value}</span>)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── ADD PANEL (with save fix) ──────────────────────────────────── */
function AddPanelScreen({ sex, panelDate, setPanelDate, panelLab, setPanelLab, panelValues, setPanelValues, panelCategory, setPanelCategory, saving, onSave, setScreen }: any) {
  const sx = sex==="female"?"f":"m";
  const [filter, setFilter] = useState<"all"|"essential"|"recommended">("essential");
  const filtered = BLOOD_MARKERS.filter(m => m.category === panelCategory).filter(m => filter === "all" ? true : filter === "essential" ? m.priority === "essential" : m.priority !== "extended");
  const filledCount = Object.values(panelValues).filter((v:any) => v !== "" && v !== undefined).length;
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen("dashboard")} className="text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors">← Zurück</button>
      <h2 className="font-display text-3xl mb-2">Blutbild hinzufügen</h2>
      <p className="text-base text-stone-500 mb-8">Gib die Werte deines letzten Bluttests ein. Du musst nicht alles ausfüllen — nur was auf deinem Befund steht.</p>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-stone-600 mb-2">Testdatum</label><input type="date" value={panelDate} onChange={(e:any)=>setPanelDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
          <div><label className="block text-sm font-medium text-stone-600 mb-2">Labor (optional)</label><input value={panelLab} onChange={(e:any)=>setPanelLab(e.target.value)} placeholder="z.B. Labordiagnostik Wien" className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" /></div>
        </div>
      </div>
      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">{getSortedCategories().map(cat=>(<button key={cat} onClick={()=>setPanelCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${panelCategory===cat?"bg-teal-600 text-white shadow-sm":"bg-stone-100 text-stone-500 hover:bg-stone-200"}`}>{cat}</button>))}</div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">{[{l:"Wichtige",v:"essential" as const},{l:"Empfohlen",v:"recommended" as const},{l:"Alle",v:"all" as const}].map(f=>(<button key={f.v} onClick={()=>setFilter(f.v)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter===f.v?"bg-stone-800 text-white":"bg-stone-50 text-stone-500 hover:bg-stone-100"}`}>{f.l}</button>))}</div>
      {/* Marker Inputs */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
        {filtered.length === 0 && <p className="text-sm text-stone-400 py-4 text-center">Keine Marker in dieser Kategorie mit dem aktuellen Filter.</p>}
        {filtered.map(marker=>(<div key={marker.id} className="flex items-center gap-4 py-3.5 border-b border-stone-50 last:border-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2"><PriorityDot priority={marker.priority} /><span className="font-medium text-base">{marker.name}</span></div>
            <div className="text-xs text-stone-400 mt-0.5">{marker.name_de} · Ref: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</div>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" step="any" value={panelValues[marker.id]||""} onChange={(e:any)=>setPanelValues((pv:any)=>({...pv,[marker.id]:e.target.value}))} placeholder="—" className="w-24 px-3 py-2.5 rounded-xl border border-stone-200 text-base text-right focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            <span className="text-xs text-stone-400 min-w-[52px]">{marker.unit}</span>
          </div>
        </div>))}
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSave} disabled={saving||filledCount===0} className="flex-1 py-3.5 bg-teal-600 text-white rounded-xl font-medium text-base hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">{saving?"Speichern…":`Panel speichern (${filledCount} Werte)`}</button>
        <button onClick={()=>setScreen("dashboard")} className="px-6 py-3.5 border border-stone-200 rounded-xl text-base hover:bg-stone-50 transition-colors">Abbrechen</button>
      </div>
    </div>
  );
}

/* ─── VIEW PANEL ────────────────────────────────────────────────── */
function ViewPanelScreen({ currentPanel, panels, sex, setScreen, onDelete, onExportPdf }: any) {
  const p = currentPanel||panels[panels.length-1]; if(!p) return null;
  const panelIdx = panels.findIndex((pan:Panel) => pan.id === p.id);
  const prevPanel = panelIdx > 0 ? panels[panelIdx - 1] : null;
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen("dashboard")} className="text-sm text-stone-500 hover:text-stone-700 mb-4">← Zurück</button>
      <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
        <div><h2 className="font-display text-3xl mb-1">Panel Ergebnisse</h2><p className="text-base text-stone-500">{new Date(p.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}{p.lab_name&&` · ${p.lab_name}`} · {p.values.length} Marker</p></div>
        <div className="flex gap-2">
          <button onClick={()=>onExportPdf(p)} className="px-4 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-900 transition-colors">📄 PDF Export</button>
          <button onClick={()=>onDelete(p.id)} className="px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors">Löschen</button>
        </div>
      </div>
      {getSortedCategories().map(cat=>{
        const cv=p.values.filter((v:any)=>BLOOD_MARKERS.find(bm=>bm.id===v.markerId)?.category===cat);if(!cv.length) return null;
        return (<div key={cat} className="mb-7"><h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-3">{cat}</h3>{cv.map((v:any)=>{const marker=BLOOD_MARKERS.find(m=>m.id===v.markerId);if(!marker) return null;const si=getStatus(v.value,marker,sex);const prevVal=prevPanel?.values.find((pv:any)=>pv.markerId===v.markerId);
          return (<div key={v.markerId} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-3">
            <div className="flex justify-between items-center flex-wrap gap-2"><div className="flex items-center gap-2.5"><PriorityDot priority={marker.priority} /><span className="font-semibold text-base">{marker.name}</span><StatusBadge status={si.status} />{prevVal&&<DeltaIndicator current={v.value} previous={prevVal.value} />}</div><div className="text-xl font-bold" style={{color:si.color}}>{v.value} <span className="text-sm font-normal text-stone-400">{marker.unit}</span></div></div>
            <RangeBar value={v.value} marker={marker} sex={sex} />
          </div>);})}</div>);
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── HISTORY ───────────────────────────────────────────────────── */
function HistoryScreen({ panels, sex, setScreen, setCurrentPanel, getHistory }: any) {
  if(!panels.length) return (<div className="max-w-lg mx-auto mt-16 px-6 text-center"><p className="text-stone-500 text-base mb-5">Noch keine Panels vorhanden.</p><button onClick={()=>setScreen("addpanel")} className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">+ Panel hinzufügen</button></div>);
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h2 className="font-display text-3xl mb-6">Verlauf</h2>
      <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-3">Alle Panels</h3>
      {[...panels].reverse().map((p:any)=>(<div key={p.id} onClick={()=>{setCurrentPanel(p);setScreen("viewpanel");}} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-3 cursor-pointer hover:shadow-md hover:-translate-y-px transition-all"><div className="flex justify-between items-center"><div><span className="font-semibold text-base">{new Date(p.test_date).toLocaleDateString("de-AT",{day:"numeric",month:"long",year:"numeric"})}</span>{p.lab_name&&<span className="text-stone-400 text-sm ml-3">· {p.lab_name}</span>}</div><span className="text-sm text-stone-500">{p.values.length} Marker →</span></div></div>))}
      <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mt-8 mb-3">Trends</h3>
      {BLOOD_MARKERS.filter(m=>m.priority!=="extended").map(marker=>{const h=getHistory(marker.id);if(h.length<2) return null;const lsi=getStatus(h[h.length-1].value,marker,sex);const prev=h[h.length-2];
        return (<div key={marker.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-3"><div className="flex justify-between items-center flex-wrap gap-3"><div className="flex items-center gap-2"><PriorityDot priority={marker.priority} /><span className="font-semibold text-base">{marker.name}</span><span className="text-sm text-stone-400">{marker.name_de}</span><DeltaIndicator current={h[h.length-1].value} previous={prev.value} /></div><div className="flex items-center gap-4"><Sparkline data={h.map((x:any)=>x.value)} color={lsi.color} /><div className="text-right"><div className="text-lg font-bold" style={{color:lsi.color}}>{h[h.length-1].value}</div><div className="text-xs text-stone-400">{marker.unit}</div></div></div></div><div className="flex gap-2 mt-3 flex-wrap">{h.map((x:any,i:number)=><span key={i} className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-lg">{new Date(x.date).toLocaleDateString("de-AT",{month:"short",year:"2-digit"})}: {x.value}</span>)}</div></div>);
      })}
      <Disclaimer />
    </div>
  );
}

/* ─── PROFILE ───────────────────────────────────────────────────── */
function ProfileScreenView({ user, profile, setProfile, onUpdateProfile, onLogout, setScreen }: any) {
  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h2 className="font-display text-3xl mb-6">Profil</h2>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-4">
        <div className="mb-5"><label className="block text-sm font-medium text-stone-600 mb-2">Name</label><input value={profile?.display_name||""} onChange={(e:any)=>setProfile((p:any)=>p?{...p,display_name:e.target.value}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none" /></div>
        <div className="mb-5 opacity-60"><label className="block text-sm font-medium text-stone-600 mb-2">Email</label><input value={user?.email||""} disabled className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base bg-stone-50" /></div>
        <div className="grid grid-cols-2 gap-4 mb-5"><div><label className="block text-sm font-medium text-stone-600 mb-2">Biologisches Geschlecht</label><select value={profile?.sex||"male"} onChange={(e:any)=>setProfile((p:any)=>p?{...p,sex:e.target.value}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base bg-white"><option value="male">Männlich</option><option value="female">Weiblich</option></select></div><div><label className="block text-sm font-medium text-stone-600 mb-2">Geburtsjahr</label><input type="number" value={profile?.birth_year||1990} onChange={(e:any)=>setProfile((p:any)=>p?{...p,birth_year:parseInt(e.target.value)}:null)} className="w-full px-4 py-3 rounded-xl border border-stone-200 text-base focus:border-teal-500 focus:outline-none" /></div></div>
        <button onClick={()=>profile&&onUpdateProfile({display_name:profile.display_name,sex:profile.sex,birth_year:profile.birth_year})} className="w-full py-3 bg-teal-600 text-white rounded-xl text-base font-medium hover:bg-teal-700 transition-colors">Profil speichern</button>
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 border-l-[3px] border-l-red-500"><h3 className="text-base font-semibold text-red-600 mb-1">Gefahrenzone</h3><p className="text-sm text-stone-500 mb-3">Alle Daten permanent löschen.</p><button onClick={()=>{if(confirm("Alle Daten löschen? Das kann nicht rückgängig gemacht werden."))onLogout();}} className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors">Alle Daten löschen</button></div>
      <button onClick={()=>setScreen("privacy")} className="mt-5 text-sm text-stone-400 hover:text-stone-600">Datenschutz →</button>
    </div>
  );
}

/* ─── PRIVACY ───────────────────────────────────────────────────── */
function PrivacyScreen({ user, setScreen }: any) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={()=>setScreen(user?"dashboard":"landing")} className="text-sm text-stone-500 hover:text-stone-700 mb-4">← Zurück</button>
      <h2 className="font-display text-3xl mb-2">Datenschutz & DSGVO</h2>
      <p className="text-base text-stone-500 mb-8">Vitalis ist mit Datenschutz als Kernprinzip entwickelt.</p>
      {[{t:"Deine Daten bleiben bei dir",d:"Blutwerte werden in einer gesicherten Datenbank gespeichert, geschützt durch Row Level Security (RLS). Nur du kannst auf deine Daten zugreifen."},{t:"Kein anderer User sieht deine Daten",d:"Die Datenbank erzwingt auf technischer Ebene, dass jeder Nutzer nur seine eigenen Daten sehen kann — selbst bei einem Software-Fehler."},{t:"Deine Rechte nach DSGVO",d:"Du kannst jederzeit alle Daten einsehen, exportieren oder vollständig löschen."},{t:"Kein Medizinprodukt",d:"Vitalis ist ein Bildungstool. Es ist kein zertifiziertes Medizinprodukt. Es stellt keine Diagnosen und gibt keine Behandlungsempfehlungen."},{t:"Optimale Bereiche",d:"Basieren auf publizierter Longevity-Forschung. Pädagogisch, nicht diagnostisch. Bitte immer mit deinem Arzt besprechen."}].map((s,i)=>(<div key={i} className="mb-7"><h3 className="text-lg font-semibold mb-1.5">{s.t}</h3><p className="text-base text-stone-500 leading-relaxed">{s.d}</p></div>))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP — all state lives here, components receive via props
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Prof|null>(null);
  const [screen, setScreen] = useState("landing");
  const [panels, setPanels] = useState<Panel[]>([]);
  const [currentPanel, setCurrentPanel] = useState<Panel|null>(null);
  const [toast, setToast] = useState<{msg:string;type:string}|null>(null);
  const [loading, setLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [profileSex, setProfileSex] = useState("male");
  const [profileBirthYear, setProfileBirthYear] = useState("1990");
  const [panelDate, setPanelDate] = useState(new Date().toISOString().split("T")[0]);
  const [panelLab, setPanelLab] = useState("");
  const [panelValues, setPanelValues] = useState<Record<string,string>>({});
  const [panelCategory, setPanelCategory] = useState(CATEGORY_ORDER[0]);
  const [saving, setSaving] = useState(false);

  const notify = (msg:string,type="ok") => {setToast({msg,type});setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);loadPanels(session.user.id);setScreen("dashboard");}
      setLoading(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_ev,session)=>{
      if(session?.user) setUser(session.user); else {setUser(null);setProfile(null);setPanels([]);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const loadProfile = async (uid:string) => {const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();if(data) setProfile(data);};
  const loadPanels = async (uid:string) => {
    const{data:pd}=await supabase.from("blood_panels").select("*").eq("user_id",uid).order("test_date",{ascending:true});
    if(!pd){setPanels([]);return;}
    const{data:vd}=await supabase.from("blood_values").select("*").eq("user_id",uid);
    setPanels(pd.map(p=>({...p,values:(vd||[]).filter((v:any)=>v.panel_id===p.id).map((v:any)=>({markerId:v.marker_id,value:parseFloat(v.value)}))})));
  };

  const handleSignup = async () => {
    if(!authEmail||!authPass||authPass.length<8){notify("Email & Passwort (min. 8 Zeichen) nötig","err");return;}
    setAuthLoading(true);
    const{data,error}=await supabase.auth.signUp({email:authEmail,password:authPass,options:{data:{display_name:authName||authEmail.split("@")[0]}}});
    if(error){notify(error.message,"err");setAuthLoading(false);return;}
    if(data.user){
      setUser(data.user);await new Promise(r=>setTimeout(r,800));
      await supabase.from("profiles").update({sex:profileSex,birth_year:parseInt(profileBirthYear),display_name:authName||authEmail.split("@")[0]}).eq("id",data.user.id);
      await loadProfile(data.user.id);setScreen("dashboard");setAuthEmail("");setAuthPass("");setAuthName("");notify("Willkommen bei Vitalis!");
    }
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    if(!authEmail||!authPass){notify("Email & Passwort eingeben","err");return;}
    setAuthLoading(true);
    const{data,error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPass});
    if(error){notify(error.message,"err");setAuthLoading(false);return;}
    setUser(data.user);await loadProfile(data.user.id);await loadPanels(data.user.id);setScreen("dashboard");setAuthEmail("");setAuthPass("");notify("Willkommen zurück!");setAuthLoading(false);
  };

  const handleLogout = async ()=>{await supabase.auth.signOut();setUser(null);setProfile(null);setPanels([]);setScreen("landing");};

  /* ─── FIXED: Save panel — ensures correct insert with select ─── */
  const handleSavePanel = async () => {
    const vals = Object.entries(panelValues).filter(([_,v])=>v!==""&&v!==undefined).map(([id,v])=>({markerId:id,value:parseFloat(v as string)})).filter(e=>!isNaN(e.value));
    if(!vals.length){notify("Mindestens einen Wert eingeben","err");return;}
    setSaving(true);
    try {
      // Step 1: Insert panel
      const{data:panelRow,error:panelErr}=await supabase.from("blood_panels").insert([{user_id:user.id,test_date:panelDate,lab_name:panelLab||null}]).select().single();
      if(panelErr) throw panelErr;
      if(!panelRow) throw new Error("Panel konnte nicht erstellt werden");
      // Step 2: Insert values
      const valueRows = vals.map(v=>({panel_id:panelRow.id,user_id:user.id,marker_id:v.markerId,value:v.value}));
      const{error:valErr}=await supabase.from("blood_values").insert(valueRows);
      if(valErr) throw valErr;
      // Step 3: Reload & navigate
      await loadPanels(user.id);
      setCurrentPanel({...panelRow,values:vals});
      setPanelValues({});setPanelDate(new Date().toISOString().split("T")[0]);setPanelLab("");
      setScreen("viewpanel");
      notify(`Gespeichert — ${vals.length} Marker erfasst`);
    } catch(e:any) {
      console.error("Save error:",e);
      notify("Fehler beim Speichern: "+(e.message||"Unbekannter Fehler"),"err");
    }
    setSaving(false);
  };

  const handleDeletePanel = async (pid:string)=>{
    if(!confirm("Panel wirklich löschen?")) return;
    await supabase.from("blood_values").delete().eq("panel_id",pid);
    await supabase.from("blood_panels").delete().eq("id",pid);
    await loadPanels(user.id);setScreen("dashboard");notify("Panel gelöscht");
  };

  const handleUpdateProfile = async (updates:Partial<Prof>)=>{
    await supabase.from("profiles").update(updates).eq("id",user.id);
    setProfile(prev=>prev?{...prev,...updates}:null);notify("Profil aktualisiert");
  };

  /* ─── PDF EXPORT ──────────────────────────────────────────────── */
  const handleExportPdf = (panel: Panel) => {
    const sex = profile?.sex || "male";
    const sx = sex === "female" ? "f" : "m";
    const name = profile?.display_name || "Patient";
    const date = new Date(panel.test_date).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });
    
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Vitalis Blutbild — ${date}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;color:#1c1917;padding:40px;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #0d9488}
      .logo{display:flex;align-items:center;gap:10px}.logo-box{width:36px;height:36px;background:#0d9488;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px}
      .logo-text{font-size:24px;font-weight:400;font-family:Georgia,serif}.meta{text-align:right;font-size:13px;color:#57534e}
      .cat-title{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#a8a29e;margin:24px 0 8px;padding-bottom:6px;border-bottom:1px solid #f5f5f4}
      .marker-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #fafaf9}
      .marker-name{font-weight:600;font-size:14px}.marker-de{font-size:11px;color:#a8a29e}
      .value{font-size:18px;font-weight:700}.unit{font-size:11px;color:#a8a29e;margin-left:4px}
      .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
      .optimal{background:#ecfdf5;color:#059669}.normal{background:#fffbeb;color:#d97706}.low,.high{background:#fef2f2;color:#dc2626}
      .ranges{font-size:10px;color:#a8a29e;margin-top:2px}
      .disclaimer{margin-top:32px;padding:16px;background:#f5f5f4;border-radius:8px;font-size:11px;color:#78716c;line-height:1.6;border-left:3px solid #d6d3d1}
      .footer{margin-top:24px;text-align:center;font-size:10px;color:#a8a29e}
      @media print{body{padding:20px}@page{margin:1cm}}
    </style></head><body>`;
    html += `<div class="header"><div class="logo"><div class="logo-box">V</div><div class="logo-text">Vitalis</div></div><div class="meta"><strong>${name}</strong><br>${date}${panel.lab_name ? `<br>${panel.lab_name}` : ""}<br>${panel.values.length} Marker</div></div>`;
    
    getSortedCategories().forEach(cat => {
      const cv = panel.values.filter(v => BLOOD_MARKERS.find(bm => bm.id === v.markerId)?.category === cat);
      if (!cv.length) return;
      html += `<div class="cat-title">${cat}</div>`;
      cv.forEach(v => {
        const m = BLOOD_MARKERS.find(bm => bm.id === v.markerId);
        if (!m) return;
        const si = getStatus(v.value, m, sex);
        html += `<div class="marker-row"><div><div class="marker-name">${m.name} <span class="badge ${si.status}">${si.label}</span></div><div class="marker-de">${m.name_de}</div><div class="ranges">Ref: ${m[`ref_min_${sx}` as keyof BloodMarker]}–${m[`ref_max_${sx}` as keyof BloodMarker]} ${m.unit} · Optimal: ${m[`opt_min_${sx}` as keyof BloodMarker]}–${m[`opt_max_${sx}` as keyof BloodMarker]} ${m.unit}</div></div><div style="text-align:right"><span class="value" style="color:${si.color}">${v.value}</span><span class="unit">${m.unit}</span></div></div>`;
      });
    });
    
    html += `<div class="disclaimer"><strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool. Die hier dargestellten optimalen Bereiche basieren auf publizierter Longevity-Forschung und ersetzen keine ärztliche Beratung.</div>`;
    html += `<div class="footer">Erstellt mit Vitalis · vitalis.vercel.app · ${new Date().toLocaleDateString("de-AT")}</div>`;
    html += `</body></html>`;
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => { setTimeout(() => { win.print(); }, 500); };
    }
  };

  const getHistory = (mid:string)=>panels.filter(p=>p.values.some(v=>v.markerId===mid)).map(p=>({date:p.test_date,value:p.values.find(v=>v.markerId===mid)?.value!})).filter(h=>h.value!==undefined).sort((a,b)=>a.date.localeCompare(b.date));
  const sex = profile?.sex||"male";

  if(loading) return (<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-teal-600/20">V</div><div className="text-stone-400 text-base">Laden…</div></div></div>);

  return (<>
    <AppHeader user={user} screen={screen} setScreen={setScreen} onLogout={handleLogout} />
    {toast&&<div className={`toast-animate fixed top-[72px] left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-xl text-sm font-medium shadow-lg z-[200] ${toast.type==="err"?"bg-red-50 text-red-600":"bg-emerald-50 text-emerald-600"}`}>{toast.msg}</div>}
    {screen==="landing"&&<LandingScreen setScreen={setScreen} />}
    {screen==="login"&&<AuthScreen isSignup={false} authEmail={authEmail} setAuthEmail={setAuthEmail} authPass={authPass} setAuthPass={setAuthPass} authName={authName} setAuthName={setAuthName} profileSex={profileSex} setProfileSex={setProfileSex} profileBirthYear={profileBirthYear} setProfileBirthYear={setProfileBirthYear} authLoading={authLoading} onSignup={handleSignup} onLogin={handleLogin} setScreen={setScreen} />}
    {screen==="signup"&&<AuthScreen isSignup={true} authEmail={authEmail} setAuthEmail={setAuthEmail} authPass={authPass} setAuthPass={setAuthPass} authName={authName} setAuthName={setAuthName} profileSex={profileSex} setProfileSex={setProfileSex} profileBirthYear={profileBirthYear} setProfileBirthYear={setProfileBirthYear} authLoading={authLoading} onSignup={handleSignup} onLogin={handleLogin} setScreen={setScreen} />}
    {screen==="dashboard"&&<DashboardScreen panels={panels} profile={profile} user={user} sex={sex} setScreen={setScreen} setPanelValues={setPanelValues} setPanelCategory={setPanelCategory} getHistory={getHistory} />}
    {screen==="addpanel"&&<AddPanelScreen sex={sex} panelDate={panelDate} setPanelDate={setPanelDate} panelLab={panelLab} setPanelLab={setPanelLab} panelValues={panelValues} setPanelValues={setPanelValues} panelCategory={panelCategory} setPanelCategory={setPanelCategory} saving={saving} onSave={handleSavePanel} setScreen={setScreen} />}
    {screen==="viewpanel"&&<ViewPanelScreen currentPanel={currentPanel} panels={panels} sex={sex} setScreen={setScreen} onDelete={handleDeletePanel} onExportPdf={handleExportPdf} />}
    {screen==="history"&&<HistoryScreen panels={panels} sex={sex} setScreen={setScreen} setCurrentPanel={setCurrentPanel} getHistory={getHistory} />}
    {screen==="profile"&&<ProfileScreenView user={user} profile={profile} setProfile={setProfile} onUpdateProfile={handleUpdateProfile} onLogout={handleLogout} setScreen={setScreen} />}
    {screen==="privacy"&&<PrivacyScreen user={user} setScreen={setScreen} />}
  </>);
}
