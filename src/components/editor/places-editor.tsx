"use client";

import { ChevronDown, ChevronUp, Link2, Plus, Trash2 } from "lucide-react";
import { ICONE_CATEGORIA } from "@/components/guide/section-icon";
import { DIZIONARI } from "@/lib/i18n";
import { mapsSearchUrl } from "@/lib/utils";
import { CATEGORIE_LUOGO, type CategoriaLuogo, type Lingua, type Luogo } from "@/types/guide";

const inputCls =
  "w-full rounded-xl border border-bordo bg-white px-3.5 py-2.5 text-[15px] placeholder:text-grigio/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:bg-sabbia/40 disabled:text-grigio";

/** Editor dei consigli locali: ristoranti, bar, supermercati, farmacie, attrazioni. */
export function PlacesEditor({
  luoghi,
  onChange,
  lingua,
  citta,
}: {
  luoghi: Luogo[];
  onChange: (luoghi: Luogo[]) => void;
  lingua: Lingua;
  citta: string;
}) {
  const traduzione = lingua !== "it";
  const aggiorna = (id: string, patch: Partial<Luogo>) => onChange(luoghi.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const sposta = (da: number, a: number) => {
    const next = [...luoghi];
    const [item] = next.splice(da, 1);
    next.splice(a, 0, item);
    onChange(next.map((l, i) => ({ ...l, ordine: i })));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Luoghi consigliati</p>
      {luoghi.length === 0 && <p className="text-sm text-grigio">Aggiungi i tuoi posti preferiti: il primo ristorante, il bar per la colazione, il supermercato più vicino…</p>}
      {luoghi.map((l, i) => {
        const Icon = ICONE_CATEGORIA[l.categoria];
        return (
          <div key={l.id} className="space-y-3 rounded-xl border border-bordo bg-crema/60 p-3">
            <div className="flex items-center gap-2">
              <Icon className="size-4 shrink-0 text-grigio" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-grigio">{l.nome || `Luogo ${i + 1}`}</span>
              {!traduzione && (
                <div className="flex">
                  <button type="button" disabled={i === 0} onClick={() => sposta(i, i - 1)} className="flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia disabled:opacity-30" aria-label="Sposta su">
                    <ChevronUp className="size-4" />
                  </button>
                  <button type="button" disabled={i === luoghi.length - 1} onClick={() => sposta(i, i + 1)} className="flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia disabled:opacity-30" aria-label="Sposta giù">
                    <ChevronDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => onChange(luoghi.filter((x) => x.id !== l.id))} className="flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia hover:text-red-700" aria-label="Elimina">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>
            {!traduzione && (
              <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <select
                  value={l.categoria}
                  onChange={(e) => aggiorna(l.id, { categoria: e.target.value as CategoriaLuogo })}
                  className={`${inputCls} h-11`}
                  aria-label="Categoria"
                >
                  {CATEGORIE_LUOGO.map((c) => (
                    <option key={c} value={c}>
                      {DIZIONARI.it.categorie[c]}
                    </option>
                  ))}
                </select>
                <input value={l.nome} onChange={(e) => aggiorna(l.id, { nome: e.target.value })} placeholder="Nome del locale" className={`${inputCls} h-11`} aria-label="Nome" />
              </div>
            )}
            <textarea
              rows={2}
              value={l.descrizione[lingua] ?? ""}
              placeholder={traduzione ? l.descrizione.it : "Perché lo consigli? Cosa ordinare?"}
              onChange={(e) => aggiorna(l.id, { descrizione: { ...l.descrizione, [lingua]: e.target.value } })}
              className={inputCls}
              aria-label="Descrizione"
            />
            {!traduzione && (
              <div className="flex gap-2">
                <input
                  value={l.maps_url ?? ""}
                  onChange={(e) => aggiorna(l.id, { maps_url: e.target.value || null })}
                  placeholder="Link Google Maps (facoltativo)"
                  className={`${inputCls} h-11`}
                  aria-label="Link Google Maps"
                />
                <button
                  type="button"
                  disabled={!l.nome.trim()}
                  onClick={() => aggiorna(l.id, { maps_url: mapsSearchUrl([l.nome, citta].filter(Boolean).join(", ")) })}
                  className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-bordo bg-white px-3 text-sm hover:bg-sabbia disabled:opacity-40"
                  title="Genera il link cercando il nome su Google Maps"
                >
                  <Link2 className="size-4" aria-hidden="true" />
                  Genera
                </button>
              </div>
            )}
          </div>
        );
      })}
      {!traduzione && (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...luoghi,
              { id: crypto.randomUUID(), categoria: "ristorante", nome: "", descrizione: {}, maps_url: null, ordine: luoghi.length },
            ])
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-bordo px-4 py-2 text-sm font-medium text-grigio hover:border-terracotta hover:text-terracotta"
        >
          <Plus className="size-4" aria-hidden="true" /> Aggiungi un luogo
        </button>
      )}
    </div>
  );
}
