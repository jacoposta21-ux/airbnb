/**
 * Dati del titolare del servizio, mostrati nelle pagine legali e nel footer.
 * Si impostano con variabili d'ambiente (vedi README) per non metterli nel codice.
 */
import { APP_NAME, PREZZO_GUIDA_LABEL } from "@/lib/config";

export const LEGALE = {
  /** Nome e cognome (o ragione sociale) del titolare. */
  titolare: process.env.NEXT_PUBLIC_TITOLARE_NOME || `Il titolare di ${APP_NAME}`,
  /** Città o indirizzo del titolare (facoltativo). */
  sede: process.env.NEXT_PUBLIC_TITOLARE_SEDE || "",
  /** Partita IVA (facoltativa: viene mostrata solo se impostata). */
  partitaIva: process.env.NEXT_PUBLIC_TITOLARE_PIVA || "",
  /** Email per assistenza, privacy e rimborsi. */
  email: process.env.NEXT_PUBLIC_EMAIL_CONTATTO || "",
  /** Giorni entro cui si può chiedere il rimborso. */
  giorniRimborso: 14,
  prezzo: PREZZO_GUIDA_LABEL,
  aggiornamento: "27 ottobre 2026",
} as const;
