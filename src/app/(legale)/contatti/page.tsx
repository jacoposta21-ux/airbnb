import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { LEGALE } from "@/lib/legale";

export const metadata: Metadata = { title: "Contatti" };

export default function ContattiPage() {
  return (
    <>
      <h1>Contatti</h1>
      <p>
        {APP_NAME} è un servizio di {LEGALE.titolare}
        {LEGALE.sede && `, ${LEGALE.sede}`}
        {LEGALE.partitaIva && ` · P.IVA ${LEGALE.partitaIva}`}.
      </p>

      <h2>Assistenza, privacy e rimborsi</h2>
      {LEGALE.email ? (
        <p>
          Scrivici a <a href={`mailto:${LEGALE.email}`}>{LEGALE.email}</a>: rispondiamo entro 2 giorni lavorativi.
        </p>
      ) : (
        <p>L&apos;indirizzo email di assistenza sarà pubblicato a breve.</p>
      )}

      <h2>Sei un ospite?</h2>
      <p>
        Per informazioni sull&apos;appartamento (check-in, chiavi, problemi in casa) contatta direttamente il tuo host: trovi
        i pulsanti “Chiama” e “WhatsApp” in cima alla guida. Noi forniamo solo lo strumento con cui l&apos;host ha creato la
        guida.
      </p>

      <p>
        Vedi anche: <Link href="/termini">Termini di servizio</Link> · <Link href="/privacy">Privacy e cookie</Link> ·{" "}
        <Link href="/rimborsi">Rimborsi</Link>
      </p>
    </>
  );
}
