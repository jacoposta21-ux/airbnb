"use client";

import { Languages, X } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { traduciGuida, type EsitoTraduzione } from "@/lib/ai-actions";
import { BANDIERE, NOMI_LINGUE } from "@/lib/i18n";
import type { Lingua } from "@/types/guide";

const LINGUE_ESTERE: Exclude<Lingua, "it">[] = ["en", "fr", "de", "es"];

/**
 * Finestra per tradurre la guida con l'AI. Prima di tradurre salva le
 * modifiche in corso, così l'AI lavora sul testo italiano più recente.
 */
export function TranslatePanel({
  guideId,
  lingueAttive,
  aiDisponibile,
  salvaOra,
  onTradotta,
}: {
  guideId: string;
  lingueAttive: Lingua[];
  aiDisponibile: boolean;
  salvaOra: () => Promise<boolean>;
  onTradotta: (esito: EsitoTraduzione) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const [scelte, setScelte] = useState<Set<Exclude<Lingua, "it">>>(new Set(LINGUE_ESTERE));
  const [modo, setModo] = useState<"mancanti" | "tutto">("mancanti");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [fatto, setFatto] = useState<string | null>(null);

  const giaTradotte = lingueAttive.filter((l) => l !== "it");

  const avvia = async () => {
    setErrore(null);
    setFatto(null);
    setInCorso(true);
    try {
      if (!(await salvaOra())) {
        setErrore("Salva prima le modifiche (controlla gli errori in alto), poi riprova.");
        return;
      }
      const esito = await traduciGuida({ guideId, lingue: [...scelte], modo });
      if (!esito.ok) {
        setErrore(esito.error ?? "Traduzione non riuscita.");
        return;
      }
      onTradotta(esito);
      setFatto(`Fatto! Guida tradotta in ${[...scelte].map((l) => NOMI_LINGUE[l]).join(", ")}. Puoi correggere ogni testo a mano.`);
      setAperto(false);
    } catch {
      setErrore("Connessione interrotta durante la traduzione. Riprova.");
    } finally {
      setInCorso(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bordo bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-oliva-chiaro text-oliva">
            <Languages className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">Lingue della guida</p>
            <p className="text-sm text-grigio">
              {giaTradotte.length === 0
                ? "Per ora solo in italiano."
                : `Italiano + ${giaTradotte.map((l) => NOMI_LINGUE[l]).join(", ")}`}
            </p>
          </div>
        </div>
        {aiDisponibile ? (
          <Button size="sm" variant="secondary" onClick={() => setAperto((x) => !x)} aria-expanded={aperto}>
            Traduci con AI
          </Button>
        ) : (
          <span className="text-xs text-grigio">Traduzione AI non configurata</span>
        )}
      </div>

      {fatto && <Alert tone="success">{fatto}</Alert>}

      {aperto && (
        <div className="relative space-y-4 rounded-2xl border border-terracotta/30 bg-white p-5 shadow-morbida">
          <button
            type="button"
            onClick={() => setAperto(false)}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full hover:bg-sabbia"
            aria-label="Chiudi"
          >
            <X className="size-4" />
          </button>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Traduci in</legend>
            <div className="grid grid-cols-2 gap-2">
              {LINGUE_ESTERE.map((l) => (
                <label key={l} className="flex items-center gap-2.5 rounded-xl border border-bordo p-3 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5">
                  <input
                    type="checkbox"
                    className="size-4 accent-terracotta"
                    checked={scelte.has(l)}
                    onChange={() =>
                      setScelte((prev) => {
                        const next = new Set(prev);
                        if (next.has(l)) next.delete(l);
                        else next.add(l);
                        return next;
                      })
                    }
                  />
                  <span aria-hidden="true">{BANDIERE[l]}</span>
                  <span className="text-sm font-medium">{NOMI_LINGUE[l]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {giaTradotte.length > 0 && (
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium">Testi già tradotti</legend>
              <label className="flex items-start gap-2.5 text-sm">
                <input type="radio" name="modo" className="mt-0.5 accent-terracotta" checked={modo === "mancanti"} onChange={() => setModo("mancanti")} />
                <span>
                  <span className="font-medium">Traduci solo i testi mancanti</span>
                  <span className="block text-grigio">Conserva le traduzioni esistenti e le tue correzioni.</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm">
                <input type="radio" name="modo" className="mt-0.5 accent-terracotta" checked={modo === "tutto"} onChange={() => setModo("tutto")} />
                <span>
                  <span className="font-medium">Ritraduci tutto da capo</span>
                  <span className="block text-grigio">Da usare se hai cambiato il testo italiano. Le correzioni manuali vanno perse.</span>
                </span>
              </label>
            </fieldset>
          )}

          {errore && <Alert tone="error">{errore}</Alert>}

          <Button onClick={avvia} loading={inCorso} disabled={scelte.size === 0} className="w-full">
            {inCorso ? "Traduzione in corso… (circa 30-60 secondi)" : `Traduci in ${scelte.size} ${scelte.size === 1 ? "lingua" : "lingue"}`}
          </Button>
        </div>
      )}
    </div>
  );
}
