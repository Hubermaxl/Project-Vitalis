// ─── Marker-Copy ──────────────────────────────────────────────────
// Texte für Erklärung & Maßnahmen pro Marker. Bewusst aus markers.ts und
// page.tsx ausgelagert, damit beide Komponenten-Welten (alt + Vitalis) auf
// dieselbe Quelle zugreifen.

/* ─── SHORT MARKER EXPLANATIONS ─────────────────────────────────── */
export const MARKER_EXPLANATIONS: Record<string, string> = {
  hb: "Transportiert Sauerstoff im Blut. Niedrig = Müdigkeit, hoch = Dehydration oder andere Ursachen.",
  hct: "Anteil roter Blutkörperchen am Gesamtblut. Zeigt Sauerstoff-Transportkapazität.",
  wbc: "Deine Immunzellen. Erhöht bei Infektionen oder chronischer Entzündung.",
  plt: "Zuständig für Blutgerinnung. Zu niedrig = Blutungsrisiko, zu hoch = Thromboserisiko.",
  glucose: "Dein Blutzucker im Nüchternzustand. Zentral für Stoffwechselgesundheit und Diabetes-Prävention.",
  hba1c: "Langzeit-Blutzucker der letzten 3 Monate. Der wichtigste Marker für metabolische Gesundheit.",
  insulin: "Zeigt wie viel Insulin dein Körper produziert. Frühwarnsystem für Insulinresistenz.",
  homa_ir: "Berechnet aus Glukose und Insulin. Der beste Einzelwert um Insulinresistenz zu erkennen.",
  uric_acid: "Stoffwechsel-Endprodukt. Erhöht bei Gicht, aber auch Marker für Herz-Kreislauf-Risiko.",
  chol_total: "Gesamtcholesterin — allein wenig aussagekräftig, erst im Kontext mit LDL/HDL/ApoB relevant.",
  ldl: "Sogenanntes 'schlechtes' Cholesterin. Lagert sich in Gefäßwänden ab und fördert Arteriosklerose.",
  hdl: "Sogenanntes 'gutes' Cholesterin. Transportiert Cholesterin zurück zur Leber zur Entsorgung.",
  trig: "Blutfette — steigen durch Zucker, Alkohol und gesättigte Fette. Nüchternwert am aussagekräftigsten.",
  apob: "Zählt die atherogenen Partikel direkt. Besserer Risikomarker als LDL allein.",
  lpa: "Genetisch bestimmt — einmal messen reicht. Erhöht = höheres Herz-Kreislauf-Risiko.",
  crp: "Hochsensitiver Entzündungsmarker. Chronisch erhöht = stille Entzündung im Körper.",
  ferritin: "Dein Eisenspeicher. Zu niedrig = Müdigkeit. Zu hoch = Entzündung oder Eisenüberladung.",
  homocysteine: "Aminosäure im Blut. Erhöht bei B12/Folat-Mangel — Risiko für Herz und Gehirn.",
  esr: "Blutsenkungsgeschwindigkeit. Unspezifischer Entzündungsmarker — zeigt ob 'etwas los ist'.",
  tsh: "Steuerhormon der Schilddrüse. Zu hoch = Unterfunktion, zu niedrig = Überfunktion.",
  ft3: "Das aktive Schilddrüsenhormon. Verantwortlich für Energielevel und Stoffwechsel.",
  ft4: "Vorstufe des aktiven T3. Wird in der Schilddrüse produziert.",
  alt: "Leberenzym — sehr empfindlich für Leberstress. Steigt bei Fettleber, Alkohol, Medikamenten.",
  ast: "Leber- und Muskelenzym. Erhöht nach Sport, bei Lebererkrankungen oder Muskelverletzungen.",
  ggt: "Reagiert stark auf Alkohol und Medikamente. Auch unabhängiger Herz-Kreislauf-Risikomarker.",
  alp: "Knochen- und Leberenzym. Erhöht bei Knochenumbau, Gallenstau oder Lebererkrankungen.",
  creatinine: "Abbauprodukt aus Muskeln. Zeigt wie gut deine Nieren filtern.",
  egfr: "Geschätzte Filtrationsrate der Nieren. Sinkt natürlich mit dem Alter.",
  cystatin_c: "Präziserer Nierenmarker als Kreatinin — unabhängig von Muskelmasse.",
  bun: "Harnstoff — Endprodukt des Eiweißstoffwechsels. Zeigt Nierenfunktion und Hydrationsstatus.",
  vitd: "Das 'Sonnenvitamin'. Wichtig für Immunsystem, Knochen und Stimmung. Im Winter oft zu niedrig.",
  b12: "Essentiell für Nerven und Blutbildung. Mangel häufig bei vegetarischer Ernährung.",
  folate: "Wichtig für DNA-Reparatur und Zellteilung. Oft zu niedrig ohne grünes Gemüse.",
  iron: "Verfügbares Eisen im Blut. Schwankt stark — immer zusammen mit Ferritin betrachten.",
  magnesium: "Beteiligt an über 300 Enzymreaktionen. Serum-Wert zeigt nur 1% der Gesamtspeicher.",
  zinc: "Wichtig für Immunsystem und Hormonproduktion. Mangel häufiger als gedacht.",
  omega3_index: "EPA+DHA-Anteil in roten Blutkörperchen. Zeigt den Omega-3-Status der letzten 3 Monate.",
  testosterone_total: "Hauptsächlich männliches Hormon. Sinkt ab 30 um ca. 1% pro Jahr.",
  dhea_s: "Anti-Aging-Hormon. Sinkt mit dem Alter stärker als jedes andere Hormon.",
  cortisol: "Stresshormon — morgens am höchsten. Chronisch erhöht = Schlafprobleme, Gewichtszunahme.",
  igf1: "Wachstumsfaktor. Moderate Werte scheinen optimal — zu hoch und zu niedrig haben Nachteile.",
  albumin: "Zeigt Ernährungs- und Leberstatus. Niedrig bei Mangelernährung oder Lebererkrankungen.",
  ldh: "Gewebeschadens-Marker. Erhöht bei Verletzungen, Infektionen oder Bluterkrankungen.",
};

/* ─── MARKER INFLUENCES ─────────────────────────────────────────── */
export const MARKER_INFLUENCES: Record<string, { up: string[]; down: string[] }> = {
  glucose: {
    up: ["Zucker & raffinierte Kohlenhydrate", "Bewegungsmangel", "Chronischer Stress & Schlafmangel", "Übergewicht (v.a. viszerales Fett)"],
    down: ["Bewegung nach Mahlzeiten", "Schlafdauer optimieren (7–9 h)", "Ballaststoffreiche Ernährung", "Intervallfasten"],
  },
  hba1c: {
    up: ["Dauerhaft erhöhte Glukosewerte", "Wenig Bewegung", "Verarbeitete Lebensmittel & Zucker", "Stress & Schlafmangel"],
    down: ["Regelmäßiger Sport (bes. Krafttraining)", "Low-Carb oder mediterrane Ernährung", "Gewichtsreduktion bei Übergewicht", "Guter Schlaf (7–9 h)"],
  },
  insulin: {
    up: ["Häufige kohlenhydratreiche Mahlzeiten", "Übergewicht & Bewegungsmangel", "Schlafmangel & chronischer Stress", "Verarbeiteter Zucker & Fruchtzucker"],
    down: ["Intervallfasten (z.B. 16:8)", "Krafttraining erhöht Insulinsensitivität", "Ballaststoffe verlangsamen Glukoseanstieg", "Gewichtsreduktion"],
  },
  ldl: {
    up: ["Gesättigte Fettsäuren (Butter, rotes Fleisch)", "Trans-Fette (industriell verarbeitet)", "Genetische Prädisposition", "Schilddrüsenunterfunktion"],
    down: ["Statine (Medikament)", "Lösliche Ballaststoffe (Hafer, Hülsenfrüchte)", "Regelmäßiger Ausdauersport", "Mediterrane Ernährung"],
  },
  hdl: {
    up: ["Regelmäßige Bewegung (v.a. Ausdauer)", "Omega-3-reiche Ernährung (Fisch, Nüsse)", "Rauchen aufhören", "Moderater Alkoholkonsum"],
    down: ["Rauchen", "Bewegungsmangel & Übergewicht", "Trans-Fette & stark verarbeitete Lebensmittel", "Sehr fettarme Diäten"],
  },
  trig: {
    up: ["Zucker, Fruchtzucker & raffinierte Kohlenhydrate", "Alkohol", "Übergewicht & metabolisches Syndrom", "Bewegungsmangel"],
    down: ["Omega-3-Fettsäuren (Fischöl)", "Alkohol reduzieren oder weglassen", "Kohlenhydrate reduzieren", "Regelmäßiger Sport"],
  },
  apob: {
    up: ["Hohe LDL- und VLDL-Partikelzahl", "Gesättigte Fette & Transfette", "Übergewicht & Insulinresistenz"],
    down: ["Statine & PCSK9-Inhibitoren", "Lösliche Ballaststoffe", "Mediterrane / pflanzenbetonte Kost", "Gewichtsreduktion"],
  },
  crp: {
    up: ["Aktive Infektionen & Entzündungen", "Übergewicht (viszerales Fett)", "Rauchen", "Verarbeitete Lebensmittel & Zucker"],
    down: ["Regelmäßiger Sport", "Mediterrane Ernährung", "Ausreichend Schlaf", "Stressreduktion (Meditation, etc.)"],
  },
  ferritin: {
    up: ["Eisenreiche Ernährung (rotes Fleisch)", "Aktive Entzündungen im Körper", "Regelmäßiger Alkohol", "Hämochromatose (genetisch)"],
    down: ["Blutspende (bei Männern mit hohen Werten)", "Pflanzenbetonte Ernährung", "Phytate (Getreide, Hülsenfrüchte) hemmen Eisenaufnahme"],
  },
  tsh: {
    up: ["Jodmangel", "Autoimmune Schilddrüsenerkrankung (Hashimoto)", "Starker Stress & Schlafentzug", "Selenmangel"],
    down: ["Ausreichend Jod & Selen in der Ernährung", "Levothyroxin-Therapie bei Unterfunktion", "Stressmanagement"],
  },
  vitd: {
    up: ["Direkte Sonneneinstrahlung (UVB, 20–30 min/Tag)", "Vitamin D3-Supplementierung", "Fettreiche Fische (Lachs, Makrele)", "Vitamin-D-reiche Pilze (UV-behandelt)"],
    down: ["Konsequenter Sonnenschutz ohne Supplementierung", "Übergewicht (D3 wird im Fettgewebe gebunden)", "Wenig Sonnenlicht (Österreich Oktober–März)", "Malabsorptionssyndrome"],
  },
  b12: {
    up: ["Tierische Produkte (Fleisch, Eier, Milch)", "B12-Supplementierung (Methylcobalamin)", "Gesunde Magengesundheit (Intrinsic Factor)"],
    down: ["Vegane / vegetarische Ernährung ohne Supplement", "Metformin-Einnahme reduziert Aufnahme", "Magensäureblocker (PPI)", "Alter (Absorptionsfähigkeit sinkt)"],
  },
  alt: {
    up: ["Alkohol", "Fettleber (metabolisch oder alkoholfrei)", "Bestimmte Medikamente (Statine, Paracetamol)", "Intensiver Sport kurz vor Blutabnahme"],
    down: ["Alkohol reduzieren oder weglassen", "Gewichtsreduktion bei Fettleber", "Mediterrane Ernährung", "Kaffee (nachweislich leberschützend)"],
  },
  ggt: {
    up: ["Alkohol (sehr sensitiv)", "Leberschädigende Medikamente", "Übergewicht & metabolisches Syndrom", "Rauchen"],
    down: ["Alkohol reduzieren oder weglassen", "Gewichtsreduktion", "Regelmäßige Bewegung", "Koffein"],
  },
  creatinine: {
    up: ["Hoher Fleischkonsum vor dem Test", "Dehydration", "Intensiver Sport kurz vor Test", "Hohe Muskelmasse (physiologisch)"],
    down: ["Ausreichend Hydrierung", "Weniger rotes Fleisch vor dem Test", "Pflanzliche Ernährung"],
  },
  egfr: {
    up: ["Gute Hydrierung", "Gesunder Blutdruck (unter 130/80)", "Regelmäßige Bewegung", "Normaler Blutzucker"],
    down: ["Chronisch hoher Blutdruck", "Unkontrollierter Diabetes", "NSAID-Schmerzmittel (Ibuprofen) langfristig", "Natürlicher Rückgang mit dem Alter (~1 mL/min/Jahr)"],
  },
  testosterone_total: {
    up: ["Krafttraining (v.a. Kniebeugen, Kreuzheben)", "Ausreichend Schlaf (7–9 h)", "Zink & Vitamin D ausreichend", "Gesundes Körpergewicht"],
    down: ["Alkohol reduziert Produktion", "Übergewicht & Insulinresistenz", "Chronischer Stress (Cortisol hemmt T)", "Schlafmangel"],
  },
  omega3_index: {
    up: ["Fettreicher Fisch 2–3× pro Woche", "Hochdosierte Fischöl-Kapseln (EPA/DHA)", "Algenöl (vegane Alternative)"],
    down: ["Omega-6-reiche Ernährung (Sonnenblumenöl)", "Kein Fisch und kein Fischöl-Supplement"],
  },
  magnesium: {
    up: ["Nüsse & Samen (Kürbiskerne, Mandeln)", "Grünes Blattgemüse (Spinat, Mangold)", "Magnesium-Glycinat oder -Malat (Supplement)", "Hülsenfrüchte & Vollkornprodukte"],
    down: ["Alkohol erhöht Ausscheidung über Nieren", "Chronischer Stress", "Diuretika & bestimmte Medikamente", "Stark verarbeitete Ernährung"],
  },
  homocysteine: {
    up: ["Vitamin B12-Mangel", "Folsäure-Mangel", "Vitamin B6-Mangel", "Rauchen & hoher Kaffeekonsum"],
    down: ["B12-Supplementierung (Methylcobalamin)", "Folsäure (v.a. aus grünem Gemüse)", "Vitamin B6-reiche Kost", "Rauchen aufhören"],
  },
  wbc: {
    up: ["Aktive Infektionen (bakteriell/viral)", "Chronische Entzündung", "Rauchen", "Intensiver Sport direkt vor dem Test"],
    down: ["Entzündungsreduzierende Ernährung", "Guter Schlaf & Stressreduktion", "Rauchen aufhören"],
  },
  hb: {
    up: ["Höhentraining", "Ausreichend Eisen, B12 & Folsäure", "Gute Hydrierung"],
    down: ["Eisenmangel (häufigste Ursache bei Frauen)", "Blutung oder hoher Blutverlust", "B12- oder Folsäure-Mangel"],
  },
  cortisol: {
    up: ["Chronischer psychischer Stress", "Schlafmangel", "Übermäßiger Sport", "Koffein (kurzfristig)"],
    down: ["Regelmäßige Entspannung & Meditation", "Ausreichend Schlaf", "Adaptogene (Ashwagandha)", "Moderate Bewegung"],
  },
};
