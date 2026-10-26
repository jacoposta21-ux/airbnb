"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireHost } from "@/lib/auth";
import { tagGuida } from "@/lib/public-guide";
import { CATALOGO_SEZIONI, contenutoPredefinito } from "@/lib/sections";
import { slugify } from "@/lib/utils";
import type { Json } from "@/types/database";
import { CATEGORIE_LUOGO, LINGUE, TIPI_SEZIONE, type ContenutiSezione, type TipoSezione } from "@/types/guide";

export interface EsitoAzione {
  ok: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Utilità
// ---------------------------------------------------------------------------

/** Slug leggibile e unico: "casa-giotto-firenze-x7k2". */
function generaSlug(nome: string, citta: string) {
  const base = slugify(`${nome} ${citta}`) || "guida";
  const suffisso = randomBytes(3).toString("hex").slice(0, 4);
  return `${base.slice(0, 50)}-${suffisso}`;
}

/** Sezioni iniziali di una nuova guida: predefiniti italiani + contenuti forniti. */
function sezioniIniziali(contenuti: Partial<ContenutiSezione> = {}) {
  return CATALOGO_SEZIONI.map((info, ordine) => {
    const tipo = info.tipo as TipoSezione;
    const fornito = contenuti[tipo];
    const it = { ...contenutoPredefinito(tipo), ...(fornito ?? {}) };
    return { tipo, ordine, attiva: true, contenuto: { it } as unknown as Json };
  });
}

// ---------------------------------------------------------------------------
// Creazione (wizard; la generazione AI riusa la stessa funzione)
// ---------------------------------------------------------------------------

const nuovaGuidaSchema = z.object({
  nome_struttura: z.string().trim().min(2, "Inserisci il nome della struttura.").max(120),
  citta: z.string().trim().max(80).default(""),
  contatto_nome: z.string().trim().max(80).optional(),
  contatto_telefono: z.string().trim().max(30).optional(),
  contatto_whatsapp: z.string().trim().max(30).optional(),
  contenuti: z.partialRecord(z.enum(TIPI_SEZIONE), z.record(z.string(), z.unknown())).default({}),
  luoghi: z
    .array(
      z.object({
        categoria: z.enum(CATEGORIE_LUOGO),
        nome: z.string().trim().min(1).max(120),
        descrizione: z.string().max(500).default(""),
        maps_url: z.string().max(500).optional(),
      }),
    )
    .max(40)
    .default([]),
});

export type DatiNuovaGuida = z.input<typeof nuovaGuidaSchema>;

/**
 * Crea una guida completa (tutte le sezioni) e restituisce il suo id.
 * Usata dal wizard e dalla generazione AI.
 */
export async function creaGuida(dati: DatiNuovaGuida): Promise<EsitoAzione & { id?: string }> {
  const parsed = nuovaGuidaSchema.safeParse(dati);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  const { supabase, host } = await requireHost();

  const { data: guida, error } = await supabase
    .from("guides")
    .insert({
      host_id: host.id,
      slug: generaSlug(d.nome_struttura, d.citta),
      nome_struttura: d.nome_struttura,
      citta: d.citta,
      contatto_nome: d.contatto_nome || host.nome || null,
      contatto_telefono: d.contatto_telefono || host.telefono || null,
      contatto_whatsapp: d.contatto_whatsapp || d.contatto_telefono || host.telefono || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "Non è stato possibile creare la guida. Riprova." };

  const sezioni = sezioniIniziali(d.contenuti as unknown as Partial<ContenutiSezione>);
  const { error: secErr } = await supabase.from("sections").insert(sezioni.map((s) => ({ ...s, guide_id: guida.id })));
  if (secErr) {
    await supabase.from("guides").delete().eq("id", guida.id);
    return { ok: false, error: "Non è stato possibile creare le sezioni della guida. Riprova." };
  }

  if (d.luoghi.length > 0) {
    await supabase.from("places").insert(
      d.luoghi.map((l, i) => ({
        guide_id: guida.id,
        categoria: l.categoria,
        nome: l.nome,
        descrizione: { it: l.descrizione },
        maps_url: l.maps_url || null,
        ordine: i,
      })),
    );
  }

  // Salva il telefono nel profilo host per le prossime guide.
  if (d.contatto_telefono && !host.telefono) {
    await supabase.from("hosts").update({ telefono: d.contatto_telefono }).eq("id", host.id);
  }

  revalidatePath("/dashboard");
  return { ok: true, id: guida.id };
}

// ---------------------------------------------------------------------------
// Duplicazione
// ---------------------------------------------------------------------------

export async function duplicaGuida(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase, host } = await requireHost();

  const { data: originale } = await supabase.from("guides").select("*").eq("id", id).maybeSingle();
  if (!originale) redirect("/guide/nuova?errore=duplica");

  const nome = `${originale.nome_struttura} (copia)`.slice(0, 120);
  const { data: copia, error } = await supabase
    .from("guides")
    .insert({
      host_id: host.id,
      slug: generaSlug(originale.nome_struttura, originale.citta),
      nome_struttura: nome,
      citta: originale.citta,
      colore: originale.colore,
      logo_url: originale.logo_url,
      cover_url: originale.cover_url,
      lingue_attive: originale.lingue_attive,
      contatto_nome: originale.contatto_nome,
      contatto_telefono: originale.contatto_telefono,
      contatto_whatsapp: originale.contatto_whatsapp,
    })
    .select("id")
    .single();
  if (error || !copia) redirect("/guide/nuova?errore=duplica");

  const [{ data: sezioni }, { data: luoghi }] = await Promise.all([
    supabase.from("sections").select("tipo, ordine, attiva, contenuto").eq("guide_id", id),
    supabase.from("places").select("categoria, nome, descrizione, maps_url, ordine").eq("guide_id", id),
  ]);
  if (sezioni?.length) await supabase.from("sections").insert(sezioni.map((s) => ({ ...s, guide_id: copia.id })));
  if (luoghi?.length) await supabase.from("places").insert(luoghi.map((l) => ({ ...l, guide_id: copia.id })));

  revalidatePath("/dashboard");
  redirect(`/guide/${copia.id}/modifica?duplicata=1`);
}

// ---------------------------------------------------------------------------
// Salvataggio dall'editor
// ---------------------------------------------------------------------------

const urlOpzionale = z
  .string()
  .max(1000)
  .refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "URL non valido")
  .nullable()
  .optional();

const salvataggioSchema = z.object({
  impostazioni: z.object({
    nome_struttura: z.string().trim().min(1, "Il nome della struttura è obbligatorio.").max(120),
    citta: z.string().trim().max(80),
    slug: z
      .string()
      .trim()
      .min(3, "Il link deve avere almeno 3 caratteri.")
      .max(80)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Il link può contenere solo lettere minuscole, numeri e trattini."),
    colore: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Colore non valido."),
    logo_url: urlOpzionale,
    cover_url: urlOpzionale,
    lingue_attive: z.array(z.enum(LINGUE)).min(1),
    contatto_nome: z.string().trim().max(80).nullable(),
    contatto_telefono: z.string().trim().max(30).nullable(),
    contatto_whatsapp: z.string().trim().max(30).nullable(),
  }),
  sezioni: z
    .array(
      z.object({
        id: z.uuid(),
        tipo: z.enum(TIPI_SEZIONE),
        ordine: z.number().int().min(0).max(100),
        attiva: z.boolean(),
        contenuto: z.partialRecord(z.enum(LINGUE), z.unknown()),
      }),
    )
    .max(TIPI_SEZIONE.length),
  luoghi: z
    .array(
      z.object({
        id: z.uuid(),
        categoria: z.enum(CATEGORIE_LUOGO),
        nome: z.string().max(120),
        descrizione: z.partialRecord(z.enum(LINGUE), z.string().max(1000)),
        maps_url: z.string().max(1000).nullable(),
        ordine: z.number().int().min(0),
      }),
    )
    .max(60),
});

export type DatiSalvataggio = z.infer<typeof salvataggioSchema>;

/** Salva impostazioni, sezioni e luoghi della guida in un colpo solo. */
export async function salvaGuida(guideId: string, dati: DatiSalvataggio): Promise<EsitoAzione> {
  const parsed = salvataggioSchema.safeParse(dati);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (JSON.stringify(dati).length > 500_000) return { ok: false, error: "La guida è troppo grande." };

  const { supabase } = await requireHost();
  const { impostazioni, sezioni, luoghi } = parsed.data;

  const { data: attuale } = await supabase.from("guides").select("slug, pagata").eq("id", guideId).maybeSingle();
  if (!attuale) return { ok: false, error: "Guida non trovata." };

  // Dopo il pagamento il link è stampato sui QR code: non si cambia più.
  const slug = attuale.pagata ? attuale.slug : impostazioni.slug;
  const lingue = impostazioni.lingue_attive.includes("it")
    ? impostazioni.lingue_attive
    : ["it" as const, ...impostazioni.lingue_attive];

  const { error: gErr } = await supabase
    .from("guides")
    .update({ ...impostazioni, slug, lingue_attive: lingue })
    .eq("id", guideId);
  if (gErr) {
    if (gErr.code === "23505") return { ok: false, error: "Questo link è già usato da un'altra guida: scegline un altro." };
    return { ok: false, error: "Salvataggio non riuscito. Controlla la connessione e riprova." };
  }

  if (sezioni.length) {
    const { error } = await supabase
      .from("sections")
      .upsert(sezioni.map((s) => ({ ...s, guide_id: guideId, contenuto: s.contenuto as Json })), { onConflict: "id" });
    if (error) return { ok: false, error: "Salvataggio delle sezioni non riuscito. Riprova." };
  }

  // Luoghi: aggiorna/inserisce quelli presenti, elimina quelli rimossi.
  const ids = luoghi.map((l) => l.id);
  const del = supabase.from("places").delete().eq("guide_id", guideId);
  const { error: delErr } = ids.length ? await del.not("id", "in", `(${ids.join(",")})`) : await del;
  if (delErr) return { ok: false, error: "Salvataggio dei consigli non riuscito. Riprova." };
  if (luoghi.length) {
    const { error } = await supabase.from("places").upsert(
      luoghi.map((l) => ({ ...l, guide_id: guideId })),
      { onConflict: "id" },
    );
    if (error) return { ok: false, error: "Salvataggio dei consigli non riuscito. Riprova." };
  }

  // Aggiorna subito la guida pubblica (anche il vecchio link, se è cambiato).
  revalidateTag(tagGuida(slug), { expire: 0 });
  if (slug !== attuale.slug) revalidateTag(tagGuida(attuale.slug), { expire: 0 });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Eliminazione
// ---------------------------------------------------------------------------

export async function eliminaGuida(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireHost();
  const { data } = await supabase.from("guides").delete().eq("id", id).select("slug").maybeSingle();
  if (data) revalidateTag(tagGuida(data.slug), { expire: 0 });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
