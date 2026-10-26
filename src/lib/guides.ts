import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, GuideRow, PlaceRow, SectionRow } from "@/types/database";
import type { Guida, GuidaCompleta, Lingua, Luogo, Sezione } from "@/types/guide";

type Client = SupabaseClient<Database>;

/** Campi della guida mostrati nella dashboard. */
export type GuidaRiepilogo = Pick<
  GuideRow,
  "id" | "slug" | "nome_struttura" | "citta" | "stato" | "pagata" | "colore" | "cover_url" | "aggiornato_il" | "lingue_attive"
>;

/** Elenco delle guide dell'host loggato (la RLS filtra per host). */
export async function listMyGuides(supabase: Client, hostId: string): Promise<GuidaRiepilogo[]> {
  const { data, error } = await supabase
    .from("guides")
    .select("id, slug, nome_struttura, citta, stato, pagata, colore, cover_url, aggiornato_il, lingue_attive")
    .eq("host_id", hostId)
    .order("aggiornato_il", { ascending: false });
  if (error) throw new Error(`Impossibile caricare le guide: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// Conversione righe DB → tipi di dominio
// ---------------------------------------------------------------------------

export function toGuida(row: GuideRow): Guida {
  return {
    id: row.id,
    slug: row.slug,
    nome_struttura: row.nome_struttura,
    citta: row.citta,
    stato: row.stato,
    pagata: row.pagata,
    colore: row.colore,
    logo_url: row.logo_url,
    cover_url: row.cover_url,
    lingue_attive: row.lingue_attive as Lingua[],
    contatto_nome: row.contatto_nome,
    contatto_telefono: row.contatto_telefono,
    contatto_whatsapp: row.contatto_whatsapp,
  };
}

export function toSezione(row: SectionRow): Sezione {
  return {
    id: row.id,
    tipo: row.tipo,
    ordine: row.ordine,
    attiva: row.attiva,
    contenuto: (row.contenuto ?? {}) as Sezione["contenuto"],
  };
}

export function toLuogo(row: PlaceRow): Luogo {
  return {
    id: row.id,
    categoria: row.categoria,
    nome: row.nome,
    descrizione: (row.descrizione ?? {}) as Luogo["descrizione"],
    maps_url: row.maps_url,
    ordine: row.ordine,
  };
}

/** Carica guida + sezioni + luoghi. Restituisce null se non esiste o non è visibile. */
export async function loadGuidaCompleta(
  supabase: Client,
  filtro: { id: string } | { slug: string },
): Promise<(GuidaCompleta & { host_id: string }) | null> {
  const query = supabase.from("guides").select("*");
  const { data: guide, error } = await ("id" in filtro ? query.eq("id", filtro.id) : query.eq("slug", filtro.slug)).maybeSingle();
  if (error) throw new Error(`Impossibile caricare la guida: ${error.message}`);
  if (!guide) return null;

  const [sezioni, luoghi] = await Promise.all([
    supabase.from("sections").select("*").eq("guide_id", guide.id).order("ordine"),
    supabase.from("places").select("*").eq("guide_id", guide.id).order("ordine"),
  ]);
  if (sezioni.error) throw new Error(sezioni.error.message);
  if (luoghi.error) throw new Error(luoghi.error.message);

  return {
    ...toGuida(guide),
    host_id: guide.host_id,
    sezioni: sezioni.data.map(toSezione),
    luoghi: luoghi.data.map(toLuogo),
  };
}
