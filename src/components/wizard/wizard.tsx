"use client";

import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { SectionIcon } from "@/components/guide/section-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { creaGuida } from "@/lib/guide-actions";
import { RIFIUTI_PREDEFINITI } from "@/lib/sections";
import { mapsSearchUrl } from "@/lib/utils";
import type { TipoSezione } from "@/types/guide";

/** Risposte raccolte dal wizard. */
interface Risposte {
  nome_struttura: string;
  citta: string;
  contatto_nome: string;
  contatto_telefono: string;
  indirizzo: string;
  orario_checkin: string;
  istruzioni: string;
  wifi_rete: string;
  wifi_password: string;
  giorni_rifiuti: Record<string, string>;
  dove_conferire: string;
  cin: string;
  tassa_importo: string;
  tassa_pagamento: string;
  ztl_presente: boolean;
  parcheggio: string;
  orario_checkout: string;
}

interface Passo {
  tipo: TipoSezione;
  titolo: string;
  sottotitolo: string;
  /** Il passo si può superare? Restituisce un messaggio d'errore se no. */
  valida?: (r: Risposte) => string | null;
}

const PASSI: Passo[] = [
  {
    tipo: "benvenuto",
    titolo: "Iniziamo dalla tua struttura",
    sottotitolo: "Come si chiama e dove si trova?",
    valida: (r) => (r.nome_struttura.trim().length < 2 ? "Inserisci il nome della struttura." : null),
  },
  { tipo: "arrivo", titolo: "Come arrivano gli ospiti?", sottotitolo: "Indirizzo, orari e istruzioni per entrare." },
  { tipo: "wifi", titolo: "Il Wi-Fi", sottotitolo: "La domanda più frequente: rispondiamo una volta per tutte." },
  {
    tipo: "differenziata",
    titolo: "Raccolta differenziata",
    sottotitolo: "Abbiamo già preparato i tipi di rifiuto e i colori più comuni: indica solo quando e dove.",
  },
  { tipo: "tassa", titolo: "Tassa di soggiorno e CIN", sottotitolo: "Le informazioni che ogni ospite deve conoscere." },
  { tipo: "parcheggio", titolo: "Parcheggio e ZTL", sottotitolo: "Evitiamo multe ai tuoi ospiti." },
  { tipo: "checkout", titolo: "Il check-out", sottotitolo: "Ultimo passo! Il resto lo trovi già pronto nell'editor." },
];

export function Wizard({ nomeHost, telefonoHost }: { nomeHost: string; telefonoHost: string }) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [errore, setErrore] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [r, setR] = useState<Risposte>({
    nome_struttura: "",
    citta: "",
    contatto_nome: nomeHost,
    contatto_telefono: telefonoHost,
    indirizzo: "",
    orario_checkin: "Dalle 15:00",
    istruzioni: "",
    wifi_rete: "",
    wifi_password: "",
    giorni_rifiuti: {},
    dove_conferire: "",
    cin: "",
    tassa_importo: "",
    tassa_pagamento: "",
    ztl_presente: false,
    parcheggio: "",
    orario_checkout: "Entro le 10:00",
  });

  const set = <K extends keyof Risposte>(key: K, value: Risposte[K]) => setR((prev) => ({ ...prev, [key]: value }));
  const corrente = PASSI[passo];
  const ultimo = passo === PASSI.length - 1;

  const avanti = () => {
    const msg = corrente.valida?.(r) ?? null;
    setErrore(msg);
    if (msg) return;
    if (!ultimo) {
      setPasso((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      crea();
    }
  };

  const crea = () =>
    startTransition(async () => {
      const passi = r.istruzioni
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((testo) => ({ testo }));
      const esito = await creaGuida({
        nome_struttura: r.nome_struttura,
        citta: r.citta,
        contatto_nome: r.contatto_nome,
        contatto_telefono: r.contatto_telefono,
        contatto_whatsapp: r.contatto_telefono,
        contenuti: {
          benvenuto: { firma: r.contatto_nome },
          arrivo: {
            indirizzo: r.indirizzo,
            maps_url: r.indirizzo ? mapsSearchUrl(r.indirizzo) : "",
            orario_checkin: r.orario_checkin,
            ...(passi.length ? { passi } : {}),
          },
          wifi: { rete: r.wifi_rete, password: r.wifi_password },
          differenziata: {
            rifiuti: RIFIUTI_PREDEFINITI.map((rif) => ({ ...rif, giorni: r.giorni_rifiuti[rif.tipo] ?? "" })),
            dove_conferire: r.dove_conferire,
          },
          tassa: { cin: r.cin, importo: r.tassa_importo, modalita_pagamento: r.tassa_pagamento },
          parcheggio: {
            ztl_presente: r.ztl_presente,
            ztl: r.ztl_presente
              ? "Non entrate in auto nella ZTL senza permesso: i varchi sono controllati da telecamere e le multe arrivano automaticamente, anche mesi dopo."
              : "",
            parcheggio: r.parcheggio,
          },
          checkout: { orario: r.orario_checkout },
        },
      }).catch(() => ({ ok: false, error: "Connessione assente. Riprova.", id: undefined }));
      if (!esito.ok || !esito.id) {
        setErrore(esito.error ?? "Non è stato possibile creare la guida.");
        return;
      }
      router.push(`/guide/${esito.id}/modifica?creata=1`);
    });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
      {/* Avanzamento */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm text-grigio">
          <span>
            Passo {passo + 1} di {PASSI.length}
          </span>
          {passo > 0 && !ultimo && (
            <button type="button" className="font-medium hover:text-inchiostro" onClick={() => setPasso((p) => p + 1)}>
              Salta questo passo
            </button>
          )}
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-sabbia"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={PASSI.length}
          aria-valuenow={passo + 1}
        >
          <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${((passo + 1) / PASSI.length) * 100}%` }} />
        </div>
      </div>

      <Card className="p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
          <SectionIcon tipo={corrente.tipo} className="size-6" />
        </span>
        <h1 className="mt-4 font-serif text-2xl font-semibold sm:text-3xl">{corrente.titolo}</h1>
        <p className="mt-1 text-grigio">{corrente.sottotitolo}</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            avanti();
          }}
        >
          <ContenutoPasso tipo={corrente.tipo} r={r} set={set} />

          {errore && <Alert tone="error">{errore}</Alert>}

          <div className="flex items-center justify-between gap-3 pt-2">
            {passo > 0 ? (
              <Button type="button" variant="ghost" onClick={() => setPasso((p) => p - 1)} icon={<ArrowLeft className="size-4" />}>
                Indietro
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" loading={pending} icon={ultimo ? <Sparkles className="size-4" /> : undefined}>
              {ultimo ? "Crea la mia guida" : "Avanti"}
              {!ultimo && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ContenutoPasso({
  tipo,
  r,
  set,
}: {
  tipo: TipoSezione;
  r: Risposte;
  set: <K extends keyof Risposte>(key: K, value: Risposte[K]) => void;
}): ReactNode {
  switch (tipo) {
    case "benvenuto":
      return (
        <>
          <Field label="Nome della struttura" htmlFor="nome">
            <Input id="nome" autoFocus value={r.nome_struttura} onChange={(e) => set("nome_struttura", e.target.value)} placeholder="Casa Brunelleschi" />
          </Field>
          <Field label="Città" htmlFor="citta">
            <Input id="citta" value={r.citta} onChange={(e) => set("citta", e.target.value)} placeholder="Firenze" />
          </Field>
          <Field label="Il tuo nome (come ti vedranno gli ospiti)" htmlFor="cn">
            <Input id="cn" value={r.contatto_nome} onChange={(e) => set("contatto_nome", e.target.value)} />
          </Field>
          <Field label="Telefono / WhatsApp" htmlFor="tel" hint="Per i pulsanti “Chiama” e “WhatsApp” della guida.">
            <Input id="tel" type="tel" value={r.contatto_telefono} onChange={(e) => set("contatto_telefono", e.target.value)} placeholder="+39 333 123 4567" />
          </Field>
        </>
      );
    case "arrivo":
      return (
        <>
          <Field label="Indirizzo completo" htmlFor="ind">
            <Input id="ind" value={r.indirizzo} onChange={(e) => set("indirizzo", e.target.value)} placeholder="Via dei Servi 12, 50122 Firenze" />
          </Field>
          <Field label="Orario di check-in" htmlFor="oci">
            <Input id="oci" value={r.orario_checkin} onChange={(e) => set("orario_checkin", e.target.value)} />
          </Field>
          <Field label="Istruzioni per entrare" htmlFor="istr" hint="Scrivi un passo per riga: diventerà un elenco numerato.">
            <Textarea
              id="istr"
              rows={5}
              value={r.istruzioni}
              onChange={(e) => set("istruzioni", e.target.value)}
              placeholder={"Il portone è verde, accanto al bar\nApri la cassetta delle chiavi con il codice che ti invieremo\nSecondo piano, porta a sinistra"}
            />
          </Field>
        </>
      );
    case "wifi":
      return (
        <>
          <Field label="Nome della rete" htmlFor="ssid">
            <Input id="ssid" value={r.wifi_rete} onChange={(e) => set("wifi_rete", e.target.value)} className="font-mono" />
          </Field>
          <Field label="Password" htmlFor="pwd">
            <Input id="pwd" value={r.wifi_password} onChange={(e) => set("wifi_password", e.target.value)} className="font-mono" />
          </Field>
        </>
      );
    case "differenziata":
      return (
        <>
          <div className="space-y-3">
            {RIFIUTI_PREDEFINITI.map((rif) => (
              <div key={rif.tipo} className="flex items-center gap-3">
                <span className="size-8 shrink-0 rounded-full border-2 border-white shadow ring-1 ring-bordo" style={{ background: rif.colore }} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <label htmlFor={`g-${rif.tipo}`} className="text-sm font-medium">
                    {rif.nome} <span className="font-normal text-grigio">({rif.nome_colore})</span>
                  </label>
                  <Input
                    id={`g-${rif.tipo}`}
                    value={r.giorni_rifiuti[rif.tipo] ?? ""}
                    onChange={(e) => set("giorni_rifiuti", { ...r.giorni_rifiuti, [rif.tipo]: e.target.value })}
                    placeholder="Es. lunedì e giovedì, dopo le 20"
                    className="mt-1 h-10"
                  />
                </div>
              </div>
            ))}
          </div>
          <Field label="Dove si buttano i rifiuti?" htmlFor="dove">
            <Textarea id="dove" rows={2} value={r.dove_conferire} onChange={(e) => set("dove_conferire", e.target.value)} placeholder="Cassonetti all'angolo della via, uscendo a destra" />
          </Field>
          <p className="text-xs text-grigio">Colori e materiali si possono modificare dopo, nell&apos;editor.</p>
        </>
      );
    case "tassa":
      return (
        <>
          <Field label="Codice CIN" htmlFor="cin" hint="Codice Identificativo Nazionale, obbligatorio per gli affitti brevi.">
            <Input id="cin" value={r.cin} onChange={(e) => set("cin", e.target.value.toUpperCase())} className="font-mono" placeholder="IT048017C2XXXXXXXX" />
          </Field>
          <Field label="Importo della tassa di soggiorno" htmlFor="imp">
            <Input id="imp" value={r.tassa_importo} onChange={(e) => set("tassa_importo", e.target.value)} placeholder="Es. 3 € a persona a notte, massimo 7 notti" />
          </Field>
          <Field label="Come si paga" htmlFor="pag">
            <Input id="pag" value={r.tassa_pagamento} onChange={(e) => set("tassa_pagamento", e.target.value)} placeholder="In contanti all'arrivo, oppure già inclusa nella prenotazione" />
          </Field>
        </>
      );
    case "parcheggio":
      return (
        <>
          <label className="flex items-start gap-3 rounded-xl border border-bordo p-4">
            <input type="checkbox" checked={r.ztl_presente} onChange={(e) => set("ztl_presente", e.target.checked)} className="mt-0.5 size-5 accent-terracotta" />
            <span>
              <span className="block font-medium">La casa è in una ZTL</span>
              <span className="block text-sm text-grigio">Mostreremo un avviso ben visibile agli ospiti in auto.</span>
            </span>
          </label>
          <Field label="Dove possono parcheggiare?" htmlFor="park">
            <Textarea id="park" rows={3} value={r.parcheggio} onChange={(e) => set("parcheggio", e.target.value)} placeholder="Parcheggio gratuito in Via…, oppure garage a pagamento a 200 m" />
          </Field>
        </>
      );
    case "checkout":
      return (
        <Field label="Orario di check-out" htmlFor="oco">
          <Input id="oco" value={r.orario_checkout} onChange={(e) => set("orario_checkout", e.target.value)} />
        </Field>
      );
    default:
      return null;
  }
}
