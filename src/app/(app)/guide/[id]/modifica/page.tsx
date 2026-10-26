import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideEditor } from "@/components/editor/guide-editor";
import { requireHost } from "@/lib/auth";
import { loadGuidaCompleta } from "@/lib/guides";
import { CATALOGO_SEZIONI, contenutoPredefinito } from "@/lib/sections";
import type { GuidaCompleta, Sezione } from "@/types/guide";

export const metadata: Metadata = { title: "Modifica guida" };

const AVVISI: Record<string, string> = {
  duplicata: "Guida duplicata! Ricordati di aggiornare indirizzo, istruzioni di arrivo, Wi-Fi e codice CIN.",
  creata: "La tua guida è pronta. Completa le sezioni: le modifiche si salvano da sole.",
};

export default async function ModificaGuidaPage({ params, searchParams }: PageProps<"/guide/[id]/modifica">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { supabase, host } = await requireHost();

  const guida = await loadGuidaCompleta(supabase, { id }).catch(() => null);
  if (!guida || guida.host_id !== host.id) notFound();

  // Aggiunge eventuali sezioni mancanti (es. tipi introdotti dopo la creazione).
  const presenti = new Set(guida.sezioni.map((s) => s.tipo));
  const mancanti: Sezione[] = CATALOGO_SEZIONI.filter((c) => !presenti.has(c.tipo)).map((c, i) => ({
    id: crypto.randomUUID(),
    tipo: c.tipo,
    ordine: guida.sezioni.length + i,
    attiva: false,
    contenuto: { it: contenutoPredefinito(c.tipo) },
  }));

  const { host_id: _hostId, ...resto } = guida;
  void _hostId;
  const completa: GuidaCompleta = { ...resto, sezioni: [...guida.sezioni, ...mancanti] };

  const avviso = Object.keys(AVVISI).find((k) => query[k] !== undefined);

  return <GuideEditor guidaIniziale={completa} hostId={host.id} avviso={avviso ? AVVISI[avviso] : undefined} />;
}
