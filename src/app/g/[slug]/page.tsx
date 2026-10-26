import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/guide/guide-view";
import { scegliLingua } from "@/lib/i18n";
import { risolviGuida } from "@/lib/public-guide";
import { DIZIONARI } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/g/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const risultato = await risolviGuida(slug);
  if (!risultato) return { title: "Guida non trovata", robots: { index: false } };

  const { guida, tipo } = risultato;
  return {
    title: { absolute: `${guida.nome_struttura}${guida.citta ? ` · ${guida.citta}` : ""}` },
    description: `${DIZIONARI.it.sezioni.benvenuto}! Guida per gli ospiti di ${guida.nome_struttura}.`,
    // Le guide non pagate (anteprime) non vanno mai indicizzate.
    robots: tipo === "pubblica" ? { index: true, follow: false } : { index: false, follow: false },
    openGraph: guida.cover_url ? { images: [guida.cover_url] } : undefined,
  };
}

export default async function GuidaPubblicaPage({ params, searchParams }: PageProps<"/g/[slug]">) {
  const [{ slug }, query, h] = await Promise.all([params, searchParams, headers()]);
  const risultato = await risolviGuida(slug);
  if (!risultato) notFound();

  const { guida, tipo } = risultato;
  const lingua = scegliLingua(
    guida.lingue_attive,
    typeof query.lang === "string" ? query.lang : null,
    h.get("accept-language"),
  );

  return (
    <GuideView
      guida={guida}
      linguaIniziale={lingua}
      filigrana={tipo === "anteprima"}
      tracciaVisite={tipo === "pubblica"}
    />
  );
}
