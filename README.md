# Vitalis

Eine Web-App zum Tracken und Visualisieren von Blutwerten, inspiriert von der Longevity-Medizin (Dr. Peter Attia, *Outlive*). Zielgruppe: österreichische User, die ihre Biomarker nicht nur im klinischen Referenzbereich, sondern im **longevity-optimalen Bereich** verstehen wollen.

**Live:** Deployed auf Vercel (Auto-Deploy via GitHub)
**UI-Sprache:** Deutsch

---

## Tech Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS 3.4, DM Sans + Instrument Serif |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel (CI/CD via GitHub Integration) |

---

## Dateistruktur

```
src/
├── app/
│   ├── page.tsx          ← Gesamte App (Single-File SPA mit Screen-Routing)
│   ├── layout.tsx        ← HTML-Shell, Metadata, Fonts
│   └── globals.css       ← Tailwind Imports, Animations
└── lib/
    ├── markers.ts        ← 47 Biomarker mit Referenz-/Optimalwerten
    └── supabase.ts       ← Supabase Client Init
```

**Architektur-Prinzip:** Single-Page-Application in `page.tsx`. State lebt in der `Home()`-Komponente, Screen-Komponenten (Dashboard, AddPanel, ViewPanel, History, Profile, etc.) sind **außerhalb** von `Home()` definiert und erhalten alles via Props.

---

## Datenbank (Supabase)

| Tabelle | Zweck |
|---------|-------|
| `profiles` | User-Profil (display_name, sex, birth_year) — Auto-Create via Trigger bei Signup |
| `blood_panels` | Ein Bluttest-Ereignis (user_id, test_date, lab_name) |
| `blood_values` | Einzelne Messwerte (panel_id, user_id, marker_id, value) |

Row-Level-Security aktiv: jeder User sieht ausschließlich eigene Daten.

---

## Environment Variables

In Vercel konfiguriert:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Deployment

1. Änderung via GitHub Web-UI committen
2. Vercel baut automatisch
3. Preview-Deployment testen
4. Merge → Production

Keine lokale Dev-Umgebung — alle Tests laufen über Vercel Preview.

---

## Scripts

```bash
npm run dev     # Next Dev Server (lokal, wird nicht genutzt)
npm run build   # Production Build
npm run start   # Production Server
```

---

Ausführliche Projekt-Referenz: siehe [VITALIS-MASTER.md](VITALIS-MASTER.md).
