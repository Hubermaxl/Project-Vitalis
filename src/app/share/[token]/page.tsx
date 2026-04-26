import { createClient } from "@supabase/supabase-js";
import { BLOOD_MARKERS, getStatus, getSortedCategories, type BloodMarker } from "@/lib/markers";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SharePageProps {
  params: { token: string };
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "Blutbild":            { bg: "bg-rose-50/60",     border: "border-rose-200/60",    text: "text-rose-700",    dot: "bg-rose-400" },
  "Stoffwechsel":        { bg: "bg-amber-50/60",    border: "border-amber-200/60",   text: "text-amber-700",   dot: "bg-amber-400" },
  "Lipide":              { bg: "bg-violet-50/60",   border: "border-violet-200/60",  text: "text-violet-700",  dot: "bg-violet-400" },
  "Entzündung":          { bg: "bg-orange-50/60",   border: "border-orange-200/60",  text: "text-orange-700",  dot: "bg-orange-400" },
  "Schilddrüse":         { bg: "bg-sky-50/60",      border: "border-sky-200/60",     text: "text-sky-700",     dot: "bg-sky-400" },
  "Leber":               { bg: "bg-emerald-50/60",  border: "border-emerald-200/60", text: "text-emerald-700", dot: "bg-emerald-400" },
  "Niere":               { bg: "bg-cyan-50/60",     border: "border-cyan-200/60",    text: "text-cyan-700",    dot: "bg-cyan-400" },
  "Vitamine & Minerale": { bg: "bg-yellow-50/60",   border: "border-yellow-200/60",  text: "text-yellow-700",  dot: "bg-yellow-400" },
  "Hormone":             { bg: "bg-fuchsia-50/60",  border: "border-fuchsia-200/60", text: "text-fuchsia-700", dot: "bg-fuchsia-400" },
  "Weitere":             { bg: "bg-stone-50/60",    border: "border-stone-200/60",   text: "text-stone-600",   dot: "bg-stone-400" },
};
const getCatColor = (cat: string) => CATEGORY_COLORS[cat] || CATEGORY_COLORS["Weitere"];

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-stone-200 flex items-center justify-center text-stone-500 text-2xl mx-auto mb-5">⚠</div>
        <h1 className="font-display text-2xl mb-2">{title}</h1>
        <p className="text-stone-500 mb-6">{message}</p>
        <Link href="/" className="text-sm text-teal-600 hover:underline underline-offset-4">Zur Vitalis-Startseite →</Link>
      </div>
    </div>
  );
}

function RangeBar({ value, marker, sex }: { value: number; marker: BloodMarker; sex: string }) {
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;
  const span = Math.max(refMax * 1.5, value * 1.2) - Math.min(refMin * 0.5, value * 0.8);
  const minScale = Math.min(refMin * 0.5, value * 0.8);
  const pct = (n: number) => `${Math.max(0, Math.min(100, ((n - minScale) / span) * 100))}%`;
  const dotColor = getStatus(value, marker, sex).color;
  return (
    <div className="relative h-2.5 rounded-full bg-stone-100 mt-2 mb-1">
      <div className="absolute h-full rounded-full bg-amber-200/70" style={{ left: pct(refMin), width: `calc(${pct(refMax)} - ${pct(refMin)})` }} />
      <div className="absolute h-full rounded-full bg-emerald-300/80 border border-emerald-400/30" style={{ left: pct(optMin), width: `calc(${pct(optMax)} - ${pct(optMin)})` }} />
      <div className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow" style={{ left: `calc(${pct(value)} - 8px)`, background: dotColor }} />
    </div>
  );
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return <ErrorScreen title="Server-Konfiguration unvollständig" message="Bitte später erneut versuchen." />;
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Share-Link laden
  const { data: share } = await admin
    .from("share_links")
    .select("*")
    .eq("token", token)
    .single();

  if (!share) {
    return <ErrorScreen title="Link nicht gefunden" message="Dieser Sharing-Link existiert nicht oder wurde nie erstellt." />;
  }

  // 2) Validieren: revoked / expired
  if (share.revoked_at) {
    return <ErrorScreen title="Link wurde widerrufen" message="Der Besitzer hat diesen Link deaktiviert." />;
  }
  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return <ErrorScreen title="Link abgelaufen" message="Dieser Sharing-Link ist nicht mehr gültig. Bitte den Besitzer um einen neuen Link." />;
  }

  // 3) Panel + Werte + Profil laden
  const { data: panel } = await admin.from("blood_panels").select("*").eq("id", share.panel_id).single();
  if (!panel) {
    return <ErrorScreen title="Panel nicht verfügbar" message="Das geteilte Panel wurde gelöscht." />;
  }
  const { data: values } = await admin.from("blood_values").select("*").eq("panel_id", share.panel_id);
  const { data: profile } = await admin.from("profiles").select("display_name, sex").eq("id", share.user_id).single();

  // 4) View-Counter inkrementieren (best-effort, kein await-Block falls Fehler)
  await admin
    .from("share_links")
    .update({ view_count: (share.view_count || 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq("id", share.id);

  const sex = profile?.sex || "male";
  const sx = sex === "female" ? "f" : "m";
  const patientName = profile?.display_name || "Patient";
  const dateStr = new Date(panel.test_date).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" });
  const expiresStr = share.expires_at
    ? new Date(share.expires_at).toLocaleDateString("de-AT", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const valuesList = (values || []).map((v: any) => ({ markerId: v.marker_id, value: parseFloat(v.value) }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-stone-900 bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-teal-600 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold text-lg flex items-center justify-center">V</div>
          <div className="font-display text-2xl">Vitalis</div>
        </div>
        <div className="text-right text-sm text-stone-500">
          <div>Geteilt von <strong className="text-stone-700">{patientName}</strong></div>
          <div className="text-xs">{dateStr}{panel.lab_name ? ` · ${panel.lab_name}` : ""} · {valuesList.length} Marker</div>
        </div>
      </div>

      {/* Hinweisbanner */}
      <div className="mb-6 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-800 leading-relaxed">
        <strong>Read-only Ansicht.</strong> Diese Seite wurde mit einem Sharing-Link von <strong>{patientName}</strong> geteilt. Der Empfänger sieht ausschließlich die Werte dieses einen Blutbilds.
        {expiresStr && <> Gültig bis <strong>{expiresStr}</strong>.</>}
      </div>

      {/* Legende */}
      <div className="flex items-center gap-5 mb-6 text-xs text-stone-500 flex-wrap">
        <div className="flex items-center gap-2"><div className="w-4 h-2.5 rounded bg-amber-200/70" /><span>Referenzbereich</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-2.5 rounded bg-emerald-300/80 border border-emerald-400/30" /><span>Longevity-Optimal (nach Attia)</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow-sm" /><span>Aktueller Wert</span></div>
      </div>

      {/* Werte gruppiert */}
      {getSortedCategories().map(cat => {
        const cv = valuesList.filter(v => BLOOD_MARKERS.find(bm => bm.id === v.markerId)?.category === cat);
        if (!cv.length) return null;
        const cc = getCatColor(cat);
        return (
          <div key={cat} className="mb-7">
            <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${cc.border}`}>
              <span className={`w-3 h-3 rounded-full ${cc.dot}`} />
              <h3 className={`text-sm font-semibold uppercase tracking-widest ${cc.text}`}>{cat}</h3>
            </div>
            {cv.map(v => {
              const marker = BLOOD_MARKERS.find(m => m.id === v.markerId);
              if (!marker) return null;
              const si = getStatus(v.value, marker, sex);
              return (
                <div key={v.markerId} className={`rounded-2xl border shadow-sm p-5 mb-3 ${cc.bg} ${cc.border}`}>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="font-semibold text-base">{marker.name} <span className="text-xs font-normal ml-1 px-2 py-0.5 rounded-full" style={{ background: si.color + "20", color: si.color }}>{si.label}</span></div>
                      <div className="text-sm text-stone-500">{marker.name_de}</div>
                    </div>
                    <div className="text-xl font-bold" style={{ color: si.color }}>
                      {v.value} <span className="text-sm font-normal text-stone-400">{marker.unit}</span>
                    </div>
                  </div>
                  <RangeBar value={v.value} marker={marker} sex={sex} />
                  <div className="flex gap-5 text-xs text-stone-500 mt-2 flex-wrap">
                    <span>Referenz: {marker[`ref_min_${sx}` as keyof BloodMarker]}–{marker[`ref_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                    <span className="text-emerald-600 font-medium">Optimal: {marker[`opt_min_${sx}` as keyof BloodMarker]}–{marker[`opt_max_${sx}` as keyof BloodMarker]} {marker.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl text-sm text-stone-500 bg-stone-100 mt-8 leading-relaxed border-l-[3px] border-stone-300">
        <strong>⚕️ Kein medizinischer Befund.</strong> Vitalis ist ein Bildungstool inspiriert von der Longevity-Medizin. Optimale Bereiche basieren auf publizierter Forschung (u.a. Peter Attia) und ersetzen keine ärztliche Beratung. Die hier dargestellten Werte wurden vom User selbst eingegeben.
      </div>

      {/* Footer */}
      <div className="text-center mt-10 mb-6 text-sm text-stone-400">
        Erstellt mit <Link href="/" className="text-teal-600 hover:underline underline-offset-4 font-medium">Vitalis</Link> · Dein persönliches Longevity-Dashboard
      </div>
    </div>
  );
}
