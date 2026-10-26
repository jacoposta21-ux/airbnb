/**
 * Tipi di dominio della guida.
 *
 * Il contenuto di ogni sezione è salvato in `sections.contenuto` come JSON per
 * lingua: `{ it: {...}, en: {...} }`. La forma interna dipende dal tipo di
 * sezione ed è descritta qui sotto.
 */

export const LINGUE = ["it", "en", "fr", "de", "es"] as const;
export type Lingua = (typeof LINGUE)[number];

export const TIPI_SEZIONE = [
  "benvenuto",
  "arrivo",
  "wifi",
  "casa",
  "regole",
  "differenziata",
  "tassa",
  "parcheggio",
  "consigli",
  "emergenze",
  "checkout",
] as const;
export type TipoSezione = (typeof TIPI_SEZIONE)[number];

export const CATEGORIE_LUOGO = [
  "ristorante",
  "bar",
  "supermercato",
  "farmacia",
  "attrazione",
  "altro",
] as const;
export type CategoriaLuogo = (typeof CATEGORIE_LUOGO)[number];

/** Testo tradotto: una stringa per lingua. */
export type Tradotto<T> = Partial<Record<Lingua, T>>;

// ---------------------------------------------------------------------------
// Contenuti per tipo di sezione (versione in una singola lingua)
// ---------------------------------------------------------------------------

export interface ContenutoBenvenuto {
  titolo: string;
  messaggio: string;
  firma: string;
}

export interface PassoArrivo {
  testo: string;
  foto_url?: string;
}

export interface ContenutoArrivo {
  indirizzo: string;
  /** Link Google Maps; se vuoto viene generato dall'indirizzo. */
  maps_url?: string;
  orario_checkin: string;
  passi: PassoArrivo[];
  note: string;
}

export interface ContenutoWifi {
  rete: string;
  password: string;
  note: string;
}

export interface ElementoCasa {
  nome: string;
  istruzioni: string;
  foto_url?: string;
}

export interface ContenutoCasa {
  intro: string;
  elementi: ElementoCasa[];
}

export interface ContenutoRegole {
  regole: string[];
  note: string;
}

/** Tipologie standard della raccolta differenziata italiana. */
export const TIPI_RIFIUTO = [
  "organico",
  "carta",
  "plastica",
  "vetro",
  "indifferenziato",
  "altro",
] as const;
export type TipoRifiuto = (typeof TIPI_RIFIUTO)[number];

export interface Rifiuto {
  tipo: TipoRifiuto;
  /** Nome mostrato (es. "Multimateriale: plastica e metalli"). */
  nome: string;
  /** Colore del contenitore, esadecimale. */
  colore: string;
  /** Nome del colore per chi non distingue bene i colori (es. "blu"). */
  nome_colore: string;
  /** Giorni/orari di conferimento (es. "Lunedì e giovedì, dopo le 20"). */
  giorni: string;
  cosa_si: string;
  cosa_no: string;
}

export interface ContenutoDifferenziata {
  intro: string;
  rifiuti: Rifiuto[];
  dove_conferire: string;
  note: string;
}

export interface ContenutoTassa {
  /** Codice Identificativo Nazionale della struttura. */
  cin: string;
  importo: string;
  esenzioni: string;
  modalita_pagamento: string;
  note: string;
}

export interface ContenutoParcheggio {
  parcheggio: string;
  ztl_presente: boolean;
  ztl: string;
  mezzi_pubblici: string;
}

export interface ContenutoConsigli {
  intro: string;
}

export interface NumeroUtile {
  nome: string;
  numero: string;
}

export interface ContenutoEmergenze {
  numeri: NumeroUtile[];
  guardia_medica: string;
  farmacia_turno: string;
  ospedale: string;
  note: string;
}

export interface ContenutoCheckout {
  orario: string;
  istruzioni: string;
  checklist: string[];
}

export interface ContenutiSezione {
  benvenuto: ContenutoBenvenuto;
  arrivo: ContenutoArrivo;
  wifi: ContenutoWifi;
  casa: ContenutoCasa;
  regole: ContenutoRegole;
  differenziata: ContenutoDifferenziata;
  tassa: ContenutoTassa;
  parcheggio: ContenutoParcheggio;
  consigli: ContenutoConsigli;
  emergenze: ContenutoEmergenze;
  checkout: ContenutoCheckout;
}

/** Contenuto di una sezione in tutte le lingue. */
export type ContenutoMultilingua<T extends TipoSezione = TipoSezione> = Tradotto<ContenutiSezione[T]>;

// ---------------------------------------------------------------------------
// Entità complete, come usate da editor e pagina pubblica
// ---------------------------------------------------------------------------

export interface Sezione<T extends TipoSezione = TipoSezione> {
  id: string;
  tipo: T;
  ordine: number;
  attiva: boolean;
  contenuto: ContenutoMultilingua<T>;
}

export interface Luogo {
  id: string;
  categoria: CategoriaLuogo;
  nome: string;
  descrizione: Tradotto<string>;
  maps_url: string | null;
  ordine: number;
}

export interface Guida {
  id: string;
  slug: string;
  nome_struttura: string;
  citta: string;
  stato: "bozza" | "pubblicata";
  pagata: boolean;
  colore: string;
  logo_url: string | null;
  cover_url: string | null;
  lingue_attive: Lingua[];
  contatto_nome: string | null;
  contatto_telefono: string | null;
  contatto_whatsapp: string | null;
}

/** Guida con sezioni e luoghi: tutto ciò che serve per mostrarla. */
export interface GuidaCompleta extends Guida {
  sezioni: Sezione[];
  luoghi: Luogo[];
}
