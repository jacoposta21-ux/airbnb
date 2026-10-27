import type { Metadata } from "next";
import { EmailContatto } from "@/components/email-contatto";
import { APP_NAME } from "@/lib/config";
import { LEGALE } from "@/lib/legale";

export const metadata: Metadata = { title: "Privacy e cookie" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Informativa privacy e cookie</h1>
      <p className="aggiornato">Ultimo aggiornamento: {LEGALE.aggiornamento}</p>

      <p>
        Questa informativa spiega come {APP_NAME} tratta i dati personali, ai sensi del Regolamento (UE) 2016/679 (“GDPR”) e
        del D.Lgs. 196/2003.
      </p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        {LEGALE.titolare}
        {LEGALE.sede && `, ${LEGALE.sede}`}
        {LEGALE.partitaIva && `, P.IVA ${LEGALE.partitaIva}`}. Per qualsiasi richiesta sulla privacy: <EmailContatto />.
      </p>

      <h2>2. Quali dati trattiamo</h2>
      <p>
        <strong>Host (chi crea le guide)</strong>
      </p>
      <ul>
        <li>Dati dell&apos;account: email, nome, e — se lo inserisci — numero di telefono. Con l&apos;accesso tramite Google riceviamo nome ed email del tuo account Google.</li>
        <li>Contenuti delle guide: testi, foto, indirizzo della struttura, contatti che scegli di mostrare agli ospiti.</li>
        <li>Dati di pagamento: importo, data ed esito. I dati della carta sono trattati esclusivamente da Stripe.</li>
        <li>Testi che invii alle funzioni di intelligenza artificiale (per esempio il testo del tuo annuncio).</li>
      </ul>
      <p>
        <strong>Ospiti (chi consulta una guida)</strong>
      </p>
      <ul>
        <li>
          Non chiediamo registrazione né dati personali. Registriamo solo statistiche anonime: quale guida e quali sezioni
          vengono aperte e in che giorno, senza indirizzo IP né identificativi della persona.
        </li>
        <li>Come ogni sito, i server di hosting conservano per breve tempo log tecnici (es. indirizzo IP) per sicurezza e funzionamento.</li>
      </ul>

      <h2>3. Perché e su quale base giuridica</h2>
      <ul>
        <li>Fornire il Servizio, gestire l&apos;account e i pagamenti: esecuzione del contratto (art. 6.1.b GDPR).</li>
        <li>Adempimenti fiscali e contabili: obbligo di legge (art. 6.1.c).</li>
        <li>Sicurezza, prevenzione degli abusi e statistiche anonime d&apos;uso: legittimo interesse (art. 6.1.f).</li>
      </ul>
      <p>Non usiamo i dati per pubblicità, profilazione o vendita a terzi.</p>

      <h2>4. Fornitori che trattano i dati per nostro conto</h2>
      <ul>
        <li><strong>Supabase</strong> — database, autenticazione e archivio delle foto (server nell&apos;Unione Europea, Francoforte).</li>
        <li><strong>Vercel</strong> — hosting del sito.</li>
        <li><strong>Stripe</strong> — pagamenti.</li>
        <li><strong>Anthropic</strong> — elaborazione dei testi per generazione e traduzione con intelligenza artificiale.</li>
        <li><strong>Google</strong> — solo se scegli l&apos;accesso con Google.</li>
      </ul>
      <p>
        Alcuni di questi fornitori possono trattare dati negli Stati Uniti: il trasferimento avviene sulla base del Data
        Privacy Framework UE-USA o delle Clausole contrattuali standard approvate dalla Commissione europea.
      </p>

      <h2>5. Per quanto tempo</h2>
      <ul>
        <li>Account e guide: finché l&apos;account è attivo. Alla chiusura vengono cancellati entro 30 giorni.</li>
        <li>Dati dei pagamenti: 10 anni, come previsto dalla normativa fiscale.</li>
        <li>Statistiche anonime delle visite: finché esiste la guida.</li>
      </ul>

      <h2>6. I tuoi diritti</h2>
      <p>
        Puoi chiedere in qualsiasi momento accesso, rettifica, cancellazione, limitazione, portabilità dei tuoi dati e opporti
        al trattamento (artt. 15–22 GDPR), scrivendo a <EmailContatto />. Hai anche il diritto di proporre reclamo al Garante
        per la protezione dei dati personali (www.garanteprivacy.it).
      </p>

      <h2>7. Cookie e archiviazione locale</h2>
      <p>
        Usiamo solo strumenti <strong>tecnici</strong>, necessari al funzionamento del sito, per i quali non serve il consenso:
      </p>
      <ul>
        <li>cookie di sessione per mantenere l&apos;accesso degli host all&apos;area riservata;</li>
        <li>archiviazione temporanea del browser (sessionStorage) per non contare due volte la stessa visita a una guida;</li>
        <li>una copia della guida salvata sul dispositivo dell&apos;ospite, per poterla riaprire anche senza connessione.</li>
      </ul>
      <p>Non usiamo cookie di profilazione, pubblicitari o di analisi di terze parti.</p>

      <h2>8. Dati inseriti dagli host nelle guide</h2>
      <p>
        Se un host inserisce in una guida dati personali (per esempio il proprio numero di telefono), lo fa sotto la propria
        responsabilità e per comunicarli ai propri ospiti. Le guide non vengono indicizzate dai motori di ricerca, ma sono
        visibili a chiunque abbia il link o il QR code.
      </p>
    </>
  );
}
