import { Copy, ListChecks, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { aiConfigurata } from "@/lib/ai";
import { requireHost } from "@/lib/auth";
import { duplicaGuida } from "@/lib/guide-actions";
import { listMyGuides } from "@/lib/guides";

export const metadata: Metadata = { title: "Nuova guida" };

export default async function NuovaGuidaPage({ searchParams }: PageProps<"/guide/nuova">) {
  const { errore } = await searchParams;
  const { supabase, host } = await requireHost();
  const guide = await listMyGuides(supabase, host.id);
  const aiDisponibile = aiConfigurata();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Crea una nuova guida</h1>
      <p className="mt-2 text-grigio">Scegli come iniziare. Potrai sempre modificare tutto nell&apos;editor.</p>

      {errore === "duplica" && (
        <Alert tone="error" className="mt-6">
          Non è stato possibile duplicare la guida. Riprova.
        </Alert>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/guide/nuova/wizard" className="group">
          <Card className="h-full p-6 transition-shadow group-hover:shadow-lg">
            <span className="flex size-12 items-center justify-center rounded-full bg-oliva-chiaro text-oliva">
              <ListChecks className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-serif text-xl font-semibold">Procedura guidata</h2>
            <p className="mt-2 text-grigio">
              Poche domande semplici, una sezione alla volta: indirizzo, Wi-Fi, raccolta differenziata, tassa di soggiorno…
              Circa 5 minuti.
            </p>
            <span className="mt-4 inline-block font-medium text-terracotta group-hover:underline">Inizia →</span>
          </Card>
        </Link>

        {aiDisponibile ? (
          <Link href="/guide/nuova/ai" className="group">
            <Card className="h-full border-terracotta/30 p-6 transition-shadow group-hover:shadow-lg">
              <span className="flex size-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                <Sparkles className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 flex items-center gap-2 font-serif text-xl font-semibold">
                Genera con l&apos;AI <Badge tone="success">Più veloce</Badge>
              </h2>
              <p className="mt-2 text-grigio">
                Incolla il testo del tuo annuncio Airbnb o Booking: prepariamo una bozza completa di tutte le sezioni in meno
                di un minuto.
              </p>
              <span className="mt-4 inline-block font-medium text-terracotta group-hover:underline">Genera la bozza →</span>
            </Card>
          </Link>
        ) : (
          <Card className="h-full p-6 opacity-70">
            <span className="flex size-12 items-center justify-center rounded-full bg-sabbia text-grigio">
              <Sparkles className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 flex items-center gap-2 font-serif text-xl font-semibold">
              Genera con l&apos;AI <Badge>Non configurata</Badge>
            </h2>
            <p className="mt-2 text-grigio">
              Imposta la variabile <code className="rounded bg-sabbia px-1">ANTHROPIC_API_KEY</code> per generare la guida dal
              testo del tuo annuncio.
            </p>
          </Card>
        )}
      </div>

      {guide.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Copy className="size-5 text-grigio" aria-hidden="true" /> Oppure duplica una guida esistente
          </h2>
          <p className="mt-1 text-grigio">Perfetto se hai più appartamenti nella stessa zona: cambi solo ciò che è diverso.</p>
          <ul className="mt-4 divide-y divide-bordo rounded-2xl border border-bordo bg-white">
            {guide.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{g.nome_struttura}</p>
                  <p className="text-sm text-grigio">{g.citta}</p>
                </div>
                <form action={duplicaGuida}>
                  <input type="hidden" name="id" value={g.id} />
                  <SubmitButton variant="secondary" size="sm">
                    Duplica
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
