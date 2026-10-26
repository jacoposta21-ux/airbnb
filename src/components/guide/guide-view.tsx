"use client";

import { ArrowUp, MessageCircle, Navigation, Phone, Wifi } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { APP_NAME } from "@/lib/config";
import { BANDIERE, DIZIONARI, NOMI_LINGUE, localizza } from "@/lib/i18n";
import { contenutoPredefinito } from "@/lib/sections";
import { cn, mapsDirectionsUrl, whatsappUrl } from "@/lib/utils";
import type { ContenutiSezione, GuidaCompleta, Lingua, Sezione, TipoSezione } from "@/types/guide";
import { copiaTesto } from "./copy-button";
import {
  ArrivoBody,
  BenvenutoBody,
  CasaBody,
  CheckoutBody,
  ConsigliBody,
  DifferenziataBody,
  EmergenzeBody,
  ParcheggioBody,
  RegoleBody,
  TassaBody,
  WifiBody,
} from "./section-bodies";
import { SectionIcon } from "./section-icon";

export interface GuideViewProps {
  guida: GuidaCompleta;
  linguaIniziale?: Lingua;
  /** Lingua controllata dall'esterno (anteprima dell'editor). */
  lingua?: Lingua;
  /** Mostra la filigrana "anteprima" (guide non pagate). */
  filigrana?: boolean;
  /** Registra visite e sezioni consultate (solo guida pubblica). */
  tracciaVisite?: boolean;
  /** Dentro un mockup di telefono: niente modifiche all'URL. */
  incorporata?: boolean;
}

/** Contenuto localizzato di una sezione, tipizzato. */
function contenuto<T extends TipoSezione>(sezione: Sezione, lingua: Lingua): ContenutiSezione[T] {
  const tipo = sezione.tipo as T;
  return localizza(sezione.contenuto as Partial<Record<Lingua, ContenutiSezione[T]>>, lingua, contenutoPredefinito(tipo));
}

/** Invia un evento di visita senza bloccare la pagina. */
function inviaVisita(guideId: string, sezione: TipoSezione | null) {
  const body = JSON.stringify({ guideId, sezione });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/visite", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // ignora e prova con fetch
  }
  fetch("/api/visite", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}

export function GuideView({
  guida,
  linguaIniziale = "it",
  lingua: linguaControllata,
  filigrana = false,
  tracciaVisite = false,
  incorporata = false,
}: GuideViewProps) {
  const [linguaInterna, setLinguaInterna] = useState<Lingua>(linguaIniziale);
  const lingua = linguaControllata ?? linguaInterna;
  const t = DIZIONARI[lingua];
  const [attiva, setAttiva] = useState<TipoSezione | null>(null);
  const [wifiCopiato, setWifiCopiato] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const sezioni = useMemo(
    () => guida.sezioni.filter((s) => s.attiva).sort((a, b) => a.ordine - b.ordine),
    [guida.sezioni],
  );

  const arrivo = sezioni.find((s) => s.tipo === "arrivo");
  const indirizzo = arrivo ? contenuto<"arrivo">(arrivo, lingua).indirizzo : "";
  const wifi = sezioni.find((s) => s.tipo === "wifi");
  const passwordWifi = wifi ? contenuto<"wifi">(wifi, lingua).password : "";

  // --- Cambio lingua ---------------------------------------------------------
  const cambiaLingua = (nuova: Lingua) => {
    setLinguaInterna(nuova);
    if (!incorporata) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", nuova);
      window.history.replaceState(null, "", url);
      document.documentElement.lang = nuova;
    }
  };

  // --- Statistiche: una visita per sessione, sezioni lette per almeno 1,5 s ---
  const tracciate = useRef(new Set<string>());
  const traccia = useCallback(
    (sezione: TipoSezione | null) => {
      if (!tracciaVisite) return;
      const key = `${guida.id}:${sezione ?? "_"}`;
      if (tracciate.current.has(key)) return;
      try {
        if (sessionStorage.getItem(`v:${key}`)) return;
        sessionStorage.setItem(`v:${key}`, "1");
      } catch {
        // sessionStorage non disponibile (navigazione privata): si traccia comunque una volta
      }
      tracciate.current.add(key);
      inviaVisita(guida.id, sezione);
    },
    [guida.id, tracciaVisite],
  );

  useEffect(() => {
    traccia(null);
  }, [traccia]);

  // Guida pubblica: salva una copia per riaprirla anche offline.
  useEffect(() => {
    if (incorporata || !("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw-guida.js").catch(() => {});
  }, [incorporata]);

  // --- Evidenzia la sezione visibile e misura la lettura ---------------------
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const tipo = (entry.target as HTMLElement).dataset.tipo as TipoSezione;
          if (entry.isIntersecting) {
            setAttiva(tipo);
            if (!timers.has(tipo)) timers.set(tipo, setTimeout(() => traccia(tipo), 1500));
          } else {
            clearTimeout(timers.get(tipo));
            timers.delete(tipo);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    root.querySelectorAll("[data-tipo]").forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [sezioni, traccia]);

  // Mantiene visibile la scheda attiva nella barra di navigazione orizzontale.
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelector<HTMLElement>(`[data-chip="${attiva}"]`);
    if (nav && chip) nav.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [attiva]);

  const vaiA = (tipo: TipoSezione) => {
    rootRef.current?.querySelector(`#sez-${tipo}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const azioni = [
    guida.contatto_telefono && {
      key: "chiama",
      label: t.chiama,
      icon: Phone,
      href: `tel:${guida.contatto_telefono.replace(/\s/g, "")}`,
    },
    guida.contatto_whatsapp && {
      key: "whatsapp",
      label: t.whatsapp,
      icon: MessageCircle,
      href: whatsappUrl(guida.contatto_whatsapp),
    },
    indirizzo && { key: "indicazioni", label: t.indicazioni, icon: Navigation, href: mapsDirectionsUrl(indirizzo) },
    passwordWifi && {
      key: "wifi",
      label: wifiCopiato ? t.copiato : t.wifi,
      icon: Wifi,
      onClick: async () => {
        if (await copiaTesto(passwordWifi)) {
          setWifiCopiato(true);
          setTimeout(() => setWifiCopiato(false), 2000);
        }
      },
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    icon: typeof Phone;
    href?: string;
    onClick?: () => void;
  }>;

  const style = { "--brand": guida.colore } as CSSProperties;

  return (
    <div ref={rootRef} lang={lingua} style={style} className="@container relative min-h-full bg-crema pb-10 text-inchiostro">
      {filigrana && (
        <>
          <div className="sticky top-0 z-40 bg-inchiostro px-4 py-2 text-center text-xs font-medium text-white">
            <span className="mr-1.5 rounded bg-oro px-1.5 py-0.5 font-bold uppercase text-inchiostro">{t.anteprima}</span>
            {t.anteprimaTesto}
          </div>
          <div
            className="pointer-events-none fixed inset-0 z-30 select-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='180'><text x='130' y='100' text-anchor='middle' transform='rotate(-30 130 90)' font-family='sans-serif' font-size='30' font-weight='700' fill='rgba(42,33,28,0.07)'>${t.anteprima.toUpperCase()}</text></svg>`,
              )}")`,
            }}
          />
        </>
      )}

      {/* Copertina */}
      <header className="relative">
        <div className="relative aspect-[4/3] max-h-[52vh] w-full overflow-hidden bg-[var(--brand)] @xl:aspect-[16/7]">
          {guida.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element -- immagine caricata dall'host, già compressa
            <img src={guida.cover_url} alt="" className="size-full object-cover" fetchPriority="high" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          {guida.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo dell'host
            <img src={guida.logo_url} alt="" className="h-11 w-auto max-w-[40%] rounded-lg bg-white/90 object-contain p-1" />
          ) : (
            <span />
          )}
          {guida.lingue_attive.length > 1 && !linguaControllata && (
            <label className="relative">
              <span className="sr-only">{t.lingua}</span>
              <select
                value={lingua}
                onChange={(e) => cambiaLingua(e.target.value as Lingua)}
                className="h-10 appearance-none rounded-full bg-white/95 pl-3 pr-8 text-sm font-medium text-inchiostro shadow-sm"
              >
                {guida.lingue_attive.map((l) => (
                  <option key={l} value={l}>
                    {BANDIERE[l]} {NOMI_LINGUE[l]}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs" aria-hidden="true">
                ▾
              </span>
            </label>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {guida.citta && <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/85">{guida.citta}</p>}
          <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight @xl:text-4xl">{guida.nome_struttura}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        {/* Azioni rapide */}
        {azioni.length > 0 && (
          <div
            className="relative z-10 -mt-1 grid gap-2 rounded-b-2xl bg-white p-3 shadow-morbida"
            style={{ gridTemplateColumns: `repeat(${azioni.length}, minmax(0, 1fr))` }}
          >
            {azioni.map((a) => {
              const inner = (
                <>
                  <span className="flex size-11 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                    <a.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium">{a.label}</span>
                </>
              );
              const cls = "flex flex-col items-center gap-1.5 rounded-xl py-1.5 active:bg-crema";
              return a.href ? (
                <a
                  key={a.key}
                  href={a.href}
                  className={cls}
                  target={a.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <button key={a.key} type="button" onClick={a.onClick} className={cls}>
                  {inner}
                </button>
              );
            })}
          </div>
        )}

        {/* Indice */}
        <section aria-labelledby="indice" className="mt-6">
          <h2 id="indice" className="mb-3 text-sm font-semibold uppercase tracking-wide text-grigio">
            {t.indice}
          </h2>
          <div className="grid grid-cols-3 gap-2 @lg:grid-cols-4">
            {sezioni.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => vaiA(s.tipo)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-morbida transition-transform active:scale-95"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                  <SectionIcon tipo={s.tipo} className="size-5" />
                </span>
                <span className="text-[13px] font-medium leading-tight">{t.sezioni[s.tipo]}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Navigazione a schede, sempre visibile */}
      <nav
        className={cn(
          "sticky z-20 mt-6 border-y border-bordo/70 bg-crema/95 backdrop-blur",
          filigrana ? "top-8" : "top-0",
        )}
        aria-label={t.indice}
      >
        <div ref={navRef} className="relative mx-auto flex max-w-2xl gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
          {sezioni.map((s) => (
            <button
              key={s.id}
              type="button"
              data-chip={s.tipo}
              onClick={() => vaiA(s.tipo)}
              aria-current={attiva === s.tipo ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                attiva === s.tipo ? "bg-[var(--brand)] text-white" : "bg-white text-inchiostro",
              )}
            >
              <SectionIcon tipo={s.tipo} className="size-3.5" />
              {t.sezioni[s.tipo]}
            </button>
          ))}
        </div>
      </nav>

      {/* Sezioni */}
      <main className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {sezioni.map((s) => (
          <section
            key={s.id}
            id={`sez-${s.tipo}`}
            data-tipo={s.tipo}
            aria-labelledby={`tit-${s.tipo}`}
            className="scroll-mt-20 rounded-2xl bg-white p-5 shadow-morbida"
          >
            <h2 id={`tit-${s.tipo}`} className="mb-4 flex items-center gap-2.5 font-serif text-xl font-semibold">
              <span className="flex size-9 items-center justify-center rounded-full bg-[var(--brand)]/10 text-[var(--brand)]">
                <SectionIcon tipo={s.tipo} className="size-[18px]" />
              </span>
              {t.sezioni[s.tipo]}
            </h2>
            <CorpoSezione sezione={s} guida={guida} lingua={lingua} />
          </section>
        ))}

        <footer className="flex flex-col items-center gap-3 pt-6 text-center text-xs text-grigio">
          <button
            type="button"
            onClick={() => rootRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 hover:bg-sabbia"
          >
            <ArrowUp className="size-3.5" aria-hidden="true" /> {t.tornaSu}
          </button>
          <span>
            {t.creatoCon} <span className="font-semibold">{APP_NAME}</span>
          </span>
        </footer>
      </main>
    </div>
  );
}

function CorpoSezione({ sezione, guida, lingua }: { sezione: Sezione; guida: GuidaCompleta; lingua: Lingua }) {
  const t = DIZIONARI[lingua];
  switch (sezione.tipo) {
    case "benvenuto":
      return <BenvenutoBody c={contenuto<"benvenuto">(sezione, lingua)} t={t} />;
    case "arrivo":
      return <ArrivoBody c={contenuto<"arrivo">(sezione, lingua)} t={t} />;
    case "wifi":
      return <WifiBody c={contenuto<"wifi">(sezione, lingua)} t={t} />;
    case "casa":
      return <CasaBody c={contenuto<"casa">(sezione, lingua)} t={t} />;
    case "regole":
      return <RegoleBody c={contenuto<"regole">(sezione, lingua)} t={t} />;
    case "differenziata":
      return <DifferenziataBody c={contenuto<"differenziata">(sezione, lingua)} t={t} />;
    case "tassa":
      return <TassaBody c={contenuto<"tassa">(sezione, lingua)} t={t} />;
    case "parcheggio":
      return <ParcheggioBody c={contenuto<"parcheggio">(sezione, lingua)} t={t} />;
    case "consigli":
      return <ConsigliBody c={contenuto<"consigli">(sezione, lingua)} t={t} luoghi={guida.luoghi} lingua={lingua} />;
    case "emergenze":
      return (
        <EmergenzeBody
          c={contenuto<"emergenze">(sezione, lingua)}
          t={t}
          contatto={{ nome: guida.contatto_nome, telefono: guida.contatto_telefono }}
        />
      );
    case "checkout":
      return <CheckoutBody c={contenuto<"checkout">(sezione, lingua)} t={t} />;
  }
}
