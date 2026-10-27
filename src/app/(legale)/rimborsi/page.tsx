import type { Metadata } from "next";
import { EmailContatto } from "@/components/email-contatto";
import { LEGALE } from "@/lib/legale";

export const metadata: Metadata = { title: "Politica di rimborso" };

export default function RimborsiPage() {
  return (
    <>
      <h1>Politica di rimborso</h1>
      <p className="aggiornato">Ultimo aggiornamento: {LEGALE.aggiornamento}</p>

      <h2>Rimborso entro {LEGALE.giorniRimborso} giorni, senza domande</h2>
      <p>
        Se non sei soddisfatto puoi chiedere il rimborso integrale di {LEGALE.prezzo} entro {LEGALE.giorniRimborso} giorni
        dal pagamento della pubblicazione di una guida, senza dover indicare il motivo.
      </p>

      <h2>Come chiederlo</h2>
      <ul>
        <li>
          Scrivi a <EmailContatto /> dall&apos;indirizzo email del tuo account, indicando il nome della guida.
        </li>
        <li>Ti confermiamo la richiesta entro 3 giorni lavorativi.</li>
        <li>
          Il rimborso viene effettuato sullo stesso metodo di pagamento usato, tramite Stripe. L&apos;accredito richiede di
          solito 5–10 giorni lavorativi, a seconda della banca.
        </li>
      </ul>

      <h2>Cosa succede alla guida</h2>
      <p>
        Dopo il rimborso la guida torna in bozza: il link e il QR code smettono di funzionare per gli ospiti, ma tu conservi
        tutti i contenuti e puoi ripubblicarla in futuro.
      </p>

      <h2>Dopo {LEGALE.giorniRimborso} giorni</h2>
      <p>
        Trascorsi {LEGALE.giorniRimborso} giorni dal pagamento il servizio si considera pienamente fruito e il rimborso non è
        più dovuto, salvo malfunzionamenti del Servizio che ti abbiano impedito di usarlo e che non siamo riusciti a
        risolvere.
      </p>
    </>
  );
}
