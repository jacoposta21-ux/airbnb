"use client";

import { ArrowLeft, Check, ChevronDown, ChevronUp, CloudOff, ExternalLink, Eye, Rocket, Settings2, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GuideView } from "@/components/guide/guide-view";
import { SectionIcon } from "@/components/guide/section-icon";
import { PhoneMockup } from "@/components/phone-mockup";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { salvaGuida, type DatiSalvataggio } from "@/lib/guide-actions";
import { BANDIERE, NOMI_LINGUE } from "@/lib/i18n";
import { contenutoPredefinito, INFO_SEZIONE } from "@/lib/sections";
import { caricaImmagine } from "@/lib/upload";
import { cn } from "@/lib/utils";
import type { Guida, GuidaCompleta, Lingua, Luogo, Sezione, TipoSezione } from "@/types/guide";
import type { FormCtx } from "./form-controls";
import { getIn, opListaMultilingua, scriviCampo, type OpLista, type Path } from "./path";
import { PlacesEditor } from "./places-editor";
import { SectionForm } from "./section-forms";
import { SettingsPanel } from "./settings-panel";

type StatoSalvataggio = "salvato" | "modifiche" | "salvataggio" | "errore";

const RITARDO_SALVATAGGIO = 1200;

function payload(g: GuidaCompleta): DatiSalvataggio {
  return {
    impostazioni: {
      nome_struttura: g.nome_struttura,
      citta: g.citta,
      slug: g.slug,
      colore: g.colore,
      logo_url: g.logo_url,
      cover_url: g.cover_url,
      lingue_attive: g.lingue_attive,
      contatto_nome: g.contatto_nome,
      contatto_telefono: g.contatto_telefono,
      contatto_whatsapp: g.contatto_whatsapp,
    },
    sezioni: g.sezioni.map((s) => ({
      id: s.id,
      tipo: s.tipo,
      ordine: s.ordine,
      attiva: s.attiva,
      contenuto: s.contenuto as Partial<Record<Lingua, unknown>>,
    })),
    luoghi: g.luoghi.map((l, i) => ({ ...l, ordine: i })),
  };
}

/** Contenuto italiano completo (predefiniti + salvato) di una sezione. */
function baseItaliana(s: Sezione) {
  const def = contenutoPredefinito(s.tipo) as unknown as Record<string, unknown>;
  return { ...def, ...((s.contenuto.it as Record<string, unknown> | undefined) ?? {}) };
}

export function GuideEditor({
  guidaIniziale,
  hostId,
  avviso,
}: {
  guidaIniziale: GuidaCompleta;
  hostId: string;
  avviso?: string;
}) {
  const [guida, setGuida] = useState(guidaIniziale);
  const [linguaScelta, setLingua] = useState<Lingua>("it");
  // Se la lingua scelta viene disattivata, si torna all'italiano.
  const lingua: Lingua = guida.lingue_attive.includes(linguaScelta) ? linguaScelta : "it";
  const [scheda, setScheda] = useState<"sezioni" | "aspetto">("sezioni");
  const [aperta, setAperta] = useState<TipoSezione | null>("benvenuto");
  const [anteprimaMobile, setAnteprimaMobile] = useState(false);
  const [stato, setStato] = useState<StatoSalvataggio>("salvato");
  const [errore, setErrore] = useState<string | null>(null);
  const anteprimaRef = useRef<HTMLDivElement>(null);

  // --- Salvataggio automatico ------------------------------------------------
  const guidaRef = useRef(guida);
  const versione = useRef(0);
  const inCorso = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const primoRender = useRef(true);
  const salvaRef = useRef<() => void>(() => {});

  const salva = useCallback(async () => {
    if (inCorso.current) return;
    inCorso.current = true;
    const v = versione.current;
    setStato("salvataggio");
    const esito = await salvaGuida(guidaRef.current.id, payload(guidaRef.current)).catch(() => ({
      ok: false,
      error: "Connessione assente: riproveremo appena torni online.",
    }));
    inCorso.current = false;
    if (!esito.ok) {
      setStato("errore");
      setErrore(esito.error ?? "Salvataggio non riuscito.");
      return;
    }
    setErrore(null);
    if (v !== versione.current) {
      // Ci sono modifiche arrivate durante il salvataggio: salva ancora.
      setStato("modifiche");
      timer.current = setTimeout(() => salvaRef.current(), 300);
    } else {
      setStato("salvato");
    }
  }, []);

  useEffect(() => {
    salvaRef.current = salva;
  }, [salva]);

  useEffect(() => {
    guidaRef.current = guida;
    if (primoRender.current) {
      primoRender.current = false;
      return;
    }
    versione.current += 1;
    setStato("modifiche");
    clearTimeout(timer.current);
    timer.current = setTimeout(salva, RITARDO_SALVATAGGIO);
  }, [guida, salva]);

  // Avvisa se si chiude la pagina con modifiche non salvate.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (stato !== "salvato") e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [stato]);

  // --- Modifiche allo stato -----------------------------------------------------
  const aggiornaGuida = (patch: Partial<Guida>) => setGuida((g) => ({ ...g, ...patch }));
  const aggiornaSezione = (tipo: TipoSezione, fn: (s: Sezione) => Sezione) =>
    setGuida((g) => ({ ...g, sezioni: g.sezioni.map((s) => (s.tipo === tipo ? fn(s) : s)) }));
  const aggiornaLuoghi = (luoghi: Luogo[]) => setGuida((g) => ({ ...g, luoghi }));

  const spostaSezione = (tipo: TipoSezione, direzione: -1 | 1) =>
    setGuida((g) => {
      const ordinate = [...g.sezioni].sort((a, b) => a.ordine - b.ordine);
      const i = ordinate.findIndex((s) => s.tipo === tipo);
      const j = i + direzione;
      if (j < 0 || j >= ordinate.length) return g;
      [ordinate[i], ordinate[j]] = [ordinate[j], ordinate[i]];
      return { ...g, sezioni: ordinate.map((s, ordine) => ({ ...s, ordine })) };
    });

  const caricaFoto = useCallback(
    (file: File, maxLato?: number) => caricaImmagine(file, hostId, guidaIniziale.id, maxLato),
    [hostId, guidaIniziale.id],
  );

  const ctxPer = (s: Sezione): FormCtx => {
    const base = baseItaliana(s);
    return {
      lingua,
      traduzione: lingua !== "it",
      base,
      tr: s.contenuto[lingua],
      set: (path: Path, value: unknown) =>
        aggiornaSezione(s.tipo, (sez) => ({ ...sez, contenuto: scriviCampo(sez.contenuto, lingua, path, value) as Sezione["contenuto"] })),
      lista: (path: Path, op: OpLista) =>
        aggiornaSezione(s.tipo, (sez) => ({
          ...sez,
          contenuto: opListaMultilingua(sez.contenuto, path, op, (getIn(baseItaliana(sez), path) as unknown[]) ?? []) as Sezione["contenuto"],
        })),
      caricaFoto: (f) => caricaFoto(f),
    };
  };

  // Porta l'anteprima alla sezione aperta.
  const apriSezione = (tipo: TipoSezione | null) => {
    setAperta(tipo);
    if (!tipo) return;
    requestAnimationFrame(() => {
      const box = anteprimaRef.current?.querySelector<HTMLElement>("[data-anteprima-scroll]");
      const el = box?.querySelector<HTMLElement>(`#sez-${tipo}`);
      if (box && el) box.scrollTo({ top: el.offsetTop - 56, behavior: "smooth" });
    });
  };

  const sezioniOrdinate = useMemo(() => [...guida.sezioni].sort((a, b) => a.ordine - b.ordine), [guida.sezioni]);
  const anteprima = <GuideView guida={guida} lingua={lingua} incorporata />;

  return (
    <div className="flex flex-1 flex-col">
      {/* Barra superiore */}
      <div className="sticky top-16 z-20 border-b border-bordo/70 bg-crema/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex size-9 items-center justify-center rounded-full hover:bg-sabbia" aria-label="Torna alle guide">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-lg font-semibold">{guida.nome_struttura || "Senza nome"}</h1>
            <IndicatoreSalvataggio stato={stato} onRiprova={salva} />
          </div>
          <a href={`/g/${guida.slug}`} target="_blank" rel="noopener noreferrer" className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}>
            <ExternalLink className="size-4" aria-hidden="true" /> Apri
          </a>
          <Link href={`/guide/${guida.id}/pubblica`} className={buttonClasses("primary", "sm")}>
            <Rocket className="size-4" aria-hidden="true" /> {guida.pagata ? "QR code" : "Pubblica"}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          {avviso && <Alert tone="success">{avviso}</Alert>}
          {errore && <Alert tone="error">{errore}</Alert>}

          {/* Schede */}
          <div className="flex gap-1 rounded-full bg-sabbia p-1" role="tablist">
            {(
              [
                ["sezioni", "Contenuti", null],
                ["aspetto", "Aspetto e contatti", Settings2],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={scheda === id}
                onClick={() => setScheda(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium",
                  scheda === id ? "bg-white shadow-sm" : "text-grigio",
                )}
              >
                {Icon && <Icon className="size-4" aria-hidden="true" />}
                {label}
              </button>
            ))}
          </div>

          {scheda === "aspetto" ? (
            <SettingsPanel guida={guida} onChange={aggiornaGuida} carica={caricaFoto} />
          ) : (
            <>
              {/* Lingua in modifica */}
              {guida.lingue_attive.length > 1 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-grigio">Stai modificando:</span>
                    {guida.lingue_attive.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLingua(l)}
                        aria-pressed={lingua === l}
                        className="rounded-full border border-bordo bg-white px-3 py-1 text-sm aria-pressed:border-inchiostro aria-pressed:bg-inchiostro aria-pressed:text-white"
                      >
                        {BANDIERE[l]} {NOMI_LINGUE[l]}
                      </button>
                    ))}
                  </div>
                  {lingua !== "it" && (
                    <Alert tone="info">
                      Stai correggendo la traduzione in {NOMI_LINGUE[lingua]}. I campi vuoti mostrano il testo italiano.
                      Per aggiungere o togliere elementi torna all&apos;italiano.
                    </Alert>
                  )}
                </div>
              )}

              <ul className="space-y-3">
                {sezioniOrdinate.map((s, i) => {
                  const info = INFO_SEZIONE[s.tipo];
                  const isAperta = aperta === s.tipo;
                  return (
                    <li key={s.id} className={cn("rounded-2xl border bg-white shadow-morbida", isAperta ? "border-terracotta/40" : "border-bordo")}>
                      <div className="flex items-center gap-3 p-3 sm:p-4">
                        <button
                          type="button"
                          onClick={() => apriSezione(isAperta ? null : s.tipo)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          aria-expanded={isAperta}
                        >
                          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", s.attiva ? "bg-terracotta/10 text-terracotta" : "bg-sabbia text-grigio")}>
                            <SectionIcon tipo={s.tipo} className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className={cn("block font-medium", !s.attiva && "text-grigio line-through")}>{info.etichetta}</span>
                            <span className="block truncate text-xs text-grigio">{s.attiva ? info.descrizione : "Nascosta agli ospiti"}</span>
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button type="button" disabled={i === 0} onClick={() => spostaSezione(s.tipo, -1)} className="flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia disabled:opacity-30" aria-label={`Sposta su ${info.etichetta}`}>
                            <ChevronUp className="size-4" />
                          </button>
                          <button type="button" disabled={i === sezioniOrdinate.length - 1} onClick={() => spostaSezione(s.tipo, 1)} className="flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia disabled:opacity-30" aria-label={`Sposta giù ${info.etichetta}`}>
                            <ChevronDown className="size-4" />
                          </button>
                          <label className="relative ml-1 inline-flex cursor-pointer items-center" title={s.attiva ? "Nascondi sezione" : "Mostra sezione"}>
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={s.attiva}
                              onChange={(e) => aggiornaSezione(s.tipo, (sez) => ({ ...sez, attiva: e.target.checked }))}
                              aria-label={`Mostra ${info.etichetta}`}
                            />
                            <span className="h-6 w-11 rounded-full bg-bordo transition-colors peer-checked:bg-oliva peer-focus-visible:ring-2 peer-focus-visible:ring-terracotta" />
                            <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                          </label>
                        </div>
                      </div>
                      {isAperta && (
                        <div className="space-y-6 border-t border-bordo px-4 pb-5 pt-4">
                          <SectionForm tipo={s.tipo} ctx={ctxPer(s)} />
                          {s.tipo === "consigli" && (
                            <PlacesEditor luoghi={guida.luoghi} onChange={aggiornaLuoghi} lingua={lingua} citta={guida.citta} />
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Anteprima live su telefono (desktop) */}
        <aside className="hidden lg:block" ref={anteprimaRef}>
          <div className="sticky top-36">
            <p className="mb-3 flex items-center justify-center gap-1.5 text-sm text-grigio">
              <Eye className="size-4" aria-hidden="true" /> Anteprima live
            </p>
            <PhoneMockup>{anteprima}</PhoneMockup>
          </div>
        </aside>
      </div>

      {/* Anteprima a tutto schermo (mobile) */}
      <button
        type="button"
        onClick={() => setAnteprimaMobile(true)}
        className={buttonClasses("primary", "md", "fixed bottom-5 right-5 z-30 shadow-lg lg:hidden")}
      >
        <Smartphone className="size-4" aria-hidden="true" /> Anteprima
      </button>
      {anteprimaMobile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-crema lg:hidden" role="dialog" aria-modal="true" aria-label="Anteprima della guida">
          <div className="flex items-center justify-between border-b border-bordo px-4 py-2">
            <span className="text-sm font-medium">Anteprima</span>
            <button type="button" onClick={() => setAnteprimaMobile(false)} className="flex size-10 items-center justify-center rounded-full hover:bg-sabbia" aria-label="Chiudi anteprima">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{anteprima}</div>
        </div>
      )}
    </div>
  );
}

function IndicatoreSalvataggio({ stato, onRiprova }: { stato: StatoSalvataggio; onRiprova: () => void }) {
  const base = "flex items-center gap-1 text-xs";
  switch (stato) {
    case "salvato":
      return (
        <span className={cn(base, "text-oliva")}>
          <Check className="size-3.5" aria-hidden="true" /> Tutte le modifiche sono salvate
        </span>
      );
    case "modifiche":
      return <span className={cn(base, "text-grigio")}>Modifiche in corso…</span>;
    case "salvataggio":
      return (
        <span className={cn(base, "text-grigio")}>
          <Spinner className="size-3" /> Salvataggio…
        </span>
      );
    case "errore":
      return (
        <span className={cn(base, "text-red-700")}>
          <CloudOff className="size-3.5" aria-hidden="true" /> Non salvato ·{" "}
          <button type="button" onClick={onRiprova} className="font-medium underline">
            riprova
          </button>
        </span>
      );
  }
}
