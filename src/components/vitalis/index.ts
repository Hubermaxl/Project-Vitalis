// ─── Vitalis Component Barrel ──────────────────────────────────────
// Zentraler Re-Export, damit Screens nur aus "@/components/vitalis"
// importieren müssen — nicht aus den einzelnen Dateien.

export * from "./tokens";
export { useDarkMode } from "./useDarkMode";
export { ScoreRing } from "./ScoreRing";
export { SparkLine } from "./SparkLine";
export { StatusBadge } from "./StatusBadge";
export { RangeBar } from "./RangeBar";
export { Pill } from "./Pill";
export { Button } from "./Button";
export { CategoryCard, type CategoryCardData, type PreviewMarker } from "./CategoryCard";
export { MobileDashboard } from "./MobileDashboard";
export { CategoryDetail } from "./CategoryDetail";
export { TrendChart } from "./TrendChart";
export { MarkerDetail } from "./MarkerDetail";
export { UploadFlow } from "./UploadFlow";
export { OnboardingAuth } from "./OnboardingAuth";
export { LandingPage } from "./LandingPage";
export { DesktopDashboard } from "./DesktopDashboard";
export { HistoryScreen } from "./HistoryScreen";
export * from "./adapters";
