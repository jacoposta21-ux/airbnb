import type { Metadata } from "next";
import { AiForm } from "@/components/wizard/ai-form";
import { Alert } from "@/components/ui/alert";
import { aiConfigurata } from "@/lib/ai";
import { requireHost } from "@/lib/auth";

export const metadata: Metadata = { title: "Genera la guida con l'AI" };

// La generazione può richiedere fino a un paio di minuti.
export const maxDuration = 300;

export default async function GeneraAIPage() {
  const { host } = await requireHost();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Genera la guida con l&apos;AI</h1>
      <p className="mt-2 text-grigio">
        Incolla il testo del tuo annuncio Airbnb o Booking e aggiungi qualche informazione chiave: prepariamo una bozza completa
        di tutte le sezioni, che potrai rivedere e correggere nell&apos;editor.
      </p>
      {aiConfigurata() ? (
        <AiForm telefonoHost={host.telefono ?? ""} />
      ) : (
        <Alert tone="error" className="mt-8">
          L&apos;AI non è configurata. Imposta la variabile <code>ANTHROPIC_API_KEY</code> (vedi README).
        </Alert>
      )}
    </div>
  );
}
