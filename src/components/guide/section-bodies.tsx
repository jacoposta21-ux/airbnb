/**
 * Corpo di ciascuna sezione della guida pubblica. Ogni componente riceve il
 * contenuto già localizzato e il dizionario dell'interfaccia.
 */
"use client";

import { Check, Clock, ExternalLink, MapPin, Phone, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import type { Dizionario } from "@/lib/i18n";
import { cn, mapsSearchUrl } from "@/lib/utils";
import {
  CATEGORIE_LUOGO,
  type ContenutiSezione,
  type Lingua,
  type Luogo,
  type Rifiuto,
} from "@/types/guide";
import { CopyButton } from "./copy-button";
import { ICONE_CATEGORIA } from "./section-icon";

interface BodyProps<T> {
  c: T;
  t: Dizionario;
}

/** Paragrafo che rispetta gli a capo scritti dall'host. Non mostra nulla se vuoto. */
function Testo({ children, className }: { children?: string; className?: string }) {
  if (!children?.trim()) return null;
  return <p className={cn("whitespace-pre-line leading-relaxed text-inchiostro/90", className)}>{children}</p>;
}

function Riquadro({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-crema px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-grigio">
        {icon}
        {label}
      </div>
      <div className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

function Foto({ src }: { src?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- immagini già compresse all'upload, lazy per connessioni lente
  return <img src={src} alt="" loading="lazy" decoding="async" className="mt-3 w-full rounded-xl object-cover" />;
}

// ---------------------------------------------------------------------------

export function BenvenutoBody({ c }: BodyProps<ContenutiSezione["benvenuto"]>) {
  return (
    <div>
      {c.titolo && <h3 className="font-serif text-2xl font-semibold leading-snug">{c.titolo}</h3>}
      <Testo className="mt-3 text-[17px]">{c.messaggio}</Testo>
      {c.firma && <p className="mt-4 font-serif text-lg italic text-[var(--brand)]">— {c.firma}</p>}
    </div>
  );
}

export function ArrivoBody({ c, t }: BodyProps<ContenutiSezione["arrivo"]>) {
  const passi = c.passi.filter((p) => p.testo.trim() || p.foto_url);
  return (
    <div className="space-y-4">
      {c.indirizzo && (
        <a
          href={c.maps_url || mapsSearchUrl(c.indirizzo)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 rounded-xl border border-bordo p-4 transition-colors hover:bg-crema"
        >
          <MapPin className="mt-0.5 size-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
          <span>
            <span className="block font-medium">{c.indirizzo}</span>
            <span className="text-sm text-[var(--brand)] underline underline-offset-2">{t.apriMappa}</span>
          </span>
        </a>
      )}
      {c.orario_checkin && (
        <Riquadro label={t.orarioCheckin} icon={<Clock className="size-3.5" aria-hidden="true" />}>
          {c.orario_checkin}
        </Riquadro>
      )}
      {passi.length > 0 && (
        <ol className="space-y-4">
          {passi.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <Testo>{p.testo}</Testo>
                <Foto src={p.foto_url} />
              </div>
            </li>
          ))}
        </ol>
      )}
      <Testo className="text-sm text-grigio">{c.note}</Testo>
    </div>
  );
}

export function WifiBody({ c, t }: BodyProps<ContenutiSezione["wifi"]>) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-bordo p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-grigio">{t.rete}</div>
        <div className="mt-0.5 break-all font-mono text-lg">{c.rete || "—"}</div>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-bordo p-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-grigio">{t.password}</div>
          <div className="mt-0.5 break-all font-mono text-lg">{c.password || "—"}</div>
        </div>
        {c.password && <CopyButton text={c.password} label={t.copia} copiedLabel={t.copiato} />}
      </div>
      <Testo className="text-sm text-grigio">{c.note}</Testo>
    </div>
  );
}

export function CasaBody({ c }: BodyProps<ContenutiSezione["casa"]>) {
  const elementi = c.elementi.filter((e) => e.nome.trim() || e.istruzioni.trim());
  return (
    <div className="space-y-4">
      <Testo>{c.intro}</Testo>
      {elementi.map((e, i) => (
        <details key={i} className="group rounded-xl border border-bordo open:bg-crema/50" open={elementi.length <= 2}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium">
            {e.nome}
            <span className="text-grigio transition-transform group-open:rotate-45" aria-hidden="true">
              +
            </span>
          </summary>
          <div className="px-4 pb-4">
            <Testo>{e.istruzioni}</Testo>
            <Foto src={e.foto_url} />
          </div>
        </details>
      ))}
    </div>
  );
}

export function RegoleBody({ c }: BodyProps<ContenutiSezione["regole"]>) {
  const regole = c.regole.filter((r) => r.trim());
  return (
    <div className="space-y-4">
      <ul className="space-y-2.5">
        {regole.map((r, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
            <span className="leading-relaxed">{r}</span>
          </li>
        ))}
      </ul>
      <Testo className="text-grigio">{c.note}</Testo>
    </div>
  );
}

// --- Raccolta differenziata: la sezione più curata graficamente -------------

/** Bidone disegnato nel colore del contenitore. */
function Bidone({ colore }: { colore: string }) {
  return (
    <svg viewBox="0 0 48 56" className="h-14 w-12 shrink-0 drop-shadow-sm" aria-hidden="true">
      <rect x="4" y="6" width="40" height="8" rx="3" fill={colore} />
      <rect x="4" y="6" width="40" height="8" rx="3" fill="black" opacity="0.18" />
      <rect x="18" y="1" width="12" height="6" rx="2" fill={colore} />
      <path d="M7 16h34l-3 36a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill={colore} />
      <path d="M17 22v26M24 22v26M31 22v26" stroke="white" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function elenco(testo: string) {
  return testo
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function SchedaRifiuto({ r, t }: { r: Rifiuto; t: Dizionario }) {
  const si = elenco(r.cosa_si);
  const no = elenco(r.cosa_no);
  return (
    <div className="overflow-hidden rounded-2xl border border-bordo bg-white">
      <div className="flex items-center gap-4 p-4" style={{ background: `${r.colore}1A` }}>
        <Bidone colore={r.colore} />
        <div className="min-w-0">
          <div className="font-serif text-lg font-semibold leading-tight">{r.nome}</div>
          {r.nome_colore && (
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium">
              <span className="size-2.5 rounded-full" style={{ background: r.colore }} aria-hidden="true" />
              {t.contenitore.replace("{colore}", r.nome_colore)}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-3 p-4 text-[15px]">
        {r.giorni && (
          <div className="flex gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-grigio" aria-label={t.quando} />
            <span>{r.giorni}</span>
          </div>
        )}
        {si.length > 0 && (
          <div className="flex gap-2">
            <Check className="mt-1 size-4 shrink-0 text-oliva" aria-label={t.cosaSi} />
            <div className="flex flex-wrap gap-1.5">
              {si.map((x) => (
                <span key={x} className="rounded-full bg-oliva-chiaro px-2.5 py-1 text-sm text-oliva">
                  {x}
                </span>
              ))}
            </div>
          </div>
        )}
        {no.length > 0 && (
          <div className="flex gap-2">
            <X className="mt-1 size-4 shrink-0 text-red-700" aria-label={t.cosaNo} />
            <div className="flex flex-wrap gap-1.5">
              {no.map((x) => (
                <span key={x} className="rounded-full bg-red-50 px-2.5 py-1 text-sm text-red-800 line-through decoration-red-300">
                  {x}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DifferenziataBody({ c, t }: BodyProps<ContenutiSezione["differenziata"]>) {
  const rifiuti = c.rifiuti.filter((r) => r.nome.trim());
  return (
    <div className="space-y-4">
      <Testo>{c.intro}</Testo>
      {/* Legenda dei colori, utile a colpo d'occhio */}
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {rifiuti.map((r, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-bordo bg-white px-3 py-1 text-sm">
            <span className="size-3 rounded-full" style={{ background: r.colore }} />
            {r.nome}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {rifiuti.map((r, i) => (
          <SchedaRifiuto key={i} r={r} t={t} />
        ))}
      </div>
      {c.dove_conferire && (
        <Riquadro label={t.doveConferire} icon={<MapPin className="size-3.5" aria-hidden="true" />}>
          {c.dove_conferire}
        </Riquadro>
      )}
      <Testo className="text-sm text-grigio">{c.note}</Testo>
    </div>
  );
}

export function TassaBody({ c, t }: BodyProps<ContenutiSezione["tassa"]>) {
  return (
    <div className="space-y-3">
      {c.importo && <Riquadro label={t.importo}>{c.importo}</Riquadro>}
      {c.esenzioni && <Riquadro label={t.esenzioni}>{c.esenzioni}</Riquadro>}
      {c.modalita_pagamento && <Riquadro label={t.pagamento}>{c.modalita_pagamento}</Riquadro>}
      <Testo className="text-sm text-grigio">{c.note}</Testo>
      {c.cin && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-bordo px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-grigio">{t.codiceCin}</span>
          <span className="font-mono text-sm">{c.cin}</span>
        </div>
      )}
    </div>
  );
}

export function ParcheggioBody({ c, t }: BodyProps<ContenutiSezione["parcheggio"]>) {
  return (
    <div className="space-y-3">
      {c.ztl_presente && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
            {t.ztlAttenzione}
          </div>
          <Testo className="mt-2 text-amber-950">{c.ztl}</Testo>
        </div>
      )}
      {c.parcheggio && <Riquadro label={t.parcheggio}>{c.parcheggio}</Riquadro>}
      {c.mezzi_pubblici && <Riquadro label={t.mezziPubblici}>{c.mezzi_pubblici}</Riquadro>}
    </div>
  );
}

export function ConsigliBody({
  c,
  t,
  luoghi,
  lingua,
}: BodyProps<ContenutiSezione["consigli"]> & { luoghi: Luogo[]; lingua: Lingua }) {
  const gruppi = CATEGORIE_LUOGO.map((cat) => ({ cat, items: luoghi.filter((l) => l.categoria === cat && l.nome.trim()) })).filter(
    (g) => g.items.length > 0,
  );
  return (
    <div className="space-y-5">
      <Testo>{c.intro}</Testo>
      {gruppi.map(({ cat, items }) => {
        const Icon = ICONE_CATEGORIA[cat];
        return (
          <div key={cat}>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-grigio">
              <Icon className="size-4" aria-hidden="true" />
              {t.categorie[cat]}
            </h4>
            <ul className="space-y-2">
              {items.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.maps_url || mapsSearchUrl(l.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-bordo p-3.5 transition-colors hover:bg-crema"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{l.nome}</div>
                      {(l.descrizione[lingua] || l.descrizione.it) && (
                        <p className="mt-0.5 text-sm leading-relaxed text-grigio">{l.descrizione[lingua] || l.descrizione.it}</p>
                      )}
                    </div>
                    <ExternalLink className="mt-1 size-4 shrink-0 text-[var(--brand)]" aria-label={t.apriMappa} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function EmergenzeBody({
  c,
  t,
  contatto,
}: BodyProps<ContenutiSezione["emergenze"]> & { contatto?: { nome: string | null; telefono: string | null } }) {
  const numeri = c.numeri.filter((n) => n.numero.trim());
  return (
    <div className="space-y-3">
      {numeri.map((n, i) => (
        <a
          key={i}
          href={`tel:${n.numero.replace(/\s/g, "")}`}
          className={cn(
            "flex items-center gap-4 rounded-xl p-4",
            n.numero.trim() === "112" ? "bg-red-600 text-white" : "border border-bordo hover:bg-crema",
          )}
        >
          <Phone className="size-5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-sm leading-snug">{n.nome}</span>
          <span className="font-mono text-xl font-semibold">{n.numero}</span>
        </a>
      ))}
      {contatto?.telefono && (
        <a href={`tel:${contatto.telefono.replace(/\s/g, "")}`} className="flex items-center gap-4 rounded-xl border border-bordo p-4 hover:bg-crema">
          <Phone className="size-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-sm">
            {t.contattoHost}
            {contatto.nome ? ` · ${contatto.nome}` : ""}
          </span>
          <span className="font-mono text-base font-semibold">{contatto.telefono}</span>
        </a>
      )}
      {c.guardia_medica && <Riquadro label={t.guardiaMedica}>{c.guardia_medica}</Riquadro>}
      {c.farmacia_turno && <Riquadro label={t.farmaciaTurno}>{c.farmacia_turno}</Riquadro>}
      {c.ospedale && <Riquadro label={t.ospedale}>{c.ospedale}</Riquadro>}
      <Testo className="text-sm text-grigio">{c.note}</Testo>
    </div>
  );
}

export function CheckoutBody({ c, t }: BodyProps<ContenutiSezione["checkout"]>) {
  const voci = c.checklist.filter((v) => v.trim());
  const [fatte, setFatte] = useState<Set<number>>(new Set());
  return (
    <div className="space-y-4">
      {c.orario && (
        <Riquadro label={t.orarioCheckout} icon={<Clock className="size-3.5" aria-hidden="true" />}>
          {c.orario}
        </Riquadro>
      )}
      <Testo>{c.istruzioni}</Testo>
      {voci.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-grigio">{t.checklist}</h4>
          <ul className="space-y-2">
            {voci.map((v, i) => {
              const fatto = fatte.has(i);
              return (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-bordo p-3.5 has-[:checked]:bg-oliva-chiaro/60">
                    <input
                      type="checkbox"
                      checked={fatto}
                      onChange={() =>
                        setFatte((prev) => {
                          const next = new Set(prev);
                          if (next.has(i)) next.delete(i);
                          else next.add(i);
                          return next;
                        })
                      }
                      className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
                    />
                    <span className={cn("leading-snug", fatto && "text-grigio line-through")}>{v}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
