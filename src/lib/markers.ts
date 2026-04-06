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
}

export const BLOOD_MARKERS: BloodMarker[] = [
  { id: "hb", name: "Hemoglobin", name_de: "Hämoglobin", category: "Blutbild", unit: "g/dL", ref_min_m: 13.5, ref_max_m: 17.5, ref_min_f: 12.0, ref_max_f: 16.0, opt_min_m: 14.5, opt_max_m: 16.0, opt_min_f: 13.0, opt_max_f: 15.0, description: "Oxygen-carrying protein in red blood cells" },
  { id: "hct", name: "Hematocrit", name_de: "Hämatokrit", category: "Blutbild", unit: "%", ref_min_m: 40, ref_max_m: 54, ref_min_f: 36, ref_max_f: 48, opt_min_m: 42, opt_max_m: 48, opt_min_f: 38, opt_max_f: 44, description: "Percentage of blood volume occupied by red blood cells" },
  { id: "wbc", name: "White Blood Cells", name_de: "Leukozyten", category: "Blutbild", unit: "×10³/µL", ref_min_m: 4.0, ref_max_m: 11.0, ref_min_f: 4.0, ref_max_f: 11.0, opt_min_m: 4.5, opt_max_m: 7.5, opt_min_f: 4.5, opt_max_f: 7.5, description: "Immune system cells" },
  { id: "plt", name: "Platelets", name_de: "Thrombozyten", category: "Blutbild", unit: "×10³/µL", ref_min_m: 150, ref_max_m: 400, ref_min_f: 150, ref_max_f: 400, opt_min_m: 200, opt_max_m: 300, opt_min_f: 200, opt_max_f: 300, description: "Blood clotting cells" },
  { id: "glucose", name: "Fasting Glucose", name_de: "Nüchternglukose", category: "Stoffwechsel", unit: "mg/dL", ref_min_m: 70, ref_max_m: 100, ref_min_f: 70, ref_max_f: 100, opt_min_m: 72, opt_max_m: 90, opt_min_f: 72, opt_max_f: 90, description: "Blood sugar level" },
  { id: "hba1c", name: "HbA1c", name_de: "HbA1c", category: "Stoffwechsel", unit: "%", ref_min_m: 4.0, ref_max_m: 5.6, ref_min_f: 4.0, ref_max_f: 5.6, opt_min_m: 4.5, opt_max_m: 5.2, opt_min_f: 4.5, opt_max_f: 5.2, description: "3-month average blood sugar" },
  { id: "insulin", name: "Fasting Insulin", name_de: "Nüchterninsulin", category: "Stoffwechsel", unit: "µU/mL", ref_min_m: 2.0, ref_max_m: 25.0, ref_min_f: 2.0, ref_max_f: 25.0, opt_min_m: 2.0, opt_max_m: 8.0, opt_min_f: 2.0, opt_max_f: 8.0, description: "Insulin resistance marker" },
  { id: "chol_total", name: "Total Cholesterol", name_de: "Gesamtcholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 200, ref_min_f: 0, ref_max_f: 200, opt_min_m: 120, opt_max_m: 190, opt_min_f: 120, opt_max_f: 190, description: "Total blood cholesterol" },
  { id: "ldl", name: "LDL Cholesterol", name_de: "LDL-Cholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 130, ref_min_f: 0, ref_max_f: 130, opt_min_m: 40, opt_max_m: 100, opt_min_f: 40, opt_max_f: 100, description: "Cardiovascular risk factor" },
  { id: "hdl", name: "HDL Cholesterol", name_de: "HDL-Cholesterin", category: "Lipide", unit: "mg/dL", ref_min_m: 40, ref_max_m: 200, ref_min_f: 50, ref_max_f: 200, opt_min_m: 55, opt_max_m: 90, opt_min_f: 65, opt_max_f: 100, description: "Good cholesterol" },
  { id: "trig", name: "Triglycerides", name_de: "Triglyzeride", category: "Lipide", unit: "mg/dL", ref_min_m: 0, ref_max_m: 150, ref_min_f: 0, ref_max_f: 150, opt_min_m: 30, opt_max_m: 80, opt_min_f: 30, opt_max_f: 80, description: "Blood fats" },
  { id: "apob", name: "ApoB", name_de: "Apolipoprotein B", category: "Lipide", unit: "mg/dL", ref_min_m: 40, ref_max_m: 130, ref_min_f: 40, ref_max_f: 130, opt_min_m: 40, opt_max_m: 80, opt_min_f: 40, opt_max_f: 80, description: "Best cardiovascular risk predictor" },
  { id: "crp", name: "hs-CRP", name_de: "hs-CRP", category: "Entzündung", unit: "mg/L", ref_min_m: 0, ref_max_m: 5.0, ref_min_f: 0, ref_max_f: 5.0, opt_min_m: 0, opt_max_m: 1.0, opt_min_f: 0, opt_max_f: 1.0, description: "Inflammation marker" },
  { id: "ferritin", name: "Ferritin", name_de: "Ferritin", category: "Entzündung", unit: "ng/mL", ref_min_m: 30, ref_max_m: 400, ref_min_f: 15, ref_max_f: 200, opt_min_m: 40, opt_max_m: 150, opt_min_f: 30, opt_max_f: 100, description: "Iron storage protein" },
  { id: "homocysteine", name: "Homocysteine", name_de: "Homocystein", category: "Entzündung", unit: "µmol/L", ref_min_m: 5.0, ref_max_m: 15.0, ref_min_f: 5.0, ref_max_f: 15.0, opt_min_m: 5.0, opt_max_m: 9.0, opt_min_f: 5.0, opt_max_f: 9.0, description: "Cardiovascular risk marker" },
  { id: "tsh", name: "TSH", name_de: "TSH", category: "Schilddrüse", unit: "mU/L", ref_min_m: 0.4, ref_max_m: 4.0, ref_min_f: 0.4, ref_max_f: 4.0, opt_min_m: 1.0, opt_max_m: 2.5, opt_min_f: 1.0, opt_max_f: 2.5, description: "Thyroid-stimulating hormone" },
  { id: "ft3", name: "Free T3", name_de: "Freies T3", category: "Schilddrüse", unit: "pg/mL", ref_min_m: 2.0, ref_max_m: 4.4, ref_min_f: 2.0, ref_max_f: 4.4, opt_min_m: 2.8, opt_max_m: 3.8, opt_min_f: 2.8, opt_max_f: 3.8, description: "Active thyroid hormone" },
  { id: "ft4", name: "Free T4", name_de: "Freies T4", category: "Schilddrüse", unit: "ng/dL", ref_min_m: 0.8, ref_max_m: 1.8, ref_min_f: 0.8, ref_max_f: 1.8, opt_min_m: 1.0, opt_max_m: 1.5, opt_min_f: 1.0, opt_max_f: 1.5, description: "Thyroid hormone precursor" },
  { id: "alt", name: "ALT (GPT)", name_de: "GPT (ALT)", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 50, ref_min_f: 0, ref_max_f: 35, opt_min_m: 7, opt_max_m: 25, opt_min_f: 7, opt_max_f: 20, description: "Liver enzyme" },
  { id: "ast", name: "AST (GOT)", name_de: "GOT (AST)", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 50, ref_min_f: 0, ref_max_f: 35, opt_min_m: 10, opt_max_m: 25, opt_min_f: 10, opt_max_f: 20, description: "Liver/muscle enzyme" },
  { id: "ggt", name: "GGT", name_de: "Gamma-GT", category: "Leber", unit: "U/L", ref_min_m: 0, ref_max_m: 60, ref_min_f: 0, ref_max_f: 40, opt_min_m: 8, opt_max_m: 30, opt_min_f: 5, opt_max_f: 20, description: "Liver enzyme" },
  { id: "creatinine", name: "Creatinine", name_de: "Kreatinin", category: "Niere", unit: "mg/dL", ref_min_m: 0.7, ref_max_m: 1.3, ref_min_f: 0.5, ref_max_f: 1.1, opt_min_m: 0.8, opt_max_m: 1.1, opt_min_f: 0.6, opt_max_f: 0.9, description: "Kidney function marker" },
  { id: "egfr", name: "eGFR", name_de: "eGFR", category: "Niere", unit: "mL/min", ref_min_m: 90, ref_max_m: 200, ref_min_f: 90, ref_max_f: 200, opt_min_m: 100, opt_max_m: 150, opt_min_f: 100, opt_max_f: 150, description: "Kidney health indicator" },
  { id: "vitd", name: "Vitamin D (25-OH)", name_de: "Vitamin D", category: "Vitamine", unit: "ng/mL", ref_min_m: 30, ref_max_m: 100, ref_min_f: 30, ref_max_f: 100, opt_min_m: 50, opt_max_m: 80, opt_min_f: 50, opt_max_f: 80, description: "Immunity, bones, mood" },
  { id: "b12", name: "Vitamin B12", name_de: "Vitamin B12", category: "Vitamine", unit: "pg/mL", ref_min_m: 200, ref_max_m: 900, ref_min_f: 200, ref_max_f: 900, opt_min_m: 500, opt_max_m: 800, opt_min_f: 500, opt_max_f: 800, description: "Nerve function and energy" },
  { id: "folate", name: "Folate", name_de: "Folsäure", category: "Vitamine", unit: "ng/mL", ref_min_m: 3.0, ref_max_m: 20.0, ref_min_f: 3.0, ref_max_f: 20.0, opt_min_m: 10.0, opt_max_m: 20.0, opt_min_f: 10.0, opt_max_f: 20.0, description: "DNA repair vitamin" },
  { id: "iron", name: "Serum Iron", name_de: "Eisen", category: "Vitamine", unit: "µg/dL", ref_min_m: 60, ref_max_m: 170, ref_min_f: 50, ref_max_f: 170, opt_min_m: 80, opt_max_m: 140, opt_min_f: 70, opt_max_f: 130, description: "Available iron in blood" },
  { id: "magnesium", name: "Magnesium", name_de: "Magnesium", category: "Vitamine", unit: "mg/dL", ref_min_m: 1.7, ref_max_m: 2.2, ref_min_f: 1.7, ref_max_f: 2.2, opt_min_m: 2.0, opt_max_m: 2.2, opt_min_f: 2.0, opt_max_f: 2.2, description: "300+ enzymatic reactions" },
];

export const CATEGORIES = [...new Set(BLOOD_MARKERS.map(m => m.category))];

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
