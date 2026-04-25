import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const token = auth.slice(7);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Server nicht konfiguriert (SUPABASE_SERVICE_ROLE_KEY fehlt)" },
      { status: 500 }
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1) Token verifizieren
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Ungültige Session" }, { status: 401 });
  }
  const uid = userData.user.id;

  // 2) Daten in Reihenfolge löschen (FK-sicher)
  try {
    const { error: vErr } = await admin.from("blood_values").delete().eq("user_id", uid);
    if (vErr) throw vErr;
    const { error: pErr } = await admin.from("blood_panels").delete().eq("user_id", uid);
    if (pErr) throw pErr;
    const { error: prErr } = await admin.from("profiles").delete().eq("id", uid);
    if (prErr) throw prErr;

    // 3) Auth-User löschen (irreversibel)
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) throw delErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Delete account error:", e);
    return NextResponse.json(
      { error: e?.message || "Löschung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
