import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { NOMI_LINGUE } from "@/lib/i18n";
import { CATEGORIE_LUOGO, TIPI_RIFIUTO, type ContenutiSezione, type Lingua } from "@/types/guide";

/**
 * Integrazione con l'API di Claude: generazione della bozza della guida dal
 * testo dell'annuncio e traduzione dei contenuti.
 *
 * Usa gli output strutturati (schema Zod) così la risposta è sempre un JSON
 * valido con la forma attesa dall'editor.
 */

const MODELLO = "claude-opus-5-5";

export class ErroreAI extends Error {}

export function aiConfigurata() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function client() {
  if (!aiConfigurata()) throw new ErroreAI("L'AI non è configurata: manca ANTHROPIC_API_KEY.");
  return new Anthropic();
}

// ---------------------------------------------------------------------------
// Schemi: rispecchiano i tipi di src/types/guide.ts
// ---------------------------------------------------------------------------

const schemaSezioni = z.object({
  benvenuto: z.object({ titolo: z.string(), messaggio: z.string(), firma: z.string() }),
  arrivo: z.object({
    indirizzo: z.string(),
    orario_checkin: z.string(),
    passi: z.array(z.object({ testo: z.string() })),
    note: z.string(),
  }),
  wifi: z.object({ rete: z.string(), password: z.string(), note: z.string() }),
  casa: z.object({ intro: z.string(), elementi: z.array(z.object({ nome: z.string(), istruzioni: z.string() })) }),
  regole: z.object({ regole: z.array(z.string()), note: z.string() }),
  differenziata: z.object({
    intro: z.string(),
    rifiuti: z.array(
      z.object({
        tipo: z.enum(TIPI_RIFIUTO),
        nome: z.string(),
        colore: z.string().describe("Colore esadecimale del contenitore, es. #2F6DB5"),
        nome_colore: z.string(),
        giorni: z.string(),
        cosa_si: z.string().describe("Elenco separato da virgole"),
        cosa_no: z.string().describe("Elenco separato da virgole"),
      }),
    ),
    dove_conferire: z.string(),
    note: z.string(),
  }),
  tassa: z.object({
    cin: z.string(),
    importo: z.string(),
    esenzioni: z.string(),
    modalita_pagamento: z.string(),
    note: z.string(),
  }),
  parcheggio: z.object({
    parcheggio: z.string(),
    ztl_presente: z.boolean(),
    ztl: z.string(),
    mezzi_pubblici: z.string(),
  }),
  consigli: z.object({ intro: z.string() }),
  emergenze: z.object({
    numeri: z.array(z.object({ nome: z.string(), numero: z.string() })),
    guardia_medica: z.string(),
    farmacia_turno: z.string(),
    ospedale: z.string(),
    note: z.string(),
  }),
  checkout: z.object({ orario: z.string(), istruzioni: z.string(), checklist: z.array(z.string()) }),
});

const schemaBozza = z.object({
  sezioni: schemaSezioni,
  luoghi: z.array(
    z.object({
      categoria: z.enum(CATEGORIE_LUOGO),
      nome: z.string(),
      descrizione: z.string(),
    }),
  ),
});

export type BozzaAI = z.infer<typeof schemaBozza>;

// ---------------------------------------------------------------------------
// Chiamata comune
// ---------------------------------------------------------------------------

async function chiama<T extends z.ZodType>(opzioni: {
  schema: T;
  system: string;
  prompt: string;
  effort: "low" | "medium" | "high";
}): Promise<z.infer<T>> {
  try {
    const risposta = await client().beta.messages.parse({
      model: MODELLO,
      max_tokens: 16000,
      // In caso di rifiuto dei filtri di sicurezza, l'API riprova su un modello di riserva.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: opzioni.effort, format: betaZodOutputFormat(opzioni.schema) },
      system: opzioni.system,
      messages: [{ role: "user", content: opzioni.prompt }],
    });

    if (risposta.stop_reason === "refusal") throw new ErroreAI("L'AI non ha potuto elaborare questo testo. Prova a riformularlo.");
    if (risposta.stop_reason === "max_tokens") throw new ErroreAI("Il testo è troppo lungo: prova ad accorciarlo.");
    if (!risposta.parsed_output) throw new ErroreAI("Risposta dell'AI non valida. Riprova.");
    return risposta.parsed_output as z.infer<T>;
  } catch (e) {
    if (e instanceof ErroreAI) throw e;
    if (e instanceof Anthropic.RateLimitError) throw new ErroreAI("Troppe richieste all'AI in questo momento. Riprova tra un minuto.");
    if (e instanceof Anthropic.AuthenticationError) throw new ErroreAI("Chiave API di Claude non valida: controlla ANTHROPIC_API_KEY.");
    if (e instanceof Anthropic.APIConnectionError) throw new ErroreAI("Impossibile contattare l'AI. Controlla la connessione e riprova.");
    if (e instanceof Anthropic.APIError) {
      console.error("Errore API Claude", e.status, e.message);
      throw new ErroreAI("Il servizio AI non è disponibile al momento. Riprova tra poco.");
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Generazione della bozza
// ---------------------------------------------------------------------------

export interface DatiGenerazione {
  annuncio: string;
  nome_struttura: string;
  citta: string;
  indirizzo?: string;
  nome_host?: string;
  wifi_rete?: string;
  wifi_password?: string;
  orario_checkin?: string;
  orario_checkout?: string;
  note?: string;
}

const SYSTEM_GENERAZIONE = `Sei un esperto di ospitalità per affitti brevi in Italia (Airbnb, Booking).
Scrivi in italiano le sezioni di una guida digitale per gli ospiti di un appartamento, partendo dal testo dell'annuncio e dalle informazioni fornite dall'host.

Stile: caldo, accogliente e pratico. Frasi brevi, chiare anche per chi legge in traduzione. Dai del "voi" agli ospiti. Niente emoji.

Regole sui fatti, fondamentali:
- Usa solo informazioni presenti nell'annuncio o nei dati dell'host. Non inventare mai password, codici, numeri di telefono, indirizzi, orari, prezzi o nomi di locali.
- Se un dato manca, lascia la stringa vuota: l'host la completerà. Meglio un campo vuoto che un dato sbagliato.
- Il codice CIN va lasciato vuoto se non è indicato.
- Per tassa di soggiorno, ZTL e calendario della raccolta: se l'annuncio non dà dettagli precisi, scrivi indicazioni generali e invita a verificare con l'host, senza inventare importi o orari.

Indicazioni per sezione:
- benvenuto: messaggio personale di 3-5 frasi che richiami i punti forti della casa; firma con il nome dell'host se noto.
- arrivo: istruzioni passo passo solo se l'annuncio le descrive, altrimenti un solo passo generico che invita a contattare l'host per le istruzioni.
- casa: un elemento per ogni dotazione citata nell'annuncio (aria condizionata, lavatrice, macchina del caffè, riscaldamento, TV…) con istruzioni d'uso generiche e prudenti.
- regole: deducile dall'annuncio (fumo, animali, feste, orari di silenzio); aggiungi le regole standard di buon vicinato.
- differenziata: i cinque tipi standard (organico marrone #7A4E2D, carta giallo #E2B93B, plastica e metalli blu #2F6DB5, vetro verde #3E8E4E, indifferenziato grigio #6B6B6B) salvo indicazioni diverse; giorni vuoti se non noti.
- parcheggio: ztl_presente true solo se l'annuncio parla di ZTL o di centro storico di una città con ZTL nota.
- emergenze: includi sempre 112 (numero unico di emergenza) e 116117 (guardia medica, dove attivo).
- checkout: orario se noto e una checklist pratica di 4-6 voci.
- luoghi: includi solo locali citati nell'annuncio e al massimo 3-4 attrazioni celebri e certamente esistenti della città. Non inventare ristoranti, bar o negozi.`;

export async function generaBozza(d: DatiGenerazione): Promise<BozzaAI> {
  const righe = [
    `Nome della struttura: ${d.nome_struttura}`,
    `Città: ${d.citta || "non indicata"}`,
    d.indirizzo && `Indirizzo: ${d.indirizzo}`,
    d.nome_host && `Nome dell'host: ${d.nome_host}`,
    d.wifi_rete && `Rete Wi-Fi: ${d.wifi_rete}`,
    d.wifi_password && `Password Wi-Fi: ${d.wifi_password}`,
    d.orario_checkin && `Orario di check-in: ${d.orario_checkin}`,
    d.orario_checkout && `Orario di check-out: ${d.orario_checkout}`,
    d.note && `Altre informazioni dall'host:\n${d.note}`,
  ].filter(Boolean);

  return chiama({
    schema: schemaBozza,
    system: SYSTEM_GENERAZIONE,
    effort: "medium",
    prompt: `${righe.join("\n")}\n\nTesto dell'annuncio:\n<annuncio>\n${d.annuncio}\n</annuncio>\n\nGenera tutte le sezioni della guida.`,
  });
}

// ---------------------------------------------------------------------------
// Traduzione
// ---------------------------------------------------------------------------

export interface DaTradurre {
  sezioni: Partial<ContenutiSezione>;
  luoghi: Array<{ id: string; descrizione: string }>;
}

const schemaTraduzione = z.object({
  sezioni: schemaSezioni.partial(),
  luoghi: z.array(z.object({ id: z.string(), descrizione: z.string() })),
});

export type Traduzione = z.infer<typeof schemaTraduzione>;

const SYSTEM_TRADUZIONE = `Sei un traduttore professionista specializzato in ospitalità e turismo.
Traduci la guida per gli ospiti di un appartamento in Italia, mantenendo il tono caldo e pratico dell'originale.

Regole:
- Restituisci esattamente la stessa struttura JSON ricevuta: stesse chiavi, stesse liste con lo stesso numero di elementi nello stesso ordine.
- Traduci solo i testi. Lascia invariati: password, nomi delle reti Wi-Fi, indirizzi, codici (CIN), numeri di telefono, colori esadecimali, il campo "tipo", i valori booleani e gli "id".
- Nomi propri di luoghi, vie e locali restano in italiano. Sigle italiane utili all'ospite (ZTL, CIN) restano, con una breve spiegazione se è la prima volta che compaiono in un testo.
- Le stringhe vuote restano vuote.
- Usa la forma di cortesia naturale nella lingua di arrivo per rivolgersi agli ospiti.`;

export async function traduci(contenuto: DaTradurre, lingua: Exclude<Lingua, "it">): Promise<Traduzione> {
  return chiama({
    schema: schemaTraduzione,
    system: SYSTEM_TRADUZIONE,
    effort: "low",
    prompt: `Lingua di arrivo: ${NOMI_LINGUE[lingua]} (${lingua}).\n\nTesto da tradurre (JSON):\n${JSON.stringify(contenuto)}`,
  });
}
