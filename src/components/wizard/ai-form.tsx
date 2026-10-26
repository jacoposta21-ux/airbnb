"use client";

import { Sparkles } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { generaGuidaAI, type StatoGenerazione } from "@/lib/ai-actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

const MESSAGGI_ATTESA = [
  "Leggiamo il tuo annuncio…",
  "Scriviamo il messaggio di benvenuto…",
  "Prepariamo le istruzioni della casa…",
  "Sistemiamo la raccolta differenziata…",
  "Aggiungiamo i numeri utili…",
  "Ultimi ritocchi…",
];

/** Messaggi che cambiano durante l'attesa, per far capire che il lavoro procede. */
function Attesa() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, MESSAGGI_ATTESA.length - 1)), 7000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center py-10 text-center" role="status" aria-live="polite">
      <Spinner className="size-8 text-terracotta" />
      <p className="mt-4 font-serif text-xl font-semibold">{MESSAGGI_ATTESA[i]}</p>
      <p className="mt-1 text-sm text-grigio">Di solito ci vuole meno di un minuto. Non chiudere la pagina.</p>
    </div>
  );
}

export function AiForm({ telefonoHost }: { telefonoHost: string }) {
  const [state, action, pending] = useActionState<StatoGenerazione, FormData>(generaGuidaAI, {});

  return (
    <Card className="mt-8 p-6 sm:p-8">
      {pending ? (
        <Attesa />
      ) : (
        <form action={action} className="space-y-5">
          <Field
            label="Testo dell'annuncio"
            htmlFor="annuncio"
            hint="Copia descrizione, servizi, regole della casa e informazioni sul quartiere dalla pagina del tuo annuncio."
          >
            <Textarea id="annuncio" name="annuncio" rows={10} required minLength={80} maxLength={15000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome della struttura" htmlFor="nome_struttura">
              <Input id="nome_struttura" name="nome_struttura" required />
            </Field>
            <Field label="Città" htmlFor="citta">
              <Input id="citta" name="citta" required />
            </Field>
          </div>
          <Field label="Indirizzo" htmlFor="indirizzo">
            <Input id="indirizzo" name="indirizzo" placeholder="Via, numero civico, CAP, città" />
          </Field>
          <details className="rounded-xl border border-bordo p-4">
            <summary className="cursor-pointer font-medium">Altre informazioni (facoltative, ma rendono la guida più precisa)</summary>
            <div className="mt-4 space-y-5">
              <Field label="Telefono / WhatsApp" htmlFor="contatto_telefono">
                <Input id="contatto_telefono" name="contatto_telefono" type="tel" defaultValue={telefonoHost} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Rete Wi-Fi" htmlFor="wifi_rete">
                  <Input id="wifi_rete" name="wifi_rete" className="font-mono" />
                </Field>
                <Field label="Password Wi-Fi" htmlFor="wifi_password">
                  <Input id="wifi_password" name="wifi_password" className="font-mono" />
                </Field>
                <Field label="Orario di check-in" htmlFor="orario_checkin">
                  <Input id="orario_checkin" name="orario_checkin" placeholder="Dalle 15:00" />
                </Field>
                <Field label="Orario di check-out" htmlFor="orario_checkout">
                  <Input id="orario_checkout" name="orario_checkout" placeholder="Entro le 10:00" />
                </Field>
              </div>
              <Field label="Altro da sapere" htmlFor="note" hint="Es. come si entra, giorni della raccolta, tassa di soggiorno, parcheggio.">
                <Textarea id="note" name="note" rows={4} maxLength={3000} />
              </Field>
            </div>
          </details>

          {state.error && <Alert tone="error">{state.error}</Alert>}

          <Button type="submit" size="lg" className="w-full" icon={<Sparkles className="size-5" />}>
            Genera la bozza
          </Button>
          <p className="text-center text-xs text-grigio">
            L&apos;AI usa solo le informazioni che fornisci: i dati mancanti (codice CIN, password…) restano da completare.
          </p>
        </form>
      )}
    </Card>
  );
}
