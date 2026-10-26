/**
 * Testi dell'interfaccia della guida pubblica nelle 5 lingue supportate e
 * funzioni per scegliere la lingua e localizzare i contenuti.
 */

import { LINGUE, type CategoriaLuogo, type Lingua, type TipoSezione } from "@/types/guide";

export const NOMI_LINGUE: Record<Lingua, string> = {
  it: "Italiano",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
};

export const BANDIERE: Record<Lingua, string> = { it: "🇮🇹", en: "🇬🇧", fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸" };

export interface Dizionario {
  sezioni: Record<TipoSezione, string>;
  categorie: Record<CategoriaLuogo, string>;
  chiama: string;
  whatsapp: string;
  indicazioni: string;
  wifi: string;
  copia: string;
  copiato: string;
  rete: string;
  password: string;
  apriMappa: string;
  orarioCheckin: string;
  orarioCheckout: string;
  checklist: string;
  cosaSi: string;
  cosaNo: string;
  quando: string;
  doveConferire: string;
  /** Etichetta del contenitore; {colore} viene sostituito dal nome del colore. */
  contenitore: string;
  codiceCin: string;
  importo: string;
  esenzioni: string;
  pagamento: string;
  ztlAttenzione: string;
  mezziPubblici: string;
  parcheggio: string;
  guardiaMedica: string;
  farmaciaTurno: string;
  ospedale: string;
  contattoHost: string;
  indice: string;
  lingua: string;
  anteprima: string;
  anteprimaTesto: string;
  creatoCon: string;
  tornaSu: string;
  ciao: string;
}

const it: Dizionario = {
  sezioni: {
    benvenuto: "Benvenuti",
    arrivo: "Arrivo e check-in",
    wifi: "Wi-Fi",
    casa: "La casa",
    regole: "Regole della casa",
    differenziata: "Raccolta differenziata",
    tassa: "Tassa di soggiorno",
    parcheggio: "Parcheggio e ZTL",
    consigli: "Consigli locali",
    emergenze: "Emergenze",
    checkout: "Check-out",
  },
  categorie: {
    ristorante: "Ristoranti",
    bar: "Bar e caffè",
    supermercato: "Supermercati",
    farmacia: "Farmacie",
    attrazione: "Da vedere",
    altro: "Altro",
  },
  chiama: "Chiama",
  whatsapp: "WhatsApp",
  indicazioni: "Indicazioni",
  wifi: "Wi-Fi",
  copia: "Copia",
  copiato: "Copiato!",
  rete: "Rete",
  password: "Password",
  apriMappa: "Apri in Google Maps",
  orarioCheckin: "Orario di arrivo",
  orarioCheckout: "Orario di partenza",
  checklist: "Prima di partire",
  cosaSi: "Sì",
  cosaNo: "No",
  quando: "Quando",
  doveConferire: "Dove buttare i rifiuti",
  contenitore: "contenitore {colore}",
  codiceCin: "Codice CIN",
  importo: "Importo",
  esenzioni: "Esenzioni",
  pagamento: "Come pagare",
  ztlAttenzione: "Attenzione: Zona a Traffico Limitato (ZTL)",
  mezziPubblici: "Mezzi pubblici",
  parcheggio: "Dove parcheggiare",
  guardiaMedica: "Guardia medica",
  farmaciaTurno: "Farmacia di turno",
  ospedale: "Ospedale",
  contattoHost: "Il vostro host",
  indice: "In questa guida",
  lingua: "Lingua",
  anteprima: "Anteprima",
  anteprimaTesto: "Questa guida non è ancora pubblicata: la vedi solo tu.",
  creatoCon: "Guida creata con",
  tornaSu: "Torna su",
  ciao: "Ciao",
};

const en: Dizionario = {
  sezioni: {
    benvenuto: "Welcome",
    arrivo: "Arrival & check-in",
    wifi: "Wi-Fi",
    casa: "The house",
    regole: "House rules",
    differenziata: "Recycling",
    tassa: "Tourist tax",
    parcheggio: "Parking & ZTL",
    consigli: "Local tips",
    emergenze: "Emergencies",
    checkout: "Check-out",
  },
  categorie: {
    ristorante: "Restaurants",
    bar: "Bars & cafés",
    supermercato: "Supermarkets",
    farmacia: "Pharmacies",
    attrazione: "Things to see",
    altro: "Other",
  },
  chiama: "Call",
  whatsapp: "WhatsApp",
  indicazioni: "Directions",
  wifi: "Wi-Fi",
  copia: "Copy",
  copiato: "Copied!",
  rete: "Network",
  password: "Password",
  apriMappa: "Open in Google Maps",
  orarioCheckin: "Check-in time",
  orarioCheckout: "Check-out time",
  checklist: "Before you leave",
  cosaSi: "Yes",
  cosaNo: "No",
  quando: "When",
  doveConferire: "Where to take your rubbish",
  contenitore: "{colore} bin",
  codiceCin: "CIN code",
  importo: "Amount",
  esenzioni: "Exemptions",
  pagamento: "How to pay",
  ztlAttenzione: "Warning: Limited Traffic Zone (ZTL)",
  mezziPubblici: "Public transport",
  parcheggio: "Where to park",
  guardiaMedica: "Out-of-hours doctor",
  farmaciaTurno: "Pharmacy on duty",
  ospedale: "Hospital",
  contattoHost: "Your host",
  indice: "In this guide",
  lingua: "Language",
  anteprima: "Preview",
  anteprimaTesto: "This guide is not published yet: only you can see it.",
  creatoCon: "Guide created with",
  tornaSu: "Back to top",
  ciao: "Hi",
};

const fr: Dizionario = {
  sezioni: {
    benvenuto: "Bienvenue",
    arrivo: "Arrivée et check-in",
    wifi: "Wi-Fi",
    casa: "Le logement",
    regole: "Règlement intérieur",
    differenziata: "Tri des déchets",
    tassa: "Taxe de séjour",
    parcheggio: "Parking et ZTL",
    consigli: "Bonnes adresses",
    emergenze: "Urgences",
    checkout: "Départ",
  },
  categorie: {
    ristorante: "Restaurants",
    bar: "Bars et cafés",
    supermercato: "Supermarchés",
    farmacia: "Pharmacies",
    attrazione: "À voir",
    altro: "Autres",
  },
  chiama: "Appeler",
  whatsapp: "WhatsApp",
  indicazioni: "Itinéraire",
  wifi: "Wi-Fi",
  copia: "Copier",
  copiato: "Copié !",
  rete: "Réseau",
  password: "Mot de passe",
  apriMappa: "Ouvrir dans Google Maps",
  orarioCheckin: "Heure d'arrivée",
  orarioCheckout: "Heure de départ",
  checklist: "Avant de partir",
  cosaSi: "Oui",
  cosaNo: "Non",
  quando: "Quand",
  doveConferire: "Où jeter les déchets",
  contenitore: "bac {colore}",
  codiceCin: "Code CIN",
  importo: "Montant",
  esenzioni: "Exonérations",
  pagamento: "Comment payer",
  ztlAttenzione: "Attention : zone à trafic limité (ZTL)",
  mezziPubblici: "Transports en commun",
  parcheggio: "Où se garer",
  guardiaMedica: "Médecin de garde",
  farmaciaTurno: "Pharmacie de garde",
  ospedale: "Hôpital",
  contattoHost: "Votre hôte",
  indice: "Dans ce guide",
  lingua: "Langue",
  anteprima: "Aperçu",
  anteprimaTesto: "Ce guide n'est pas encore publié : vous seul pouvez le voir.",
  creatoCon: "Guide créé avec",
  tornaSu: "Haut de page",
  ciao: "Bonjour",
};

const de: Dizionario = {
  sezioni: {
    benvenuto: "Willkommen",
    arrivo: "Anreise & Check-in",
    wifi: "WLAN",
    casa: "Die Wohnung",
    regole: "Hausregeln",
    differenziata: "Mülltrennung",
    tassa: "Kurtaxe",
    parcheggio: "Parken & ZTL",
    consigli: "Lokale Tipps",
    emergenze: "Notfälle",
    checkout: "Abreise",
  },
  categorie: {
    ristorante: "Restaurants",
    bar: "Bars & Cafés",
    supermercato: "Supermärkte",
    farmacia: "Apotheken",
    attrazione: "Sehenswertes",
    altro: "Sonstiges",
  },
  chiama: "Anrufen",
  whatsapp: "WhatsApp",
  indicazioni: "Route",
  wifi: "WLAN",
  copia: "Kopieren",
  copiato: "Kopiert!",
  rete: "Netzwerk",
  password: "Passwort",
  apriMappa: "In Google Maps öffnen",
  orarioCheckin: "Check-in-Zeit",
  orarioCheckout: "Check-out-Zeit",
  checklist: "Vor der Abreise",
  cosaSi: "Ja",
  cosaNo: "Nein",
  quando: "Wann",
  doveConferire: "Wohin mit dem Müll",
  contenitore: "Tonne: {colore}",
  codiceCin: "CIN-Code",
  importo: "Betrag",
  esenzioni: "Befreiungen",
  pagamento: "Bezahlung",
  ztlAttenzione: "Achtung: Verkehrsberuhigte Zone (ZTL)",
  mezziPubblici: "Öffentliche Verkehrsmittel",
  parcheggio: "Parken",
  guardiaMedica: "Ärztlicher Bereitschaftsdienst",
  farmaciaTurno: "Notdienst-Apotheke",
  ospedale: "Krankenhaus",
  contattoHost: "Ihr Gastgeber",
  indice: "In diesem Guide",
  lingua: "Sprache",
  anteprima: "Vorschau",
  anteprimaTesto: "Dieser Guide ist noch nicht veröffentlicht: nur Sie können ihn sehen.",
  creatoCon: "Guide erstellt mit",
  tornaSu: "Nach oben",
  ciao: "Hallo",
};

const es: Dizionario = {
  sezioni: {
    benvenuto: "Bienvenidos",
    arrivo: "Llegada y check-in",
    wifi: "Wi-Fi",
    casa: "La casa",
    regole: "Normas de la casa",
    differenziata: "Reciclaje",
    tassa: "Tasa turística",
    parcheggio: "Aparcamiento y ZTL",
    consigli: "Recomendaciones",
    emergenze: "Emergencias",
    checkout: "Salida",
  },
  categorie: {
    ristorante: "Restaurantes",
    bar: "Bares y cafeterías",
    supermercato: "Supermercados",
    farmacia: "Farmacias",
    attrazione: "Qué ver",
    altro: "Otros",
  },
  chiama: "Llamar",
  whatsapp: "WhatsApp",
  indicazioni: "Cómo llegar",
  wifi: "Wi-Fi",
  copia: "Copiar",
  copiato: "¡Copiado!",
  rete: "Red",
  password: "Contraseña",
  apriMappa: "Abrir en Google Maps",
  orarioCheckin: "Hora de llegada",
  orarioCheckout: "Hora de salida",
  checklist: "Antes de irte",
  cosaSi: "Sí",
  cosaNo: "No",
  quando: "Cuándo",
  doveConferire: "Dónde tirar la basura",
  contenitore: "contenedor {colore}",
  codiceCin: "Código CIN",
  importo: "Importe",
  esenzioni: "Exenciones",
  pagamento: "Cómo pagar",
  ztlAttenzione: "Atención: Zona de Tráfico Limitado (ZTL)",
  mezziPubblici: "Transporte público",
  parcheggio: "Dónde aparcar",
  guardiaMedica: "Médico de guardia",
  farmaciaTurno: "Farmacia de guardia",
  ospedale: "Hospital",
  contattoHost: "Tu anfitrión",
  indice: "En esta guía",
  lingua: "Idioma",
  anteprima: "Vista previa",
  anteprimaTesto: "Esta guía aún no está publicada: solo tú puedes verla.",
  creatoCon: "Guía creada con",
  tornaSu: "Volver arriba",
  ciao: "Hola",
};

export const DIZIONARI: Record<Lingua, Dizionario> = { it, en, fr, de, es };

export function isLingua(value: unknown): value is Lingua {
  return typeof value === "string" && (LINGUE as readonly string[]).includes(value);
}

/**
 * Sceglie la lingua iniziale: parametro ?lang esplicito, altrimenti la prima
 * lingua dell'header Accept-Language tra quelle attive, altrimenti l'italiano.
 */
export function scegliLingua(attive: Lingua[], richiesta?: string | null, acceptLanguage?: string | null): Lingua {
  if (isLingua(richiesta) && attive.includes(richiesta)) return richiesta;
  if (acceptLanguage) {
    const preferite = acceptLanguage
      .split(",")
      .map((part) => {
        const [tag, q] = part.trim().split(";q=");
        return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);
    for (const { lang } of preferite) {
      if (isLingua(lang) && attive.includes(lang)) return lang;
    }
  }
  return "it";
}

// ---------------------------------------------------------------------------
// Localizzazione dei contenuti
// ---------------------------------------------------------------------------

/**
 * Campi che non si traducono (password, indirizzi, colori, numeri…):
 * valgono sempre quelli italiani, in tutte le lingue.
 */
export const CAMPI_CONDIVISI = new Set([
  "rete",
  "password",
  "indirizzo",
  "maps_url",
  "foto_url",
  "colore",
  "tipo",
  "numero",
  "cin",
  "ztl_presente",
]);

type Valore = unknown;

function isOggetto(v: Valore): v is Record<string, Valore> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Unisce il contenuto italiano (che definisce la struttura: quanti passi,
 * quanti elementi…) con la traduzione. I testi tradotti vuoti ricadono
 * sull'italiano; i campi condivisi restano sempre quelli italiani.
 */
export function unisciTraduzione<T>(base: T, traduzione: unknown): T {
  if (traduzione === undefined || traduzione === null) return base;
  if (Array.isArray(base)) {
    const tr = Array.isArray(traduzione) ? traduzione : [];
    return base.map((item, i) => unisciTraduzione(item, tr[i])) as T;
  }
  if (isOggetto(base)) {
    const tr = isOggetto(traduzione) ? traduzione : {};
    const out: Record<string, Valore> = {};
    for (const [key, value] of Object.entries(base)) {
      out[key] = CAMPI_CONDIVISI.has(key) ? value : unisciTraduzione(value, tr[key]);
    }
    return out as T;
  }
  if (typeof base === "string") {
    return (typeof traduzione === "string" && traduzione.trim() !== "" ? traduzione : base) as T;
  }
  return base;
}

/** Contenuto di una sezione nella lingua richiesta, con ripiego sull'italiano. */
export function localizza<T>(contenuto: Partial<Record<Lingua, T>>, lingua: Lingua, predefinito: T): T {
  const it = contenuto.it;
  // Completa eventuali campi mancanti (contenuti salvati con versioni precedenti).
  const base = (isOggetto(it) && isOggetto(predefinito) ? { ...predefinito, ...it } : (it ?? predefinito)) as T;
  if (lingua === "it") return base;
  return unisciTraduzione(base, contenuto[lingua]);
}
