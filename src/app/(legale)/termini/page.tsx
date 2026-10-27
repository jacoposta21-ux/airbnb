import type { Metadata } from "next";
import Link from "next/link";
import { EmailContatto } from "@/components/email-contatto";
import { APP_NAME } from "@/lib/config";
import { LEGALE } from "@/lib/legale";

export const metadata: Metadata = { title: "Termini di servizio" };

export default function TerminiPage() {
  return (
    <>
      <h1>Termini di servizio</h1>
      <p className="aggiornato">Ultimo aggiornamento: {LEGALE.aggiornamento}</p>

      <p>
        Questi termini regolano l&apos;uso di {APP_NAME} (il “Servizio”), offerto da {LEGALE.titolare}
        {LEGALE.sede && `, ${LEGALE.sede}`}
        {LEGALE.partitaIva && `, P.IVA ${LEGALE.partitaIva}`} (il “Titolare”). Creando un account accetti questi termini.
      </p>

      <h2>1. Il Servizio</h2>
      <p>
        {APP_NAME} permette a chi gestisce affitti brevi (l&apos;“Host”) di creare una guida digitale per i propri ospiti,
        consultabile tramite link e QR code, con funzioni di traduzione e generazione dei testi tramite intelligenza
        artificiale.
      </p>

      <h2>2. Account</h2>
      <ul>
        <li>Per usare il Servizio serve un account, personale e non cedibile. Sei responsabile della riservatezza delle credenziali.</li>
        <li>Devi fornire dati veritieri e avere almeno 18 anni.</li>
        <li>Puoi chiedere la chiusura dell&apos;account in qualsiasi momento scrivendo a <EmailContatto />.</li>
      </ul>

      <h2>3. Prezzo e pagamento</h2>
      <ul>
        <li>Creare e modificare una guida in bozza è gratuito.</li>
        <li>
          La pubblicazione di ogni guida costa <strong>{LEGALE.prezzo}</strong> una tantum, prezzo finale. Non ci sono
          abbonamenti né rinnovi automatici.
        </li>
        <li>Il pagamento avviene tramite Stripe; il Titolare non riceve né conserva i dati della tua carta.</li>
        <li>
          Una guida pubblicata resta online finché il Servizio è attivo, con modifiche illimitate. Puoi metterla offline e
          riattivarla senza costi aggiuntivi.
        </li>
      </ul>

      <h2>4. Diritto di recesso e rimborsi</h2>
      <p>
        Puoi chiedere il rimborso integrale entro {LEGALE.giorniRimborso} giorni dal pagamento, senza indicarne il motivo.
        I dettagli sono nella pagina <Link href="/rimborsi">Rimborsi</Link>.
      </p>

      <h2>5. I tuoi contenuti</h2>
      <ul>
        <li>I testi, le foto e i dati che inserisci nelle guide restano tuoi. Concedi al Titolare il diritto di ospitarli e mostrarli agli ospiti a cui condividi il link, solo per fornire il Servizio.</li>
        <li>
          Sei l&apos;unico responsabile dei contenuti pubblicati e della loro correttezza: istruzioni di accesso, regole,
          importi della tassa di soggiorno, orari della ZTL e della raccolta differenziata, codice CIN e ogni altro obbligo
          di legge legato alla tua attività ricettiva.
        </li>
        <li>Non puoi pubblicare contenuti illeciti, offensivi, che violino diritti di terzi o che inducano in errore gli ospiti.</li>
        <li>Chiunque abbia il link o il QR code può vedere la guida: valuta tu quali informazioni inserire (per esempio la password del Wi-Fi).</li>
      </ul>

      <h2>6. Testi generati con intelligenza artificiale</h2>
      <p>
        Le funzioni di generazione e traduzione producono testi automatici che possono contenere errori o imprecisioni.
        Prima di pubblicarli devi rileggerli e correggerli: il Titolare non garantisce la correttezza dei testi generati.
      </p>

      <h2>7. Disponibilità del Servizio</h2>
      <p>
        Il Titolare si impegna a mantenere il Servizio disponibile e sicuro, ma non può garantirne il funzionamento continuo
        e senza errori. Possono esserci interruzioni per manutenzione o per cause non dipendenti dal Titolare (fornitori di
        hosting, rete, forza maggiore).
      </p>

      <h2>8. Responsabilità</h2>
      <p>
        Nei limiti consentiti dalla legge, la responsabilità del Titolare verso l&apos;Host è limitata all&apos;importo
        pagato per la guida interessata. Resta ferma la responsabilità per dolo o colpa grave e quanto previsto dal Codice
        del Consumo per i consumatori.
      </p>

      <h2>9. Sospensione e chiusura</h2>
      <p>
        Il Titolare può sospendere o rimuovere guide o account che violano questi termini, dopo averti avvisato quando
        possibile. Se il Servizio dovesse cessare, il Titolare ti avviserà con almeno 30 giorni di anticipo.
      </p>

      <h2>10. Modifiche ai termini</h2>
      <p>
        Il Titolare può aggiornare questi termini; le modifiche rilevanti ti verranno comunicate via email o all&apos;accesso.
        Le condizioni economiche già pagate non cambiano.
      </p>

      <h2>11. Legge applicabile</h2>
      <p>
        Si applica la legge italiana. Per i consumatori è competente il foro del luogo di residenza o domicilio del
        consumatore. Il consumatore può anche ricorrere alla piattaforma europea per la risoluzione delle controversie
        online (ODR).
      </p>

      <h2>12. Contatti</h2>
      <p>
        Per qualsiasi domanda scrivi a <EmailContatto />.
      </p>
    </>
  );
}
