/**
 * Vitalis — German strings (default locale).
 *
 * Pattern: nested objects, accessed via `t.section.key`.
 * Adding a new language: create a parallel file (e.g. en.ts) with the same shape.
 */
export const de = {
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schließen",
    back: "← Zurück",
    loading: "Laden…",
    confirm: "Bestätigen",
    yes: "Ja",
    no: "Nein",
    error: "Fehler",
    success: "Erfolg",
    optional: "Optional",
  },

  nav: {
    dashboard: "Dashboard",
    history: "Verlauf",
    profile: "Profil",
    logout: "Abmelden",
    menuOpen: "Menü öffnen",
    menuClose: "Menü schließen",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeToLight: "Zu hellem Modus wechseln",
    themeToDark: "Zu dunklem Modus wechseln",
  },

  status: {
    optimal: "Optimal",
    normal: "Normal",
    low: "Niedrig",
    high: "Hoch",
  },

  priority: {
    essential: "Wichtiger Marker",
    recommended: "Empfohlen",
  },

  toast: {
    welcome: "Willkommen bei Vitalis!",
    welcomeBack: "Willkommen zurück!",
    panelSaved: (n: number) => `Gespeichert — ${n} Marker erfasst`,
    panelUpdated: (n: number) => `Aktualisiert — ${n} Marker gespeichert`,
    panelDeleted: "Panel gelöscht",
    profileUpdated: "Profil aktualisiert",
    accountDeleted: "Dein Account und alle Daten wurden gelöscht.",
    linkCopied: "Link kopiert",
    linkRevoked: "Link widerrufen",
    csvDownloaded: "CSV heruntergeladen",
    jsonDownloaded: "JSON heruntergeladen",
    errEmailPwdMin: "Email & Passwort (min. 8 Zeichen) nötig",
    errEmailPwdEmpty: "Email & Passwort eingeben",
    errAcceptTerms: "Bitte AGB, Datenschutz & medizinischen Hinweis akzeptieren",
    errMinValue: "Mindestens einen Wert eingeben",
    errSavePrefix: "Fehler beim Speichern: ",
    errEditPrefix: "Fehler beim Aktualisieren: ",
    errDeletePrefix: "Fehler beim Löschen: ",
    errCopyManual: "Konnte Link nicht kopieren — bitte manuell markieren",
    errCopyShort: "Konnte Link nicht kopieren",
    errNotLoggedIn: "Nicht angemeldet",
    errUnknown: "Unbekannter Fehler",
    errNetwork: "Netzwerkfehler",
  },

  landing: {
    heroPrefix: "Nicht nur ob deine Werte ",
    heroQuote: "normal",
    heroMid: " sind — sondern ob sie ",
    heroEm: "optimal",
    heroSuffix: " für ein langes, gesundes Leben sind. Basierend auf Longevity-Medizin nach Dr. Peter Attia.",
    ctaPrimary: "Kostenlos starten",
    ctaSecondary: "Anmelden",
    privacyBannerTitle: "Datenschutz auf europäischem Niveau",
    privacyBannerText:
      "Deine Daten werden ausschließlich auf EU-Servern gespeichert — DSGVO-konform, ohne Weitergabe an Dritte. Kein US-Cloud-Anbieter, kein Tracking, keine Werbung.",
    privacyBannerLink: "Datenschutz lesen →",
    madeIn: "Gemacht in Österreich 🇦🇹",
  },

  auth: {
    signupTitle: "Konto erstellen",
    loginTitle: "Willkommen zurück",
    signupSubtitle: "Starte jetzt mit deinem persönlichen Longevity-Dashboard.",
    loginSubtitle: "Melde dich an.",
    name: "Name",
    namePlaceholder: "Dein Name",
    email: "Email",
    emailPlaceholder: "du@beispiel.com",
    password: "Passwort",
    passwordPlaceholder: "Min. 8 Zeichen",
    sex: "Biologisches Geschlecht",
    sexMale: "Männlich",
    sexFemale: "Weiblich",
    birthYear: "Geburtsjahr",
    sexAgeNote: "Geschlecht und Alter beeinflussen die Referenzwerte.",
    termsAcceptPrefix: "Ich akzeptiere die ",
    termsLink: "Nutzungsbedingungen",
    termsAcceptMid1: ", die ",
    privacyLink: "Datenschutzerklärung",
    termsAcceptMid2: " und den ",
    disclaimerLink: "medizinischen Hinweis",
    termsAcceptSuffix: ".",
    submitSignup: "Konto erstellen",
    submitLogin: "Anmelden",
    submitLoading: "Laden…",
    haveAccount: "Schon ein Konto? ",
    noAccount: "Noch kein Konto? ",
    switchToLogin: "Anmelden",
    switchToSignup: "Registrieren",
  },

  legalFooter: {
    impressum: "Impressum",
    agb: "AGB",
    privacy: "Datenschutz",
    disclaimer: "Medizinischer Hinweis",
  },

  share: {
    button: "📋 Mit Arzt teilen",
    modalTitleSelect: "Mit Arzt teilen",
    modalTitleLink: "Link erstellt ✓",
    introBefore: "Erzeuge einen sicheren Link zum Panel vom ",
    introAfter:
      ". Wer den Link bekommt, sieht alle Werte read-only — ohne sich registrieren zu müssen.",
    expiryLabel: "Gültigkeit",
    expiry7d: "7 Tage",
    expiry7dDesc: "Empfohlen für einen Arzttermin",
    expiry30d: "30 Tage",
    expiry30dDesc: "Falls der Termin später ist",
    expiryNever: "Kein Ablaufdatum",
    expiryNeverDesc: "Du kannst den Link jederzeit im Profil widerrufen",
    privacyHint:
      "💡 Wichtig: Der Empfänger sieht deinen Namen, das Datum, das Labor und alle Werte dieses Panels. Werte aus anderen Panels bleiben privat.",
    create: "Link erstellen",
    creating: "Erstelle…",
    linkIntro:
      "Sende diesen Link an deinen Arzt. Du kannst ihn jederzeit im Profil widerrufen.",
    copy: "Kopieren",
    finished: "Fertig",
    linkHint:
      "Der Link wurde verschlüsselt erzeugt — nur wer ihn kennt, kann das Panel sehen. Verwalte aktive Links unter Profil → Aktive Sharing-Links.",
    errCreatePrefix: "Fehler beim Erstellen: ",
    revokeConfirm:
      "Diesen Sharing-Link wirklich widerrufen? Der Empfänger kann das Panel danach nicht mehr sehen.",
    errRevokePrefix: "Fehler beim Widerrufen: ",
  },

  // Sections still inline in page.tsx (extract incrementally as needed):
  //   dashboard.*  — empty state, score block, sparklines headers
  //   panel.*      — add/edit/view screen labels, buttons
  //   history.*    — list & trends headers
  //   compare.*    — comparison screen headers, A/B labels
  //   markerDetail.* — section labels
  //   profile.*    — form labels, sections, danger zone
  //   legal.*      — Impressum, AGB, Disclaimer (long-form, country-specific)
  //
  // Pattern when extracting: copy the literal string to de.ts under a sensible
  // key, swap the JSX literal for `t.section.key`, repeat.
};
