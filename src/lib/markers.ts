export interface BloodMarker {
  id: string;
  name: string;
  name_de: string;
  category: string;
  unit: string;
  ref_min_m: number; ref_max_m: number;
  ref_min_f: number; ref_max_f: number;
  opt_min_m: number; opt_max_m: number;
  opt_min_f: number; opt_max_f: number;
  description: string;
  description_de: string;
  priority: "essential" | "recommended" | "extended";
  longevity_note?: string;
}

export const BLOOD_MARKERS: BloodMarker[] = [
  // ── BLUTBILD ────────────────────────────────────────────
  { id: "hb", name: "Hemoglobin", name_de: "Hämoglobin", category: "Blutbild", unit: "g/dL", ref_min_m: 13.5, ref_max_m: 17.5, ref_min_f: 12.0, ref_max_f: 16.0, opt_min_m: 14.5, opt_max_m: 16.0, opt_min_f: 13.0, opt_max_f: 15.0, description: "Oxygen-carrying protein", description_de: "Sauerstofftransport-Protein", priority: "essential" },
  { id: "hct", name: "Hematocrit", name_de: "Hämatokrit", category: "Blutbild", unit: "%", ref_min_m: 40, ref_max_m: 54, ref_min_f: 36, ref_max_f: 48, opt_min_m: 42, opt_max_m: 48, opt_min_f: 38, opt_max_f: 44, description: "Red blood cell volume", description_de: "Anteil roter Blutkörperchen", priority: "recommended" },
  { id: "wbc", name: "White Blood Cells", name_de: "Leukozyten", category: "Blutbild", unit: "×10³/µL", ref_min_m: 4.0, ref_max_m: 11.0, ref_min_f: 4.0, ref_max_f: 11.0, opt_min_m: 4.5, opt_max_m: 7.5, opt_min_f: 4.5, opt_max_f: 7.5, description: "Immune cells", description_de: "Immunzellen", priority: "essential", longevity_note: "Chronisch erhöhte Werte deuten auf stille Entzündung hin — ein zentraler Alterungstreiber." },
  { id: "plt", name: "Platelets", name_de: "Thrombozyten", category: "Blutbild", unit: "×10³/µL", ref_min_m: 150, ref_max_m: 400, ref_min_f: 150, ref_max_f: 400, opt_min_m: 200, opt_max_m: 300, opt_min_f: 200, opt_max_f: 300, description: "Blood clotting cells", description_de: "Blutgerinnungszellen", priority: "recommended" },

  // ── STOFFWECHSEL ────────────────────────────────────────
  { id: "glucose", name: "Fasting Glucose", name_de: "Nüchternglukose", category: "Stoffwechsel", unit: "mg/dL", ref_min_m: 70, ref_max_m: 100, ref_min_f: 70, ref_max_f: 100, opt_min_m: 72, opt_max_m: 90, opt_min_f: 72, opt_max_f: 90, description: "Blood sugar level", description_de: "Blutzuckerspiegel", priority: "essential", longevity_note: "Nüchternwerte über 90 mg/dL erhöhen das Risiko für Typ-2-Diabetes erheblich — auch wenn sie noch 'normal' sind." },
  { id: "hba1c", name: "HbA1c", name_de: "HbA1c", category: "Stoffwechsel", unit: "%", ref_min_m: 4.0, ref_max_m: 5.6, ref_min_f: 4.0, ref_max_f: 5.6, opt_min_m: 4.5, opt_max_m: 5.2, opt_min_f: 4.5, opt_max_f: 5.2, description: "3-month blood sugar average", description_de: "3-Monats-Blutzucker-Durchschnitt", priority: "essential", longevity_note: "Gold-Standard für metabolische Gesundheit. Werte über 5.4% verdienen Aufmerksamkeit." },
  { id: "insulin", name: "Fasting Insulin", name_de: "Nüchterninsulin", category: "Stoffwechsel", unit: "µU/mL", ref_min_m: 2.0, ref_max_m: 25.0, ref_min_f: 2.0, ref_max_f: 25.0, opt_min_m: 2.0, opt_max_m: 8.0, opt_min_f: 2.0, opt_max_f: 8.0, description: "Insulin resistance marker", description_de: "Insulinresistenz-Marker", priority: "essential", longevity_note: "Einer der frühesten Indikatoren für metabolische Probleme — Jahre bevor Glukose ansteigt." },
  { id: "homa_ir", name: "HOMA-IR", name_de: "HOMA-IR", category: "Stoffwechsel", unit: "Index", ref_min_m: 0, ref_max_m: 2.5, ref_min_f: 0, ref_max_f: 2.5, opt_min_m: 0.3, opt_max_m: 1.5, opt_min_f: 0.3, opt_max_f: 1.5, description: "Insulin resistance index", description_de: "Insulinresistenz-Index", priority: "recommended", longevity_note: "Berechnet aus Nüchternglukose × Nüchterninsulin / 405. Bester Einzelwert für Insulinresistenz." },
  { id: "uric_acid", name: "Uric Acid", name_de: "Harnsäure", category: "Stoffwechsel", unit: "mg/dL", ref_min_m: 3.5, ref_max_m: 7.2, ref_min_f: 2.6, ref_max_f: 6.0, opt_min_m: 3.5, opt_max_m: 5.5, opt_min_f: 2.6, opt_max_f: 5.0, description: "Metabolic waste product", description_de: "Stoffwechsel-Endprodukt", priority: "recommended", longevity_note: "Erhöhte Werte korrelieren mit Gicht, Herz-Kreislauf-Erkrankungen und metabolischem Syndrom." },

  // ── LIPIDE ──────────────────────────────────────────────
  { id: "chol_total", name: "Total Cholesterol", name_de: "Gesamtcholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 200, ref_min_f: 0, ref_max_f: 200, opt_min_m: 120, opt_max_m: 190, opt_min_f: 120, opt_max_f: 190, description: "Total cholesterol", description_de: "Gesamtcholesterin", priority: "essential" },
  { id: "ldl", name: "LDL Cholesterol", name_de: "LDL-Cholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 130, ref_min_f: 0, ref_max_f: 130, opt_min_m: 40, opt_max_m: 100, opt_min_f: 40, opt_max_f: 100, description: "Bad cholesterol", description_de: "Schlechtes Cholesterin", priority: "essential", longevity_note: "Für maximalen kardiovaskulären Schutz empfehlen Longevity-Mediziner Werte unter 100, idealerweise unter 70 mg/dL." },
  { id: "hdl", name: "HDL Cholesterol", name_de: "HDL-Cholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 40, ref_max_m: 200, ref_min_f: 50, ref_max_f: 200, opt_min_m: 55, opt_max_m: 90, opt_min_f: 65, opt_max_f: 100, description: "Good cholesterol", description_de: "Gutes Cholesterin", priority: "essential" },
  { id: "trig", name: "Triglycerides", name_de: "Triglyzeride", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 150, ref_min_f: 0, ref_max_f: 150, opt_min_m: 30, opt_max_m: 80, opt_min_f: 30, opt_max_f: 80, description: "Blood fats", description_de: "Blutfette", priority: "essential", longevity_note: "Triglyzeride/HDL-Ratio unter 1.5 ist ein starker Marker für metabolische Gesundheit." },
  { id: "apob", name: "ApoB", name_de: "Apolipoprotein B", category: "Lipide", unit: "mg/dL", ref_min_m: 40, ref_max_m: 130, ref_min_f: 40, ref_max_f: 130, opt_min_m: 40, opt_max_m: 80, opt_min_f: 40, opt_max_f: 80, description: "Best CV risk predictor", description_de: "Bester Herz-Kreislauf-Risikomarker", priority: "essential", longevity_note: "Der aussagekräftigste Einzelmarker für kardiovaskuläres Risiko — besser als LDL allein." },
  { id: "lpa", name: "Lp(a)", name_de: "Lipoprotein(a)", category: "Lipide", unit: "nmol/L", ref_min_m: 0, ref_max_m: 75, ref_min_f: 0, ref_max_f: 75, opt_min_m: 0, opt_max_m: 30, opt_min_f: 0, opt_max_f: 30, description: "Genetic CV risk factor", description_de: "Genetischer Risikofaktor", priority: "recommended", longevity_note: "Genetisch determiniert, nicht durch Lifestyle änderbar. Einmal messen reicht — bei erhöhten Werten: aggressivere ApoB-Senkung." },

  // ── ENTZÜNDUNG ──────────────────────────────────────────
  { id: "crp", name: "hs-CRP", name_de: "hs-CRP", category: "Entzündung", unit: "mg/L", ref_min_m: 0, ref_max_m: 5.0, ref_min_f: 0, ref_max_f: 5.0, opt_min_m: 0, opt_max_m: 1.0, opt_min_f: 0, opt_max_f: 1.0, description: "Inflammation marker", description_de: "Entzündungsmarker", priority: "essential", longevity_note: "Der wichtigste Entzündungsmarker. Chronische Werte über 1.0 verdoppeln das Herzinfarkt-Risiko." },
  { id: "ferritin", name: "Ferritin", name_de: "Ferritin", category: "Entzündung", unit: "ng/mL", ref_min_m: 30, ref_max_m: 400, ref_min_f: 15, ref_max_f: 200, opt_min_m: 40, opt_max_m: 150, opt_min_f: 30, opt_max_f: 100, description: "Iron storage & inflammation", description_de: "Eisenspeicher & Entzündungsmarker", priority: "essential", longevity_note: "Zu hoch = Entzündung oder Eisenüberladung. Zu niedrig = Müdigkeit. Für Longevity: Mitte des Referenzbereichs anpeilen." },
  { id: "homocysteine", name: "Homocysteine", name_de: "Homocystein", category: "Entzündung", unit: "µmol/L", ref_min_m: 5.0, ref_max_m: 15.0, ref_min_f: 5.0, ref_max_f: 15.0, opt_min_m: 5.0, opt_max_m: 9.0, opt_min_f: 5.0, opt_max_f: 9.0, description: "CV & cognitive risk", description_de: "Herz-Kreislauf & Kognitions-Risiko", priority: "recommended", longevity_note: "Erhöht durch B12/Folat-Mangel. Einfach zu senken, wichtig für Gefäß- und Gehirngesundheit." },
  { id: "esr", name: "ESR", name_de: "BSG (Blutsenkung)", category: "Entzündung", unit: "mm/h", ref_min_m: 0, ref_max_m: 20, ref_min_f: 0, ref_max_f: 30, opt_min_m: 0, opt_max_m: 10, opt_min_f: 0, opt_max_f: 15, description: "Sedimentation rate", description_de: "Blutsenkungsgeschwindigkeit", priority: "extended" },

  // ── SCHILDDRÜSE ─────────────────────────────────────────
  { id: "tsh", name: "TSH", name_de: "TSH", category: "Schilddrüse", unit: "mU/L", ref_min_m: 0.4, ref_max_m: 4.0, ref_min_f: 0.4, ref_max_f: 4.0, opt_min_m: 1.0, opt_max_m: 2.5, opt_min_f: 1.0, opt_max_f: 2.5, description: "Thyroid control hormone", description_de: "Schilddrüsen-Steuerhormon", priority: "essential", longevity_note: "Werte über 2.5 können subklinische Unterfunktion anzeigen — auch wenn sie 'normal' sind." },
  { id: "ft3", name: "Free T3", name_de: "Freies T3", category: "Schilddrüse", unit: "pg/mL", ref_min_m: 2.0, ref_max_m: 4.4, ref_min_f: 2.0, ref_max_f: 4.4, opt_min_m: 2.8, opt_max_m: 3.8, opt_min_f: 2.8, opt_max_f: 3.8, description: "Active thyroid hormone", description_de: "Aktives Schilddrüsenhormon", priority: "recommended" },
  { id: "ft4", name: "Free T4", name_de: "Freies T4", category: "Schilddrüse", unit: "ng/dL", ref_min_m: 0.8, ref_max_m: 1.8, ref_min_f: 0.8, ref_max_f: 1.8, opt_min_m: 1.0, opt_max_m: 1.5, opt_min_f: 1.0, opt_max_f: 1.5, description: "Thyroid hormone precursor", description_de: "Schilddrüsenhormon-Vorstufe", priority: "recommended" },

  // ── LEBER ───────────────────────────────────────────────
  { id: "alt", name: "ALT (GPT)", name_de: "GPT (ALT)", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 50, ref_min_f: 0, ref_max_f: 35, opt_min_m: 7, opt_max_m: 25, opt_min_f: 7, opt_max_f: 20, description: "Liver enzyme", description_de: "Leberenzym", priority: "essential", longevity_note: "Empfindlichster Marker für Leberstress. Optimal unter 25 — schon 'normale' Werte um 40 können auf Fettleber hindeuten." },
  { id: "ast", name: "AST (GOT)", name_de: "GOT (AST)", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 50, ref_min_f: 0, ref_max_f: 35, opt_min_m: 10, opt_max_m: 25, opt_min_f: 10, opt_max_f: 20, description: "Liver/muscle enzyme", description_de: "Leber-/Muskelenzym", priority: "recommended" },
  { id: "ggt", name: "GGT", name_de: "Gamma-GT", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 60, ref_min_f: 0, ref_max_f: 40, opt_min_m: 8, opt_max_m: 30, opt_min_f: 5, opt_max_f: 20, description: "Alcohol & metabolic stress", description_de: "Alkohol- & Stoffwechselstress", priority: "essential", longevity_note: "Sehr sensitiv für Alkohol, Medikamente und metabolischen Stress. Auch ein unabhängiger Prädiktor für Herz-Kreislauf-Erkrankungen." },
  { id: "alp", name: "ALP", name_de: "Alkalische Phosphatase", category: "Leber", unit: "U/L", ref_min_m: 40, ref_max_m: 130, ref_min_f: 35, ref_max_f: 105, opt_min_m: 40, opt_max_m: 100, opt_min_f: 35, opt_max_f: 85, description: "Bone & liver enzyme", description_de: "Knochen- & Leberenzym", priority: "extended" },

  // ── NIERE ───────────────────────────────────────────────
  { id: "creatinine", name: "Creatinine", name_de: "Kreatinin", category: "Niere", unit: "mg/dL", ref_min_m: 0.7, ref_max_m: 1.3, ref_min_f: 0.5, ref_max_f: 1.1, opt_min_m: 0.8, opt_max_m: 1.1, opt_min_f: 0.6, opt_max_f: 0.9, description: "Kidney function", description_de: "Nierenfunktion", priority: "essential" },
  { id: "egfr", name: "eGFR", name_de: "eGFR", category: "Niere", unit: "mL/min", ref_min_m: 90, ref_max_m: 200, ref_min_f: 90, ref_max_f: 200, opt_min_m: 100, opt_max_m: 150, opt_min_f: 100, opt_max_f: 150, description: "Kidney filtration rate", description_de: "Nieren-Filtrationsrate", priority: "essential", longevity_note: "Die eGFR sinkt natürlich mit dem Alter. Werte unter 90 verdienen Aufmerksamkeit, unter 60 ist klinisch relevant." },
  { id: "cystatin_c", name: "Cystatin C", name_de: "Cystatin C", category: "Niere", unit: "mg/L", ref_min_m: 0.56, ref_max_m: 0.98, ref_min_f: 0.56, ref_max_f: 0.98, opt_min_m: 0.56, opt_max_m: 0.82, opt_min_f: 0.56, opt_max_f: 0.82, description: "Precise kidney marker", description_de: "Präziser Nierenmarker", priority: "recommended", longevity_note: "Genauer als Kreatinin, da unabhängig von Muskelmasse. Auch ein unabhängiger Sterblichkeits-Prädiktor." },
  { id: "bun", name: "BUN", name_de: "Harnstoff", category: "Niere", unit: "mg/dL", ref_min_m: 7, ref_max_m: 20, ref_min_f: 7, ref_max_f: 20, opt_min_m: 8, opt_max_m: 18, opt_min_f: 8, opt_max_f: 18, description: "Protein metabolism waste", description_de: "Eiweißstoffwechsel-Abfallprodukt", priority: "extended" },

  // ── VITAMINE & MINERALE ─────────────────────────────────
  { id: "vitd", name: "Vitamin D (25-OH)", name_de: "Vitamin D", category: "Vitamine & Minerale", unit: "ng/mL", ref_min_m: 30, ref_max_m: 100, ref_min_f: 30, ref_max_f: 100, opt_min_m: 50, opt_max_m: 80, opt_min_f: 50, opt_max_f: 80, description: "Immunity, bones, mood", description_de: "Immunsystem, Knochen, Stimmung", priority: "essential", longevity_note: "Die meisten Österreicher sind mangelhaft, besonders im Winter. Zielwert 50-80 ng/mL — nicht nur 'über 30'." },
  { id: "b12", name: "Vitamin B12", name_de: "Vitamin B12", category: "Vitamine & Minerale", unit: "pg/mL", ref_min_m: 200, ref_max_m: 900, ref_min_f: 200, ref_max_f: 900, opt_min_m: 500, opt_max_m: 800, opt_min_f: 500, opt_max_f: 800, description: "Nerve & energy", description_de: "Nerven & Energie", priority: "essential", longevity_note: "Werte um 200-300 sind technisch 'normal' aber funktionell oft zu niedrig. Optimal: oberes Drittel." },
  { id: "folate", name: "Folate", name_de: "Folsäure", category: "Vitamine & Minerale", unit: "ng/mL", ref_min_m: 3.0, ref_max_m: 20.0, ref_min_f: 3.0, ref_max_f: 20.0, opt_min_m: 10.0, opt_max_m: 20.0, opt_min_f: 10.0, opt_max_f: 20.0, description: "DNA repair vitamin", description_de: "DNA-Reparatur-Vitamin", priority: "recommended" },
  { id: "iron", name: "Serum Iron", name_de: "Eisen", category: "Vitamine & Minerale", unit: "µg/dL", ref_min_m: 60, ref_max_m: 170, ref_min_f: 50, ref_max_f: 170, opt_min_m: 80, opt_max_m: 140, opt_min_f: 70, opt_max_f: 130, description: "Available iron", description_de: "Verfügbares Eisen", priority: "recommended" },
  { id: "magnesium", name: "Magnesium", name_de: "Magnesium", category: "Vitamine & Minerale", unit: "mg/dL", ref_min_m: 1.7, ref_max_m: 2.2, ref_min_f: 1.7, ref_max_f: 2.2, opt_min_m: 2.0, opt_max_m: 2.2, opt_min_f: 2.0, opt_max_f: 2.2, description: "300+ enzyme reactions", description_de: "300+ Enzymreaktionen", priority: "recommended", longevity_note: "Serum-Magnesium zeigt nur 1% der Gesamtspeicher. Selbst 'normale' Werte können Mangel verbergen." },
  { id: "zinc", name: "Zinc", name_de: "Zink", category: "Vitamine & Minerale", unit: "µg/dL", ref_min_m: 60, ref_max_m: 120, ref_min_f: 60, ref_max_f: 120, opt_min_m: 80, opt_max_m: 110, opt_min_f: 80, opt_max_f: 110, description: "Immune & hormone mineral", description_de: "Immun- & Hormon-Mineral", priority: "extended" },
  { id: "omega3_index", name: "Omega-3 Index", name_de: "Omega-3-Index", category: "Vitamine & Minerale", unit: "%", ref_min_m: 4.0, ref_max_m: 20.0, ref_min_f: 4.0, ref_max_f: 20.0, opt_min_m: 8.0, opt_max_m: 12.0, opt_min_f: 8.0, opt_max_f: 12.0, description: "EPA+DHA in red blood cells", description_de: "EPA+DHA in roten Blutkörperchen", priority: "recommended", longevity_note: "Omega-3-Index über 8% ist mit 33% niedrigerem Herztod-Risiko assoziiert. Meisten Menschen liegen bei 4-5%." },

  // ── HORMONE ─────────────────────────────────────────────
  { id: "testosterone_total", name: "Total Testosterone", name_de: "Testosteron (gesamt)", category: "Hormone", unit: "ng/dL", ref_min_m: 280, ref_max_m: 800, ref_min_f: 15, ref_max_f: 70, opt_min_m: 500, opt_max_m: 800, opt_min_f: 25, opt_max_f: 60, description: "Primary male hormone", description_de: "Primäres männliches Hormon", priority: "recommended", longevity_note: "Bei Männern sinkt Testosteron ab 30 um ~1% pro Jahr. Werte unter 400 ng/dL verdienen Aufmerksamkeit." },
  { id: "dhea_s", name: "DHEA-S", name_de: "DHEA-S", category: "Hormone", unit: "µg/dL", ref_min_m: 80, ref_max_m: 560, ref_min_f: 35, ref_max_f: 430, opt_min_m: 200, opt_max_m: 400, opt_min_f: 100, opt_max_f: 300, description: "Anti-aging hormone", description_de: "Anti-Aging-Hormon", priority: "extended", longevity_note: "DHEA-S sinkt mit dem Alter stärker als jedes andere Hormon. Niedrige Werte korrelieren mit beschleunigter Alterung." },
  { id: "cortisol", name: "Cortisol (morning)", name_de: "Cortisol (morgens)", category: "Hormone", unit: "µg/dL", ref_min_m: 6.0, ref_max_m: 18.0, ref_min_f: 6.0, ref_max_f: 18.0, opt_min_m: 8.0, opt_max_m: 15.0, opt_min_f: 8.0, opt_max_f: 15.0, description: "Stress hormone", description_de: "Stresshormon", priority: "extended" },
  { id: "igf1", name: "IGF-1", name_de: "IGF-1", category: "Hormone", unit: "ng/mL", ref_min_m: 100, ref_max_m: 350, ref_min_f: 100, ref_max_f: 350, opt_min_m: 120, opt_max_m: 200, opt_min_f: 120, opt_max_f: 200, description: "Growth factor", description_de: "Wachstumsfaktor", priority: "extended", longevity_note: "Kontrovers: Zu hoch = erhöhtes Krebsrisiko. Zu niedrig = Muskelverlust. Moderate Werte scheinen optimal für Langlebigkeit." },

  // ── WEITERE ─────────────────────────────────────────────
  { id: "albumin", name: "Albumin", name_de: "Albumin", category: "Weitere", unit: "g/dL", ref_min_m: 3.5, ref_max_m: 5.5, ref_min_f: 3.5, ref_max_f: 5.5, opt_min_m: 4.2, opt_max_m: 5.0, opt_min_f: 4.2, opt_max_f: 5.0, description: "Nutritional & liver status", description_de: "Ernährungs- & Leberstatus", priority: "extended", longevity_note: "Niedriges Albumin ist einer der stärksten Prädiktoren für Gesamtsterblichkeit bei Älteren." },
  { id: "ldh", name: "LDH", name_de: "LDH", category: "Weitere", unit: "U/L", ref_min_m: 120, ref_max_m: 246, ref_min_f: 120, ref_max_f: 246, opt_min_m: 120, opt_max_m: 200, opt_min_f: 120, opt_max_f: 200, description: "Tissue damage marker", description_de: "Gewebeschadens-Marker", priority: "extended" },
];

export const CATEGORIES = Array.from(new Set(BLOOD_MARKERS.map(m => m.category)));

export const CATEGORY_ORDER = ["Blutbild", "Stoffwechsel", "Lipide", "Entzündung", "Schilddrüse", "Leber", "Niere", "Vitamine & Minerale", "Hormone", "Weitere"];

export interface StatusInfo {
  status: "optimal" | "normal" | "low" | "high";
  label: string;
  color: string;
}

export function getStatus(value: number, marker: BloodMarker, sex: string): StatusInfo {
  const s = sex === "female" ? "f" : "m";
  const refMin = marker[`ref_min_${s}` as keyof BloodMarker] as number;
  const refMax = marker[`ref_max_${s}` as keyof BloodMarker] as number;
  const optMin = marker[`opt_min_${s}` as keyof BloodMarker] as number;
  const optMax = marker[`opt_max_${s}` as keyof BloodMarker] as number;
  if (value < refMin) return { status: "low", label: "Niedrig", color: "#dc2626" };
  if (value > refMax) return { status: "high", label: "Hoch", color: "#dc2626" };
  if (value >= optMin && value <= optMax) return { status: "optimal", label: "Optimal", color: "#059669" };
  return { status: "normal", label: "Normal", color: "#d97706" };
}

export function getMarkersByPriority(priority: string) {
  return BLOOD_MARKERS.filter(m => m.priority === priority);
}

export function getSortedCategories() {
  return CATEGORY_ORDER.filter(c => BLOOD_MARKERS.some(m => m.category === c));
}
