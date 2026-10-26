import {
  BadgeEuro,
  Car,
  Check,
  Copy,
  Languages,
  ListChecks,
  MessageCircleOff,
  QrCode,
  Receipt,
  Recycle,
  Siren,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { GuideView } from "@/components/guide/guide-view";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/phone-mockup";
import { ButtonLink } from "@/components/ui/button";
import { DEMO_GUIDE } from "@/data/demo-guide";
import { APP_NAME, DEMO_SLUG, PREZZO_GUIDA_LABEL } from "@/lib/config";

const VANTAGGI = [
  {
    icon: MessageCircleOff,
    titolo: "Meno messaggi alle 23",
    testo: "Wi-Fi, check-in, spazzatura, parcheggio: gli ospiti trovano tutto da soli, nella loro lingua.",
  },
  {
    icon: Star,
    titolo: "Recensioni migliori",
    testo: "Un arrivo senza intoppi e consigli locali autentici fanno la differenza sulle 5 stelle.",
  },
  {
    icon: Smartphone,
    titolo: "Pronta in pochi minuti",
    testo: "Niente editor vuoto: parti da una bozza già scritta e pensata per gli affitti brevi in Italia.",
  },
];

const SEZIONI_ITALIANE = [
  {
    icon: Recycle,
    titolo: "Raccolta differenziata",
    testo: "Colori dei contenitori, cosa va dove, giorni e punto di raccolta: spiegati in modo chiaro, anche a chi non parla italiano.",
  },
  {
    icon: Receipt,
    titolo: "Tassa di soggiorno e CIN",
    testo: "Importo, esenzioni, come pagare e il Codice Identificativo Nazionale, sempre in vista.",
  },
  {
    icon: Car,
    titolo: "Parcheggio e ZTL",
    testo: "Un avviso ben visibile sulla Zona a Traffico Limitato: niente più multe a sorpresa per i tuoi ospiti.",
  },
  {
    icon: Siren,
    titolo: "Emergenze",
    testo: "112, guardia medica, farmacia di turno e ospedale più vicino, con chiamata diretta.",
  },
];

const MODI = [
  {
    icon: ListChecks,
    titolo: "Procedura guidata",
    testo: "Rispondi a poche domande, una sezione alla volta. Il resto è già scritto.",
  },
  {
    icon: Sparkles,
    titolo: "Generazione con AI",
    testo: "Incolla il testo del tuo annuncio Airbnb o Booking: ottieni una bozza completa di tutte le sezioni.",
  },
  {
    icon: Copy,
    titolo: "Duplica",
    testo: "Hai più appartamenti? Duplica una guida e cambia solo indirizzo, Wi-Fi e dettagli.",
  },
];

const INCLUSO = [
  "Tutte le 11 sezioni, attivabili e riordinabili",
  "Traduzione in inglese, francese, tedesco e spagnolo",
  "Link condivisibile e QR code in PNG",
  "Cartello A5 stampabile in PDF",
  "Modifiche illimitate, per sempre",
  "Statistiche delle visite",
];

const FAQ = [
  {
    d: "Devo pagare un abbonamento?",
    r: `No. Crei e modifichi la bozza gratis, con anteprima completa. Paghi ${PREZZO_GUIDA_LABEL} una volta sola per ogni guida, solo quando decidi di pubblicarla. Nessun rinnovo.`,
  },
  {
    d: "Gli ospiti devono scaricare un'app o registrarsi?",
    r: "No. Aprono un semplice link (o inquadrano il QR code) dal telefono. La guida si carica velocemente anche con connessione scarsa.",
  },
  {
    d: "In che lingue è disponibile la guida?",
    r: "Scrivi in italiano e con un clic la guida viene tradotta in inglese, francese, tedesco e spagnolo. L'ospite la vede nella lingua del suo telefono e può cambiarla quando vuole. Ogni traduzione resta modificabile a mano.",
  },
  {
    d: "Posso modificare la guida dopo averla pubblicata?",
    r: "Sì, quante volte vuoi. Il link e il QR code restano gli stessi, quindi non devi ristampare nulla.",
  },
  {
    d: "Ho più appartamenti: devo rifare tutto da capo?",
    r: "No: duplica una guida esistente e cambia solo ciò che è diverso. Ogni guida pubblicata costa " + PREZZO_GUIDA_LABEL + ".",
  },
  {
    d: "Cosa vedono gli ospiti prima che io paghi?",
    r: "Niente: finché non pubblichi, la guida è visibile solo a te, con la scritta “anteprima”. E anche dopo la pubblicazione nessuna guida finisce su Google: la vede solo chi ha il link o il QR code.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-bordo/60 bg-crema/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-medium">
            <a href="#come-funziona" className="hidden rounded-full px-3 py-2 hover:bg-sabbia md:block">
              Come funziona
            </a>
            <a href="#prezzo" className="hidden rounded-full px-3 py-2 hover:bg-sabbia md:block">
              Prezzo
            </a>
            <a href="#faq" className="hidden rounded-full px-3 py-2 hover:bg-sabbia md:block">
              Domande
            </a>
            <ButtonLink href="/login" variant="ghost" size="sm">
              Accedi
            </ButtonLink>
            <ButtonLink href="/registrati" size="sm">
              Prova gratis
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3 py-1 text-sm font-medium text-terracotta">
              🇮🇹 Pensata per gli host italiani
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              La guida per i tuoi ospiti, pronta in pochi minuti.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-grigio">
              {APP_NAME} crea una guida digitale per il tuo affitto breve: check-in, Wi-Fi, raccolta differenziata, tassa di
              soggiorno, consigli locali. Tradotta in 5 lingue, condivisibile con un link e un QR code.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/registrati" size="lg">
                Crea la tua guida gratis
              </ButtonLink>
              <ButtonLink href={`/g/${DEMO_SLUG}`} size="lg" variant="secondary">
                Guarda un esempio
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-grigio">
              {["Bozza gratuita", `${PREZZO_GUIDA_LABEL} una tantum`, "Nessun abbonamento"].map((x) => (
                <li key={x} className="flex items-center gap-1.5">
                  <Check className="size-4 text-oliva" aria-hidden="true" /> {x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <PhoneMockup>
              <GuideView guida={DEMO_GUIDE} incorporata />
            </PhoneMockup>
            <p className="mt-4 text-center text-sm text-grigio">
              Prova la guida d&apos;esempio: è interattiva. ↑
            </p>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="border-y border-bordo/60 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
            {VANTAGGI.map((v) => (
              <div key={v.titolo}>
                <v.icon className="size-7 text-terracotta" aria-hidden="true" />
                <h2 className="mt-3 font-serif text-xl font-semibold">{v.titolo}</h2>
                <p className="mt-2 leading-relaxed text-grigio">{v.testo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sezioni italiane */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Quello che gli altri strumenti non sanno dell&apos;Italia</h2>
            <p className="mt-4 text-lg text-grigio">
              Le guide generiche nascono per altri Paesi. La nostra parte da ciò che serve davvero a chi affitta in Italia.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {SEZIONI_ITALIANE.map((s) => (
              <div key={s.titolo} className="flex gap-4 rounded-2xl border border-bordo bg-white p-6 shadow-morbida">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-oliva-chiaro text-oliva">
                  <s.icon className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold">{s.titolo}</h3>
                  <p className="mt-1 leading-relaxed text-grigio">{s.testo}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Come funziona */}
        <section id="come-funziona" className="scroll-mt-20 bg-sabbia/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Tre modi per iniziare</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {MODI.map((m) => (
                <div key={m.titolo} className="rounded-2xl bg-white p-6 shadow-morbida">
                  <m.icon className="size-7 text-terracotta" aria-hidden="true" />
                  <h3 className="mt-3 font-serif text-xl font-semibold">{m.titolo}</h3>
                  <p className="mt-2 leading-relaxed text-grigio">{m.testo}</p>
                </div>
              ))}
            </div>
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                { icon: Smartphone, t: "Crea e personalizza", d: "Colore, logo, foto di copertina. Anteprima live sul telefono mentre scrivi." },
                { icon: Languages, t: "Traduci con un clic", d: "Inglese, francese, tedesco e spagnolo. Correggi a mano quando vuoi." },
                { icon: QrCode, t: "Pubblica e stampa", d: "Condividi il link nei messaggi e appendi in casa il cartello A5 con il QR code." },
              ].map((p, i) => (
                <li key={p.t} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-terracotta font-serif text-lg font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold">
                      <p.icon className="size-4 text-grigio" aria-hidden="true" /> {p.t}
                    </h3>
                    <p className="mt-1 text-grigio">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Prezzo */}
        <section id="prezzo" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-md rounded-3xl border border-terracotta/30 bg-white p-8 text-center shadow-morbida">
            <BadgeEuro className="mx-auto size-9 text-terracotta" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-2xl font-semibold">Un prezzo, una volta sola</h2>
            <p className="mt-6 font-serif text-6xl font-semibold">{PREZZO_GUIDA_LABEL}</p>
            <p className="mt-1 text-grigio">per guida, una tantum</p>
            <ul className="mt-8 space-y-3 text-left">
              {INCLUSO.map((x) => (
                <li key={x} className="flex gap-2.5">
                  <Check className="mt-0.5 size-5 shrink-0 text-oliva" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
            <ButtonLink href="/registrati" size="lg" className="mt-8 w-full">
              Inizia gratis
            </ButtonLink>
            <p className="mt-3 text-sm text-grigio">Paghi solo quando pubblichi. Niente carta di credito per provare.</p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-bordo/60 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Domande frequenti</h2>
            <div className="mt-8 divide-y divide-bordo">
              {FAQ.map((f) => (
                <details key={f.d} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                    {f.d}
                    <span className="text-2xl text-terracotta transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-grigio">{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className="bg-terracotta text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Accogli i tuoi ospiti come si deve.</h2>
            <p className="mt-3 max-w-xl text-white/85">Crea la bozza gratis in pochi minuti. Pubblica quando sei pronto.</p>
            <Link
              href="/registrati"
              className="mt-8 inline-flex h-13 items-center rounded-full bg-white px-7 font-medium text-terracotta hover:bg-crema"
            >
              Crea la tua guida gratis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-bordo/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-grigio sm:flex-row sm:px-6">
          <Logo />
          <p>
            © {new Date().getFullYear()} {APP_NAME} · Fatto in Italia, per l&apos;ospitalità italiana
          </p>
        </div>
      </footer>
    </div>
  );
}
