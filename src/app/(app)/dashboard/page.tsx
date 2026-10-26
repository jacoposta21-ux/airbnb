import { Plus, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { GuideCard } from "@/components/dashboard/guide-card";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireHost } from "@/lib/auth";
import { PREZZO_GUIDA_LABEL } from "@/lib/config";
import { listMyGuides } from "@/lib/guides";

export const metadata: Metadata = { title: "Le mie guide" };

export default async function DashboardPage() {
  const { supabase, host } = await requireHost();
  const guide = await listMyGuides(supabase, host.id);
  const nome = host.nome?.split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">{nome ? `Ciao ${nome}` : "Le tue guide"}</h1>
          <p className="mt-1 text-grigio">
            {guide.length === 0
              ? "Non hai ancora creato nessuna guida."
              : `Hai ${guide.length} ${guide.length === 1 ? "guida" : "guide"}.`}
          </p>
        </div>
        {guide.length > 0 && (
          <ButtonLink href="/guide/nuova" icon={<Plus className="size-4" />}>
            Nuova guida
          </ButtonLink>
        )}
      </div>

      {guide.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
            <Sparkles className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-semibold">Crea la tua prima guida</h2>
          <p className="mt-2 max-w-md text-grigio">
            Rispondi a poche domande oppure incolla il testo del tuo annuncio: prepariamo noi una bozza completa,
            con raccolta differenziata, tassa di soggiorno e consigli locali.
          </p>
          <ButtonLink href="/guide/nuova" size="lg" className="mt-6" icon={<Plus className="size-5" />}>
            Inizia ora, è gratis
          </ButtonLink>
          <p className="mt-3 text-sm text-grigio">Paghi {PREZZO_GUIDA_LABEL} una tantum solo quando pubblichi.</p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guide.map((g) => (
            <GuideCard key={g.id} guida={g} />
          ))}
        </div>
      )}
    </div>
  );
}
