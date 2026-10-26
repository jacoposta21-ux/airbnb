"use client";

import { Lock, Trash2 } from "lucide-react";
import { eliminaGuida } from "@/lib/guide-actions";
import { SITE_URL } from "@/lib/config";
import { BANDIERE, NOMI_LINGUE } from "@/lib/i18n";
import { slugify } from "@/lib/utils";
import { LINGUE, type Guida, type Lingua } from "@/types/guide";
import { CampoFoto } from "./form-controls";

const inputCls =
  "w-full h-11 rounded-xl border border-bordo bg-white px-3.5 text-[15px] placeholder:text-grigio/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:bg-sabbia/40 disabled:text-grigio";

/** Palette proposte: calde, leggibili su bianco, con testo bianco sopra. */
export const COLORI_BRAND = ["#C4572E", "#A2431F", "#B8862B", "#5F6F34", "#2F6D6A", "#2F5D8C", "#7A3E6B", "#2A211C"];

function Campo({ label, children, hint }: { label: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-grigio">{hint}</span>}
    </label>
  );
}

export function SettingsPanel({
  guida,
  onChange,
  carica,
}: {
  guida: Guida;
  onChange: (patch: Partial<Guida>) => void;
  carica: (file: File, maxLato?: number) => Promise<string>;
}) {
  const toggleLingua = (l: Lingua) => {
    if (l === "it") return;
    const attive = guida.lingue_attive.includes(l)
      ? guida.lingue_attive.filter((x) => x !== l)
      : LINGUE.filter((x) => x === l || guida.lingue_attive.includes(x));
    onChange({ lingue_attive: attive });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold">La struttura</h3>
        <Campo label="Nome della struttura">
          <input className={inputCls} value={guida.nome_struttura} onChange={(e) => onChange({ nome_struttura: e.target.value })} />
        </Campo>
        <Campo label="Città">
          <input className={inputCls} value={guida.citta} onChange={(e) => onChange({ citta: e.target.value })} />
        </Campo>
        <Campo
          label="Link della guida"
          hint={
            guida.pagata ? (
              <span className="inline-flex items-center gap-1">
                <Lock className="size-3" aria-hidden="true" /> Dopo la pubblicazione il link non si cambia più (è nei QR code stampati).
              </span>
            ) : (
              "Solo lettere minuscole, numeri e trattini."
            )
          }
        >
          <div className="flex items-center overflow-hidden rounded-xl border border-bordo bg-white focus-within:border-terracotta">
            <span className="hidden shrink-0 bg-sabbia/60 px-3 py-2.5 text-sm text-grigio sm:block">
              {SITE_URL.replace(/^https?:\/\//, "")}/g/
            </span>
            <input
              className="h-11 min-w-0 flex-1 px-3 text-[15px] focus:outline-none disabled:bg-sabbia/40 disabled:text-grigio"
              value={guida.slug}
              disabled={guida.pagata}
              onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              onBlur={(e) => onChange({ slug: slugify(e.target.value) || guida.slug })}
            />
          </div>
        </Campo>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold">Aspetto</h3>
        <div className="space-y-1.5">
          <span className="block text-sm font-medium">Colore principale</span>
          <div className="flex flex-wrap items-center gap-2">
            {COLORI_BRAND.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange({ colore: c })}
                aria-label={`Colore ${c}`}
                aria-pressed={guida.colore.toLowerCase() === c.toLowerCase()}
                className="size-9 rounded-full border-2 border-white shadow ring-1 ring-bordo aria-pressed:ring-2 aria-pressed:ring-inchiostro"
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={guida.colore}
              onChange={(e) => onChange({ colore: e.target.value })}
              className="size-9 cursor-pointer rounded-full border border-bordo bg-white p-0.5"
              aria-label="Scegli un altro colore"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          <CampoFoto
            label="Foto di copertina"
            url={guida.cover_url}
            onChange={(url) => onChange({ cover_url: url })}
            carica={(f) => carica(f, 1600)}
          />
          <CampoFoto
            label="Logo (facoltativo)"
            url={guida.logo_url}
            onChange={(url) => onChange({ logo_url: url })}
            carica={(f) => carica(f, 400)}
            aspect="aspect-square"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-lg font-semibold">Contatti per gli ospiti</h3>
        <p className="-mt-2 text-sm text-grigio">Compaiono nei pulsanti rapidi “Chiama” e “WhatsApp” in cima alla guida.</p>
        <Campo label="Nome">
          <input className={inputCls} value={guida.contatto_nome ?? ""} onChange={(e) => onChange({ contatto_nome: e.target.value || null })} />
        </Campo>
        <Campo label="Telefono">
          <input type="tel" className={inputCls} value={guida.contatto_telefono ?? ""} placeholder="+39 333 123 4567" onChange={(e) => onChange({ contatto_telefono: e.target.value || null })} />
        </Campo>
        <Campo label="WhatsApp" hint="Con prefisso internazionale, es. +39 333 123 4567.">
          <input type="tel" className={inputCls} value={guida.contatto_whatsapp ?? ""} placeholder="+39 333 123 4567" onChange={(e) => onChange({ contatto_whatsapp: e.target.value || null })} />
        </Campo>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-lg font-semibold">Lingue della guida</h3>
        <p className="-mt-1 text-sm text-grigio">
          Scrivi in italiano, poi attiva le altre lingue: l&apos;ospite vedrà la guida nella lingua del suo telefono.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LINGUE.map((l) => (
            <label key={l} className="flex items-center gap-2.5 rounded-xl border border-bordo bg-white p-3 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5">
              <input
                type="checkbox"
                checked={guida.lingue_attive.includes(l)}
                disabled={l === "it"}
                onChange={() => toggleLingua(l)}
                className="size-4 accent-terracotta"
              />
              <span aria-hidden="true">{BANDIERE[l]}</span>
              <span className="text-sm font-medium">{NOMI_LINGUE[l]}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 p-4">
        <h3 className="font-medium text-red-800">Elimina guida</h3>
        <p className="mt-1 text-sm text-grigio">L&apos;operazione non si può annullare. Il link e i QR code smetteranno di funzionare.</p>
        <form
          action={eliminaGuida}
          onSubmit={(e) => {
            if (!confirm(`Eliminare definitivamente “${guida.nome_struttura}”?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={guida.id} />
          <button type="submit" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
            <Trash2 className="size-4" aria-hidden="true" /> Elimina guida
          </button>
        </form>
      </section>
    </div>
  );
}
