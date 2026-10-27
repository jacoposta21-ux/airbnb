import { ArrowLeft, Check, CircleAlert, Download, ExternalLink, FileText, Lock, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareBox } from "@/components/publish/share-box";
import { StatsPanel, type Statistiche } from "@/components/publish/stats-panel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireHost } from "@/lib/auth";
import { PREZZO_GUIDA_LABEL } from "@/lib/config";
import { loadGuidaCompleta } from "@/lib/guides";
import { avviaPagamento, cambiaVisibilita } from "@/lib/payment-actions";
import { registraPagamento } from "@/lib/payments";
import { urlGuida } from "@/lib/qr";
import { stripe, stripeConfigurato } from "@/lib/stripe";
import type { ContenutiSezione, GuidaCompleta, TipoSezione } from "@/types/guide";

export const metadata: Metadata = { title: "Pubblica la guida" };

const MESSAGGI_PAGAMENTO: Record<string, { tone: "error" | "info"; testo: string }> = {
  annullato: { tone: "info", testo: "Pagamento annullato: nessun addebito. Puoi riprovare quando vuoi." },
  errore: { tone: "error", testo: "Non è stato possibile avviare il pagamento. Riprova tra qualche minuto." },
  "non-configurato": { tone: "error", testo: "I pagamenti non sono ancora configurati (manca STRIPE_SECRET_KEY)." },
  attesa: {
    tone: "info",
    testo: "Stiamo ricevendo la conferma del pagamento: ricarica la pagina tra qualche secondo.",
  },
};

/** Suggerimenti prima di pubblicare: cosa manca per una guida completa. */
function controlli(g: GuidaCompleta) {
  const sez = <T extends TipoSezione>(tipo: T) => {
    const s = g.sezioni.find((x) => x.tipo === tipo && x.attiva);
    return s ? ((s.contenuto.it ?? {}) as Partial<ContenutiSezione[T]>) : null;
  };
  const arrivo = sez("arrivo");
  const wifi = sez("wifi");
  const tassa = sez("tassa");
  return [
    { ok: !arrivo || Boolean(arrivo.indirizzo?.trim()), testo: "Indirizzo nella sezione Arrivo" },
    { ok: !wifi || Boolean(wifi.password?.trim()), testo: "Password del Wi-Fi" },
    { ok: !tassa || Boolean(tassa.cin?.trim()), testo: "Codice CIN (obbligatorio per legge)" },
    { ok: Boolean(g.contatto_telefono?.trim()), testo: "Il tuo numero di telefono per gli ospiti" },
    { ok: Boolean(g.cover_url), testo: "Una foto di copertina" },
    { ok: g.lingue_attive.length > 1, testo: "Almeno una traduzione (gli ospiti stranieri ringraziano)" },
  ];
}

export default async function PubblicaPage({ params, searchParams }: PageProps<"/guide/[id]/pubblica">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const { supabase, host } = await requireHost();

  let guida = await loadGuidaCompleta(supabase, { id }).catch(() => null);
  if (!guida || guida.host_id !== host.id) notFound();

  // Ritorno da Stripe: conferma subito il pagamento senza aspettare il webhook.
  let esitoPagamento = typeof query.pagamento === "string" ? query.pagamento : undefined;
  if (esitoPagamento === "ok" && !guida.pagata && typeof query.session_id === "string" && stripeConfigurato()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(query.session_id);
      const perQuestaGuida = (session.metadata?.guide_id ?? session.client_reference_id) === guida.id;
      if (perQuestaGuida && (await registraPagamento(session))) {
        guida = (await loadGuidaCompleta(supabase, { id }))!;
      } else {
        esitoPagamento = "attesa";
      }
    } catch (e) {
      console.error("Verifica pagamento non riuscita", e);
      esitoPagamento = "attesa";
    }
  }

  const url = urlGuida(guida.slug);
  const avviso = esitoPagamento ? MESSAGGI_PAGAMENTO[esitoPagamento] : undefined;
  const pagata = guida.pagata;
  const online = pagata && guida.stato === "pubblicata";

  let stats: Statistiche | null = null;
  if (pagata) {
    const { data } = await supabase.rpc("guide_stats", { p_guide_id: guida.id });
    stats = (data as unknown as Statistiche) ?? null;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/guide/${guida.id}/modifica`} className="flex size-9 items-center justify-center rounded-full hover:bg-sabbia" aria-label="Torna all'editor">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-2xl font-semibold sm:text-3xl">{guida.nome_struttura}</h1>
          <div className="mt-1">
            {online ? <Badge tone="success">Online</Badge> : pagata ? <Badge>Offline</Badge> : <Badge tone="warning">Bozza · non pubblicata</Badge>}
          </div>
        </div>
        <ButtonLink href={`/guide/${guida.id}/modifica`} variant="secondary" size="sm" icon={<Pencil className="size-4" />}>
          Modifica
        </ButtonLink>
      </div>

      {esitoPagamento === "ok" && pagata && (
        <Alert tone="success" className="mt-6">
          Pagamento ricevuto, grazie! La tua guida è online. Scarica il cartello con il QR code e condividi il link con i tuoi ospiti.
        </Alert>
      )}
      {avviso && esitoPagamento !== "ok" && (
        <Alert tone={avviso.tone} className="mt-6">
          {avviso.testo}
        </Alert>
      )}
      {esitoPagamento === "ok" && !pagata && <Alert className="mt-6">{MESSAGGI_PAGAMENTO.attesa.testo}</Alert>}

      {!pagata ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-semibold">Prima di pubblicare</h2>
            <p className="mt-1 text-sm text-grigio">Non sono obbligatori, ma rendono la guida davvero utile.</p>
            <ul className="mt-4 space-y-2.5">
              {controlli(guida).map((c) => (
                <li key={c.testo} className="flex items-center gap-2.5 text-sm">
                  {c.ok ? (
                    <Check className="size-5 shrink-0 text-oliva" aria-label="Fatto" />
                  ) : (
                    <CircleAlert className="size-5 shrink-0 text-amber-600" aria-label="Da completare" />
                  )}
                  <span className={c.ok ? "text-grigio" : ""}>{c.testo}</span>
                </li>
              ))}
            </ul>
            <a href={`/g/${guida.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "sm", "mt-6")}>
              <ExternalLink className="size-4" aria-hidden="true" /> Guarda l&apos;anteprima
            </a>
          </Card>

          <Card className="border-terracotta/30 p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-grigio">Pubblicazione</p>
            <p className="mt-2 font-serif text-5xl font-semibold">{PREZZO_GUIDA_LABEL}</p>
            <p className="mt-1 text-sm text-grigio">una tantum, per questa guida</p>
            <ul className="mt-5 space-y-2 text-left text-sm">
              {["Link pubblico per gli ospiti", "QR code e cartello A5 da stampare", "Modifiche e traduzioni illimitate", "Statistiche delle visite", "Niente rinnovi o abbonamenti"].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-oliva" aria-hidden="true" /> {x}
                </li>
              ))}
            </ul>
            <form action={avviaPagamento} className="mt-6">
              <input type="hidden" name="id" value={guida.id} />
              <SubmitButton size="lg" className="w-full" disabled={!stripeConfigurato()}>
                Paga e pubblica
              </SubmitButton>
            </form>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-grigio">
              <Lock className="size-3" aria-hidden="true" /> Pagamento sicuro con Stripe: carta, Apple Pay, Google Pay
            </p>
            <p className="mt-2 text-xs text-grigio">
              Procedendo accetti i{" "}
              <Link href="/termini" className="underline underline-offset-2">
                Termini di servizio
              </Link>
              . Rimborso integrale entro 14 giorni:{" "}
              <Link href="/rimborsi" className="underline underline-offset-2">
                come funziona
              </Link>
              .
            </p>
          </Card>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold">Condividi la guida</h2>
              <ShareBox url={url} nome={guida.nome_struttura} />
            </section>

            <section>
              <h2 className="mb-3 font-serif text-xl font-semibold">QR code</h2>
              <Card className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-start">
                {/* eslint-disable-next-line @next/next/no-img-element -- PNG generato al volo dal server */}
                <img src={`/api/guide/${guida.id}/qr`} alt={`QR code della guida ${guida.nome_struttura}`} width={176} height={176} className="size-44 rounded-lg border border-bordo" />
                <div className="space-y-3">
                  <p className="text-sm text-grigio">
                    Stampa il cartello e appendilo all&apos;ingresso o vicino al router: gli ospiti inquadrano il codice e aprono la guida.
                  </p>
                  <a href={`/api/guide/${guida.id}/cartello`} className={buttonClasses("primary", "md")}>
                    <FileText className="size-4" aria-hidden="true" /> Cartello A5 (PDF)
                  </a>
                  <a href={`/api/guide/${guida.id}/qr?download=1`} className={buttonClasses("secondary", "md", "sm:ml-2")}>
                    <Download className="size-4" aria-hidden="true" /> QR in PNG
                  </a>
                </div>
              </Card>
            </section>

            <section className="rounded-2xl border border-bordo p-5">
              <h2 className="font-medium">{online ? "La guida è online" : "La guida è offline"}</h2>
              <p className="mt-1 text-sm text-grigio">
                {online
                  ? "Puoi metterla offline temporaneamente (es. durante una ristrutturazione): il link smetterà di funzionare finché non la riattivi."
                  : "Il link non è raggiungibile dagli ospiti. Riattivala quando vuoi, senza pagare di nuovo."}
              </p>
              <form action={cambiaVisibilita} className="mt-3">
                <input type="hidden" name="id" value={guida.id} />
                <input type="hidden" name="stato" value={online ? "bozza" : "pubblicata"} />
                <SubmitButton variant={online ? "secondary" : "primary"} size="sm">
                  {online ? "Metti offline" : "Rimetti online"}
                </SubmitButton>
              </form>
            </section>
          </div>

          <section>
            <h2 className="mb-3 font-serif text-xl font-semibold">Statistiche</h2>
            {stats ? <StatsPanel stats={stats} /> : <Alert>Statistiche non disponibili al momento.</Alert>}
          </section>
        </div>
      )}
    </div>
  );
}
