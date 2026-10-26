"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ErroreAI, generaBozza, traduci, type DaTradurre } from "@/lib/ai";
import { requireHost } from "@/lib/auth";
import { creaGuida } from "@/lib/guide-actions";
import { loadGuidaCompleta } from "@/lib/guides";
import { allinea, preferisciEsistente } from "@/lib/translation-merge";
import { tagGuida } from "@/lib/public-guide";
import { contenutoPredefinito } from "@/lib/sections";
import { mapsSearchUrl } from "@/lib/utils";
import type { Json } from "@/types/database";
import { LINGUE, type ContenutiSezione, type Lingua, type TipoSezione } from "@/types/guide";

/** Richieste AI consentite a ogni host nelle ultime 24 ore. */
const LIMITI = { generazione: 10, traduzione: 30 } as const;

type Supabase = Awaited<ReturnType<typeof requireHost>>["supabase"];

/** Controlla e registra l'uso dell'AI. Restituisce un messaggio se il limite è superato. */
async function consumaQuota(supabase: Supabase, hostId: string, tipo: keyof typeof LIMITI) {
  const ieri = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_richieste")
    .select("id", { count: "exact", head: true })
    .eq("host_id", hostId)
    .eq("tipo", tipo)
    .gte("creato_il", ieri);
  if ((count ?? 0) >= LIMITI[tipo]) {
    return `Hai raggiunto il limite giornaliero di ${LIMITI[tipo]} ${tipo === "generazione" ? "generazioni" : "traduzioni"} con l'AI. Riprova domani.`;
  }
  await supabase.from("ai_richieste").insert({ host_id: hostId, tipo });
  return null;
}

// ---------------------------------------------------------------------------
// Generazione di una nuova guida dal testo dell'annuncio
// ---------------------------------------------------------------------------

export interface StatoGenerazione {
  error?: string;
}

const schemaForm = z.object({
  annuncio: z
    .string()
    .trim()
    .min(80, "Incolla il testo completo dell'annuncio (almeno qualche riga).")
    .max(15000, "Il testo è troppo lungo: massimo 15.000 caratteri."),
  nome_struttura: z.string().trim().min(2, "Inserisci il nome della struttura.").max(120),
  citta: z.string().trim().min(2, "Inserisci la città.").max(80),
  indirizzo: z.string().trim().max(200).optional(),
  contatto_telefono: z.string().trim().max(30).optional(),
  wifi_rete: z.string().trim().max(100).optional(),
  wifi_password: z.string().trim().max(100).optional(),
  orario_checkin: z.string().trim().max(100).optional(),
  orario_checkout: z.string().trim().max(100).optional(),
  note: z.string().trim().max(3000).optional(),
});

export async function generaGuidaAI(_prev: StatoGenerazione, formData: FormData): Promise<StatoGenerazione> {
  const parsed = schemaForm.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const { supabase, host } = await requireHost();
  const limite = await consumaQuota(supabase, host.id, "generazione");
  if (limite) return { error: limite };

  let bozza;
  try {
    bozza = await generaBozza({ ...d, nome_host: host.nome ?? undefined });
  } catch (e) {
    return { error: e instanceof ErroreAI ? e.message : "Generazione non riuscita. Riprova." };
  }

  // I dati inseriti dall'host hanno sempre la precedenza su quelli generati.
  const s = bozza.sezioni;
  const indirizzo = d.indirizzo || s.arrivo.indirizzo;
  const contenuti: Partial<ContenutiSezione> = {
    ...s,
    arrivo: {
      ...s.arrivo,
      indirizzo,
      maps_url: indirizzo ? mapsSearchUrl(indirizzo) : "",
      orario_checkin: d.orario_checkin || s.arrivo.orario_checkin,
    },
    wifi: { ...s.wifi, rete: d.wifi_rete || s.wifi.rete, password: d.wifi_password || s.wifi.password },
    checkout: { ...s.checkout, orario: d.orario_checkout || s.checkout.orario },
  };

  const esito = await creaGuida({
    nome_struttura: d.nome_struttura,
    citta: d.citta,
    contatto_telefono: d.contatto_telefono,
    contatto_whatsapp: d.contatto_telefono,
    contenuti: contenuti as Record<string, Record<string, unknown>>,
    luoghi: bozza.luoghi
      .filter((l) => l.nome.trim())
      .slice(0, 20)
      .map((l) => ({ ...l, maps_url: mapsSearchUrl(`${l.nome}, ${d.citta}`) })),
  });
  if (!esito.ok || !esito.id) return { error: esito.error ?? "Non è stato possibile salvare la guida." };

  redirect(`/guide/${esito.id}/modifica?generata=1`);
}

// ---------------------------------------------------------------------------
// Traduzione di una guida esistente
// ---------------------------------------------------------------------------

export interface EsitoTraduzione {
  ok: boolean;
  error?: string;
  lingue_attive?: Lingua[];
  sezioni?: Array<{ id: string; contenuto: Partial<Record<Lingua, unknown>> }>;
  luoghi?: Array<{ id: string; descrizione: Partial<Record<Lingua, string>> }>;
}

const schemaTraduzioneInput = z.object({
  guideId: z.uuid(),
  lingue: z.array(z.enum(LINGUE).exclude(["it"])).min(1).max(4),
  modo: z.enum(["mancanti", "tutto"]),
});

/**
 * Traduce la guida (già salvata) nelle lingue richieste e la salva.
 * Modo "mancanti": conserva le traduzioni esistenti e le correzioni manuali.
 * Modo "tutto": ritraduce da capo dal testo italiano attuale.
 */
export async function traduciGuida(input: z.input<typeof schemaTraduzioneInput>): Promise<EsitoTraduzione> {
  const parsed = schemaTraduzioneInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Richiesta non valida." };
  const { guideId, lingue, modo } = parsed.data;

  const { supabase, host } = await requireHost();
  const guida = await loadGuidaCompleta(supabase, { id: guideId }).catch(() => null);
  if (!guida || guida.host_id !== host.id) return { ok: false, error: "Guida non trovata." };

  const limite = await consumaQuota(supabase, host.id, "traduzione");
  if (limite) return { ok: false, error: limite };

  // Testo italiano completo, con i predefiniti per i campi mancanti.
  const baseIt = Object.fromEntries(
    guida.sezioni.map((s) => [s.tipo, { ...contenutoPredefinito(s.tipo), ...((s.contenuto.it as object) ?? {}) }]),
  ) as Record<TipoSezione, unknown>;
  const daTradurre: DaTradurre = {
    sezioni: baseIt as Partial<ContenutiSezione>,
    luoghi: guida.luoghi.filter((l) => l.descrizione.it?.trim()).map((l) => ({ id: l.id, descrizione: l.descrizione.it ?? "" })),
  };

  let risultati;
  try {
    risultati = await Promise.all(lingue.map(async (lingua) => ({ lingua, tr: await traduci(daTradurre, lingua) })));
  } catch (e) {
    return { ok: false, error: e instanceof ErroreAI ? e.message : "Traduzione non riuscita. Riprova." };
  }

  // Applica le traduzioni a sezioni e luoghi.
  const sezioni = guida.sezioni.map((s) => {
    const contenuto = { ...s.contenuto } as Partial<Record<Lingua, unknown>>;
    for (const { lingua, tr } of risultati) {
      const tradotto = allinea(tr.sezioni[s.tipo as keyof typeof tr.sezioni], baseIt[s.tipo]);
      contenuto[lingua] = modo === "mancanti" ? preferisciEsistente(tradotto, contenuto[lingua]) : tradotto;
    }
    return { id: s.id, contenuto };
  });

  const luoghi = guida.luoghi.map((l) => {
    const descrizione = { ...l.descrizione };
    for (const { lingua, tr } of risultati) {
      const nuova = tr.luoghi.find((x) => x.id === l.id)?.descrizione ?? "";
      if (modo === "tutto" || !descrizione[lingua]?.trim()) descrizione[lingua] = nuova;
    }
    return { id: l.id, descrizione };
  });

  const lingueAttive = LINGUE.filter((l) => l === "it" || guida.lingue_attive.includes(l) || lingue.includes(l as never));

  const errori = await Promise.all([
    ...sezioni.map((s) => supabase.from("sections").update({ contenuto: s.contenuto as Json }).eq("id", s.id)),
    ...luoghi.map((l) => supabase.from("places").update({ descrizione: l.descrizione }).eq("id", l.id)),
    supabase.from("guides").update({ lingue_attive: lingueAttive }).eq("id", guideId),
  ]);
  if (errori.some((r) => r.error)) return { ok: false, error: "Traduzione completata ma non salvata. Riprova." };

  revalidateTag(tagGuida(guida.slug), { expire: 0 });
  return { ok: true, lingue_attive: lingueAttive, sezioni, luoghi };
}
