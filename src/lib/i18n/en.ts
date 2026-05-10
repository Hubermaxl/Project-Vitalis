import type { de } from "./de";

/**
 * English locale — skeleton.
 *
 * Status: not yet translated. Currently mirrors the German object so the
 * shape is type-safe; replace each value with the English translation when
 * ready, and wire up via lib/i18n.ts.
 *
 * Why a skeleton instead of a partial dict: TypeScript will fail-loudly if
 * any key is missing once we switch the active locale, preventing silent
 * fallbacks to the wrong language.
 */
export const en: typeof de = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    back: "← Back",
    loading: "Loading…",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    error: "Error",
    success: "Success",
    optional: "Optional",
  },

  nav: {
    dashboard: "Dashboard",
    history: "History",
    profile: "Profile",
    logout: "Sign out",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    themeLight: "Light",
    themeDark: "Dark",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
  },

  status: {
    optimal: "Optimal",
    normal: "Normal",
    low: "Low",
    high: "High",
  },

  priority: {
    essential: "Essential marker",
    recommended: "Recommended",
  },

  toast: {
    welcome: "Welcome to Vitalis!",
    welcomeBack: "Welcome back!",
    panelSaved: (n: number) => `Saved — ${n} markers recorded`,
    panelUpdated: (n: number) => `Updated — ${n} markers saved`,
    panelDeleted: "Panel deleted",
    profileUpdated: "Profile updated",
    accountDeleted: "Your account and all data have been deleted.",
    linkCopied: "Link copied",
    linkRevoked: "Link revoked",
    csvDownloaded: "CSV downloaded",
    jsonDownloaded: "JSON downloaded",
    errEmailPwdMin: "Email & password (min. 8 characters) required",
    errEmailPwdEmpty: "Enter email & password",
    errAcceptTerms: "Please accept Terms, Privacy Policy & Medical Notice",
    errMinValue: "Enter at least one value",
    errSavePrefix: "Save failed: ",
    errEditPrefix: "Update failed: ",
    errDeletePrefix: "Delete failed: ",
    errCopyManual: "Could not copy link — please select manually",
    errCopyShort: "Could not copy link",
    errNotLoggedIn: "Not signed in",
    errUnknown: "Unknown error",
    errNetwork: "Network error",
  },

  landing: {
    heroPrefix: "Not just whether your values are ",
    heroQuote: "normal",
    heroMid: " — but whether they are ",
    heroEm: "optimal",
    heroSuffix:
      " for a long, healthy life. Based on longevity medicine after Dr. Peter Attia.",
    ctaPrimary: "Get started — free",
    ctaSecondary: "Sign in",
    privacyBannerTitle: "European-grade privacy",
    privacyBannerText:
      "Your data is stored exclusively on EU servers — GDPR-compliant, never shared with third parties. No US cloud provider, no tracking, no ads.",
    privacyBannerLink: "Read privacy policy →",
    madeIn: "Made in Austria 🇦🇹",
  },

  auth: {
    signupTitle: "Create account",
    loginTitle: "Welcome back",
    signupSubtitle: "Start your personal longevity dashboard now.",
    loginSubtitle: "Sign in to continue.",
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Min. 8 characters",
    sex: "Biological sex",
    sexMale: "Male",
    sexFemale: "Female",
    birthYear: "Birth year",
    sexAgeNote: "Sex and age affect the reference ranges.",
    termsAcceptPrefix: "I accept the ",
    termsLink: "Terms of Service",
    termsAcceptMid1: ", the ",
    privacyLink: "Privacy Policy",
    termsAcceptMid2: " and the ",
    disclaimerLink: "Medical Notice",
    termsAcceptSuffix: ".",
    submitSignup: "Create account",
    submitLogin: "Sign in",
    submitLoading: "Loading…",
    haveAccount: "Already have an account? ",
    noAccount: "No account yet? ",
    switchToLogin: "Sign in",
    switchToSignup: "Sign up",
  },

  legalFooter: {
    impressum: "Imprint",
    agb: "Terms",
    privacy: "Privacy",
    disclaimer: "Medical Notice",
  },

  share: {
    button: "📋 Share with doctor",
    modalTitleSelect: "Share with doctor",
    modalTitleLink: "Link created ✓",
    introBefore: "Create a secure link to the panel from ",
    introAfter:
      ". Whoever receives the link sees all values read-only — no signup required.",
    expiryLabel: "Validity",
    expiry7d: "7 days",
    expiry7dDesc: "Recommended for a doctor's appointment",
    expiry30d: "30 days",
    expiry30dDesc: "If the appointment is further out",
    expiryNever: "No expiration",
    expiryNeverDesc: "You can revoke the link any time from your profile",
    privacyHint:
      "💡 Note: The recipient sees your name, the date, the lab and all values of this panel. Values from other panels stay private.",
    create: "Create link",
    creating: "Creating…",
    linkIntro:
      "Send this link to your doctor. You can revoke it any time from your profile.",
    copy: "Copy",
    finished: "Done",
    linkHint:
      "The link was generated with strong randomness — only those who know it can see the panel. Manage active links under Profile → Active sharing links.",
    errCreatePrefix: "Create failed: ",
    revokeConfirm:
      "Really revoke this sharing link? The recipient won't be able to see the panel afterwards.",
    errRevokePrefix: "Revoke failed: ",
  },
};
