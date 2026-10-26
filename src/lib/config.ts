/**
 * Configurazione centrale dell'app. Nome e prezzo si cambiano da qui
 * (o dalle variabili d'ambiente) senza toccare il resto del codice.
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GuidaOspiti";

/** Prezzo di pubblicazione di una guida, in centesimi di euro. */
export const PREZZO_GUIDA_CENTESIMI = Number(process.env.NEXT_PUBLIC_PREZZO_GUIDA_CENTESIMI || 2900);

export const PREZZO_GUIDA_LABEL = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: PREZZO_GUIDA_CENTESIMI % 100 === 0 ? 0 : 2,
}).format(PREZZO_GUIDA_CENTESIMI / 100);

/** URL pubblico del sito, usato per link condivisibili e QR code. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

/** Slug della guida dimostrativa creata dal seed e mostrata sulla landing. */
export const DEMO_SLUG = "demo-firenze";

/** Bucket Supabase Storage per immagini. */
export const MEDIA_BUCKET = "guide-media";
