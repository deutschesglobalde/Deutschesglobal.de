export const languages = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
} as const

export type Language = keyof typeof languages

export const currencies = {
  EUR: { symbol: "€", name: "Euro" },
  USD: { symbol: "$", name: "US Dollar" },
  GBP: { symbol: "£", name: "British Pound" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
} as const

export type Currency = keyof typeof currencies

export const translations = {
  en: {
    // Navigation
    home: "Home",
    services: "Services",
    about: "About",
    contact: "Contact",
    login: "Sign In",
    signup: "Open Account",
    dashboard: "Dashboard",
    admin: "Admin",

    // Landing Page
    heroTitle: "Professional Banking Excellence",
    heroSubtitle:
      "Experience the future of banking with Deutsche Global Bank. Secure, innovative, and globally trusted financial services.",
    openAccount: "Open Account",
    learnMore: "Learn More",

    // Services
    bankAccounts: "Bank Accounts",
    bankAccountsDesc: "Comprehensive banking solutions for individuals and businesses",
    savingsAccounts: "Savings Accounts",
    savingsAccountsDesc: "Grow your wealth with competitive interest rates",
    digitalBanking: "Digital Banking",
    digitalBankingDesc: "Modern banking at your fingertips",

    // Dashboard
    welcome: "Welcome back",
    overview: "Overview",
    transactions: "Transactions",
    transfer: "Transfer",
    profile: "Profile",
    settings: "Settings",
    signOut: "Sign Out",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    view: "View",
  },
  de: {
    // Navigation
    home: "Startseite",
    services: "Dienstleistungen",
    about: "Über uns",
    contact: "Kontakt",
    login: "Anmelden",
    signup: "Konto eröffnen",
    dashboard: "Dashboard",
    admin: "Admin",

    // Landing Page
    heroTitle: "Professionelle Banking-Exzellenz",
    heroSubtitle:
      "Erleben Sie die Zukunft des Bankwesens mit der Deutsche Global Bank. Sicher, innovativ und weltweit vertrauenswürdig.",
    openAccount: "Konto eröffnen",
    learnMore: "Mehr erfahren",

    // Services
    bankAccounts: "Bankkonten",
    bankAccountsDesc: "Umfassende Banking-Lösungen für Privatpersonen und Unternehmen",
    savingsAccounts: "Sparkonten",
    savingsAccountsDesc: "Lassen Sie Ihr Vermögen mit wettbewerbsfähigen Zinssätzen wachsen",
    digitalBanking: "Digital Banking",
    digitalBankingDesc: "Modernes Banking auf Knopfdruck",

    // Dashboard
    welcome: "Willkommen zurück",
    overview: "Übersicht",
    transactions: "Transaktionen",
    transfer: "Überweisung",
    profile: "Profil",
    settings: "Einstellungen",
    signOut: "Abmelden",

    // Common
    loading: "Wird geladen...",
    error: "Fehler",
    success: "Erfolgreich",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    view: "Anzeigen",
  },
} as const

export function detectLanguage(): Language {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("language") as Language
    if (stored && stored in languages) return stored

    const browserLang = navigator.language.split("-")[0] as Language
    if (browserLang in languages) return browserLang
  }
  return "de" // Default to German for Deutsche Bank
}

export function formatCurrency(amount: number, currency: Currency = "EUR", locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date, locale = "de-DE"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
