# Vitalis — Master Reference File

> **Zweck:** Diese Datei gibt Claude in jedem neuen Chat sofort den vollen Kontext über Project Vitalis. Einfach als Projekt-Datei anhängen oder zu Beginn eines Chats hochladen.
>
> **Stand:** April 2026

---

## 1. Was ist Vitalis?

Eine Web-App zum Tracken und Visualisieren von Blutwerten, inspiriert von der Longevity-Medizin (Dr. Peter Attia, *Outlive*). Zielgruppe: österreichische User, die ihre Biomarker nicht nur im klinischen Referenzbereich, sondern im **longevity-optimalen Bereich** verstehen wollen.

**Live:** Deployed auf Vercel (Auto-Deploy via GitHub)
**Repo:** https://github.com/Hubermaxl/Project-Vitalis (public)
**Sprache der UI:** Deutsch

---

## 2. Tech Stack

| Layer | Technologie |
|-------|-------------|
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS 3.4, DM Sans + Instrument Serif |
| Backend/Auth | Supabase (PostgreSQL + Auth + RLS) |
| Hosting | Vercel (CI/CD via GitHub Integration) |
| Deployment | Max pusht via GitHub Web-UI → Vercel baut automatisch |

**Keine CLI-Nutzung** — Max arbeitet über die GitHub Web-Oberfläche.

---

## 3. Dateistruktur (Key Files)

```
src/
├── app/
│   ├── page.tsx          ← Gesamte App (Single-File SPA mit Screen-Routing)
│   ├── layout.tsx        ← HTML-Shell, Metadata, Fonts
│   └── globals.css       ← Tailwind Imports, Animations
└── lib/
    ├── markers.ts        ← 47 Biomarker mit Referenz-/Optimalwerten, Kategorien, Longevity-Notes
    └── supabase.ts       ← Supabase Client Init
```

**Architektur-Prinzip:** Die App ist eine Single-Page-Application in `page.tsx`. State lebt in der `Home()`-Komponente, Screen-Komponenten (Dashboard, AddPanel, ViewPanel, History, Profile, etc.) sind **außerhalb** von `Home()` definiert und erhalten alles via Props.

---

## 4. Datenbank (Supabase)

### Tabellen

| Tabelle | Zweck |
|---------|-------|
| `profiles` | User-Profil (display_name, sex, birth_year). Auto-Create via Trigger bei Signup. |
| `blood_panels` | Ein Bluttest-Ereignis (user_id, test_date, lab_name) |
| `blood_values` | Einzelne Messwerte (panel_id, user_id, marker_id, value) |

### Sicherheit
- **RLS (Row Level Security)** auf DB-Ebene — nicht nur App-Logik
- Jeder User sieht nur seine eigenen Daten
- Insert-Pattern: `.insert([...]).select().single()` mit `try/catch`

### Performance
- Indexes auf user_id und panel_id

---

## 5. Marker-System (`markers.ts`)

**47 Marker** in 10 Kategorien:
Blutbild, Stoffwechsel, Lipide, Entzündung, Schilddrüse, Leber, Niere, Vitamine & Minerale, Hormone, Weitere

### BloodMarker Interface
```typescript
{
  id: string;              // z.B. "hba1c"
  name: string;            // Englisch
  name_de: string;         // Deutsch
  category: string;        // Kategorie
  unit: string;
  ref_min_m/f, ref_max_m/f  // Klinische Referenz (geschlechtsspezifisch)
  opt_min_m/f, opt_max_m/f  // Longevity-optimal (geschlechtsspezifisch)
  description / description_de
  priority: "essential" | "recommended" | "extended"
  longevity_note?: string  // Erklärung warum dieser Marker für Langlebigkeit wichtig ist
}
```

### Status-Logik (`getStatus`)
- **Optimal** (grün #059669): Wert im opt_min–opt_max Bereich
- **Normal** (amber #d97706): Im Referenzbereich aber nicht optimal
- **Niedrig/Hoch** (rot #dc2626): Außerhalb des Referenzbereichs

### Priority-System (visuell als Dots)
- 🟢 Teal Dot = essential (Kernmarker)
- ⚪ Gray Dot = recommended (empfohlen)
- Kein Dot = extended (erweitert)

---

## 6. Implementierte Features

| Feature | Status | Details |
|---------|--------|---------|
| Auth (Signup/Login/Logout) | ✅ | Supabase Auth, Email/Passwort |
| Profil (Name, Geschlecht, Geburtsjahr) | ✅ | Beeinflusst Referenzwerte |
| Panel erstellen | ✅ | Kategorie-Tabs, Priority-Filter, Werte eingeben |
| Panel bearbeiten | ✅ | EditPanelScreen, Delete-then-Insert Pattern |
| Panel löschen | ✅ | Mit Bestätigungsdialog |
| Dashboard mit Score | ✅ | Kreisdiagramm (% optimal), kontextuelle Message |
| RangeBar Visualisierung | ✅ | Referenz (amber) + Optimal (grün) + Dot für Wert |
| Delta-Indikatoren | ✅ | ↑12% / ↓8% Vergleich zum Vorpanel, farbcodiert |
| Sparklines (Trend) | ✅ | Mini-Charts im Dashboard bei ≥2 Panels |
| Longevity-Notes | ✅ | Togglebar pro Marker, teal Hintergrund |
| Verlauf/History | ✅ | Alle Panels + Trends für essential/recommended Marker |
| PDF Export | ✅ | HTML generiert → Print-Dialog, professionelles Layout |
| Kategorie-Farbcodierung | ✅ | CATEGORY_COLORS Lookup |
| Marker-Erklärungen | ✅ | MARKER_EXPLANATIONS Dictionary, inline |
| Landing Page | ✅ | Mission, 3 Feature-Cards, "Gemacht in Österreich" |
| Datenschutz-Seite | ✅ | DSGVO-Info, RLS erklärt |
| Medical Disclaimer | ✅ | Auf jeder Seite |

---

## 7. Offene Issues (aus Issue Tracker)

### P1 — Hoch
- **VIT-009:** Mobile Optimierung (Touch-Targets ≥44px, Hamburger-Menü)
- **VIT-010:** Vercel Deployment mit aktuellem Code verifizieren

### P2 — Mittel
- **VIT-011:** Panel-Vergleichsansicht (Side-by-Side)
- **VIT-012:** Marker-Detailseite (Klick → Beschreibung, Einflussfaktoren, voller Verlauf)
- **VIT-013:** Datenexport CSV/JSON (DSGVO-Pflicht)
- **VIT-014:** Landing Page Social Proof & Screenshots
- **VIT-015:** Longevity-Notizen vervollständigen (alle essential/recommended)

### P3 — Niedrig / Geplant
- **VIT-016:** OCR/PDF Upload (bewusst aus MVP ausgeklammert)
- **VIT-017:** Freemium + Stripe
- **VIT-018:** Arzt-Sharing mit Einmallink
- **VIT-019:** Impressum & rechtliche Absicherung
- **VIT-020:** Deutsch/Englisch Sprachumschaltung
- **VIT-021:** Dark Mode
- **VIT-022:** Custom Domain

---

## 8. Technische Learnings & Regeln

1. **Screen-Komponenten MÜSSEN außerhalb von `Home()` definiert sein.** Innerhalb = Re-Creation bei jedem Render → Input-Fokus und State gehen verloren.

2. **Supabase Insert:** Immer `.insert([...]).select().single()` mit `try/catch`.

3. **TypeScript Set-Iteration:** `Array.from(set)` statt Spread-Syntax `[...set]`.

4. **Kein OCR im MVP.** Bewusste Scope-Entscheidung.

5. **RLS auf DB-Ebene.** Sicherheit nicht nur durch App-Logik.

6. **Repo ist public** — Claude kann direkt lesen. Kein manuelles Pasten nötig.

7. **Max deployt über GitHub Web-UI** — keine CLI. Dateien komplett ersetzen, nicht mit Diffs arbeiten.

8. **Immer copy-paste-ready, komplette Dateien liefern** wenn Code geändert wird.

---

## 9. Design-System

### Farben
- **Brand/Teal:** `#14b8a6` (Tailwind teal-500 Basis)
- **Teal-600:** `#0d9488` (primäre Aktionsfarbe, Logo, Buttons)
- **Hintergrund:** stone-50 (`#fafaf9`)
- **Text:** stone-900
- **Status:** emerald (#059669 optimal), amber (#d97706 normal), red (#dc2626 kritisch)

### Typografie
- **Body:** DM Sans (sans-serif)
- **Display/Headlines:** Instrument Serif
- **Basis-Größe:** 14–16px

### Komponenten-Stil
- Cards: `rounded-2xl border border-stone-100 shadow-sm`
- Buttons (primär): `bg-teal-600 text-white rounded-xl hover:bg-teal-700`
- Inputs: `rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20`
- Logo: Teal-600 Quadrat mit "V", `rounded-xl`

### Inspiration
- Apple (Klarheit)
- WHOOP (Health-Tracking Ästhetik)
- Levels (Biomarker-Visualisierung)

---

## 10. Kontext für Claude

### Rolle
Claude agiert als technischer Co-Founder, Senior Engineer und Lehrer. Max lernt durch das Bauen — Erklärungen sind willkommen, aber immer mit konkretem, funktionierendem Code.

### Kommunikation
- Sprache: **Deutsch** (für Konversation und UI-Texte)
- Code-Kommentare: Englisch ist OK
- Stil: Direkt, praktisch, Annahmen hinterfragen

### Workflow
1. **Immer zuerst Repo lesen** bevor Änderungen vorgeschlagen werden
2. **Komplette Dateien liefern** (nicht Diffs/Patches)
3. **Max gibt Dateinamen an** wo Code hin soll
4. **Testen via Vercel Preview** nach jedem Push

### Constraints
- DSGVO-konform
- Österreichische Lab-Referenzwerte
- Medical Disclaimer auf jedem Screen
- "Optimal" = pädagogisch, nicht diagnostisch
- Premium-Ästhetik (kein "Bootstrap-Look")
