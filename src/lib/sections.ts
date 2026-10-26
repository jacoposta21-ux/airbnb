/**
 * Catalogo delle sezioni: etichette, descrizioni e contenuti predefiniti.
 * I contenuti predefiniti sono già pensati per l'Italia, così l'host non
 * parte mai da un editor vuoto.
 */

import type { ContenutiSezione, Rifiuto, TipoSezione } from "@/types/guide";

export interface InfoSezione {
  tipo: TipoSezione;
  /** Nome della sezione nell'editor (italiano). */
  etichetta: string;
  /** Spiegazione breve per l'host. */
  descrizione: string;
  /** Nome dell'icona lucide-react (vedi components/section-icon.tsx). */
  icona: string;
}

export const CATALOGO_SEZIONI: InfoSezione[] = [
  { tipo: "benvenuto", etichetta: "Benvenuto", descrizione: "Il tuo messaggio di accoglienza e la foto di copertina.", icona: "heart" },
  { tipo: "arrivo", etichetta: "Arrivo e check-in", descrizione: "Indirizzo, orari e istruzioni passo passo per entrare.", icona: "key" },
  { tipo: "wifi", etichetta: "Wi-Fi", descrizione: "Nome della rete e password, con pulsante copia.", icona: "wifi" },
  { tipo: "casa", etichetta: "La casa", descrizione: "Come usare elettrodomestici, riscaldamento, aria condizionata.", icona: "home" },
  { tipo: "regole", etichetta: "Regole della casa", descrizione: "Silenzio, fumo, animali, ospiti esterni.", icona: "scroll" },
  { tipo: "differenziata", etichetta: "Raccolta differenziata", descrizione: "Tipi di rifiuto, colori dei contenitori, giorni e dove buttarli.", icona: "recycle" },
  { tipo: "tassa", etichetta: "Tassa di soggiorno e CIN", descrizione: "Importo, esenzioni, modalità di pagamento e codice CIN.", icona: "receipt" },
  { tipo: "parcheggio", etichetta: "Parcheggio e ZTL", descrizione: "Dove parcheggiare, zone a traffico limitato, mezzi pubblici.", icona: "car" },
  { tipo: "consigli", etichetta: "Consigli locali", descrizione: "Ristoranti, bar, supermercati, farmacie e attrazioni.", icona: "map-pin" },
  { tipo: "emergenze", etichetta: "Emergenze", descrizione: "112, guardia medica, farmacia di turno, il tuo contatto.", icona: "siren" },
  { tipo: "checkout", etichetta: "Check-out", descrizione: "Orario, istruzioni e checklist prima di partire.", icona: "log-out" },
];

export const INFO_SEZIONE = Object.fromEntries(CATALOGO_SEZIONI.map((s) => [s.tipo, s])) as Record<TipoSezione, InfoSezione>;

/** Raccolta differenziata "tipo" di un comune italiano: l'host adatta colori e giorni. */
export const RIFIUTI_PREDEFINITI: Rifiuto[] = [
  {
    tipo: "organico",
    nome: "Organico",
    colore: "#7A4E2D",
    nome_colore: "marrone",
    giorni: "",
    cosa_si: "Avanzi di cibo, fondi di caffè, filtri del tè, tovaglioli di carta sporchi",
    cosa_no: "Liquidi, sacchetti di plastica, mozziconi",
  },
  {
    tipo: "carta",
    nome: "Carta e cartone",
    colore: "#E2B93B",
    nome_colore: "giallo",
    giorni: "",
    cosa_si: "Giornali, scatole appiattite, cartoni della pizza puliti, Tetra Pak (se previsto dal comune)",
    cosa_no: "Carta sporca di cibo, scontrini, carta forno",
  },
  {
    tipo: "plastica",
    nome: "Plastica e metalli",
    colore: "#2F6DB5",
    nome_colore: "blu",
    giorni: "",
    cosa_si: "Bottiglie, vaschette, flaconi, lattine, scatolette, pellicole",
    cosa_no: "Giocattoli, oggetti in gomma, posate di plastica dura",
  },
  {
    tipo: "vetro",
    nome: "Vetro",
    colore: "#3E8E4E",
    nome_colore: "verde",
    giorni: "",
    cosa_si: "Bottiglie e vasetti di vetro, senza tappo",
    cosa_no: "Ceramica, specchi, lampadine, bicchieri di cristallo",
  },
  {
    tipo: "indifferenziato",
    nome: "Indifferenziato",
    colore: "#6B6B6B",
    nome_colore: "grigio",
    giorni: "",
    cosa_si: "Tutto ciò che non è riciclabile: pannolini, assorbenti, spugne, cocci",
    cosa_no: "Rifiuti riciclabili, pile, farmaci",
  },
];

/** Contenuto iniziale (in italiano) di ogni sezione. */
export function contenutoPredefinito<T extends TipoSezione>(tipo: T): ContenutiSezione[T] {
  const predefiniti: ContenutiSezione = {
    benvenuto: {
      titolo: "Benvenuti!",
      messaggio:
        "Siamo felici di avervi nostri ospiti. In questa guida trovate tutto quello che serve per il vostro soggiorno: come entrare, il Wi-Fi, come funziona la casa e i nostri posti preferiti in zona. Per qualsiasi cosa, scriveteci pure.",
      firma: "",
    },
    arrivo: {
      indirizzo: "",
      maps_url: "",
      orario_checkin: "Dalle 15:00",
      passi: [{ testo: "" }],
      note: "Ricordate di avere con voi un documento d'identità valido per ogni ospite: per legge dobbiamo registrare i dati sul portale Alloggiati Web della Polizia di Stato.",
    },
    wifi: { rete: "", password: "", note: "" },
    casa: { intro: "", elementi: [{ nome: "", istruzioni: "" }] },
    regole: {
      regole: [
        "Silenzio dalle 22:00 alle 8:00, nel rispetto dei vicini",
        "Vietato fumare all'interno dell'appartamento",
        "Non sono ammesse feste o ospiti non registrati",
        "Spegnete luci e aria condizionata quando uscite",
      ],
      note: "",
    },
    differenziata: {
      intro:
        "In Italia la raccolta differenziata è obbligatoria e chi non la rispetta può essere multato. Grazie per l'aiuto: è facile!",
      rifiuti: RIFIUTI_PREDEFINITI,
      dove_conferire: "",
      note: "",
    },
    tassa: {
      cin: "",
      importo: "",
      esenzioni: "Bambini e ragazzi sotto i 12 anni",
      modalita_pagamento: "",
      note: "L'imposta di soggiorno è stabilita dal Comune e viene versata interamente al Comune.",
    },
    parcheggio: {
      parcheggio: "",
      ztl_presente: false,
      ztl: "",
      mezzi_pubblici: "",
    },
    consigli: { intro: "Ecco i nostri posti preferiti nei dintorni, scelti personalmente." },
    emergenze: {
      numeri: [
        { nome: "Numero unico di emergenza (ambulanza, polizia, vigili del fuoco)", numero: "112" },
        { nome: "Guardia medica (continuità assistenziale, dove attivo il 116117)", numero: "116117" },
      ],
      guardia_medica: "",
      farmacia_turno: "Le farmacie di turno sono indicate sulla porta di ogni farmacia e sul sito farmaciediturno.org",
      ospedale: "",
      note: "",
    },
    checkout: {
      orario: "Entro le 10:00",
      istruzioni: "Lasciate le chiavi dove le avete trovate e chiudete bene la porta. Buon viaggio!",
      checklist: [
        "Chiudete finestre e balconi",
        "Spegnete luci, aria condizionata e riscaldamento",
        "Buttate la spazzatura negli appositi contenitori",
        "Lasciate le stoviglie usate nel lavello o in lavastoviglie",
        "Controllate di non aver dimenticato nulla (caricabatterie!)",
      ],
    },
  };
  return structuredClone(predefiniti[tipo]);
}
