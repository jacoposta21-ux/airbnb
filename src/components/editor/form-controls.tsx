"use client";

import { ChevronDown, ChevronUp, ImagePlus, Lock, Plus, Trash2, X } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { Lingua } from "@/types/guide";
import { getIn, isCondiviso, type OpLista, type Path } from "./path";

/**
 * Contesto passato a tutti i campi di una sezione: sa in che lingua si sta
 * scrivendo e dove salvare ogni valore.
 */
export interface FormCtx {
  lingua: Lingua;
  /** true quando si modifica una traduzione (struttura bloccata). */
  traduzione: boolean;
  /** Contenuto italiano completo (definisce struttura e segnaposto). */
  base: unknown;
  /** Contenuto della lingua in modifica. */
  tr: unknown;
  set: (path: Path, value: unknown) => void;
  lista: (path: Path, op: OpLista) => void;
  caricaFoto: (file: File) => Promise<string>;
}

export function valore(ctx: FormCtx, path: Path): unknown {
  if (!ctx.traduzione || isCondiviso(path)) return getIn(ctx.base, path);
  return getIn(ctx.tr, path);
}

const inputCls =
  "w-full rounded-xl border border-bordo bg-white px-3.5 py-2.5 text-[15px] placeholder:text-grigio/50 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:cursor-not-allowed disabled:bg-sabbia/40 disabled:text-grigio";

interface CampoTestoProps {
  ctx: FormCtx;
  path: Path;
  label: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
  type?: "text" | "tel" | "url";
  mono?: boolean;
}

/** Campo di testo legato a un percorso del contenuto. */
export function CampoTesto({ ctx, path, label, multiline, rows = 3, hint, placeholder, type = "text", mono }: CampoTestoProps) {
  const id = useId();
  const condiviso = isCondiviso(path);
  const bloccato = ctx.traduzione && condiviso;
  const v = (valore(ctx, path) as string | undefined) ?? "";
  // In traduzione il segnaposto mostra il testo italiano da tradurre.
  const ph = ctx.traduzione && !condiviso ? ((getIn(ctx.base, path) as string) ?? "") : placeholder;

  const props = {
    id,
    value: v,
    placeholder: ph,
    disabled: bloccato,
    onChange: (e: { target: { value: string } }) => ctx.set(path, e.target.value),
    className: cn(inputCls, mono && "font-mono"),
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        {bloccato && (
          <span className="inline-flex items-center gap-1 text-xs font-normal text-grigio">
            <Lock className="size-3" aria-hidden="true" /> uguale in tutte le lingue
          </span>
        )}
      </label>
      {multiline ? <textarea rows={rows} {...props} /> : <input type={type} {...props} className={cn(props.className, "h-11")} />}
      {hint && !bloccato && <p className="text-xs text-grigio">{hint}</p>}
    </div>
  );
}

export function CampoSiNo({ ctx, path, label, hint }: { ctx: FormCtx; path: Path; label: string; hint?: string }) {
  const checked = Boolean(getIn(ctx.base, path));
  return (
    <label className={cn("flex items-start gap-3 rounded-xl border border-bordo bg-white p-3.5", ctx.traduzione && "opacity-60")}>
      <input
        type="checkbox"
        checked={checked}
        disabled={ctx.traduzione}
        onChange={(e) => ctx.set(path, e.target.checked)}
        className="mt-0.5 size-5 accent-terracotta"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-grigio">{hint}</span>}
      </span>
    </label>
  );
}

/** Pulsanti su/giù/elimina per gli elementi di una lista. */
function ControlliElemento({
  ctx,
  path,
  index,
  totale,
}: {
  ctx: FormCtx;
  path: Path;
  index: number;
  totale: number;
}) {
  if (ctx.traduzione) return null;
  const btn = "flex size-8 items-center justify-center rounded-full text-grigio hover:bg-sabbia hover:text-inchiostro disabled:opacity-30";
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className={btn} disabled={index === 0} onClick={() => ctx.lista(path, { tipo: "sposta", da: index, a: index - 1 })} aria-label="Sposta su">
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        className={btn}
        disabled={index === totale - 1}
        onClick={() => ctx.lista(path, { tipo: "sposta", da: index, a: index + 1 })}
        aria-label="Sposta giù"
      >
        <ChevronDown className="size-4" />
      </button>
      <button type="button" className={cn(btn, "hover:text-red-700")} onClick={() => ctx.lista(path, { tipo: "rimuovi", index })} aria-label="Elimina">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function PulsanteAggiungi({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-bordo px-4 py-2 text-sm font-medium text-grigio hover:border-terracotta hover:text-terracotta"
    >
      <Plus className="size-4" aria-hidden="true" />
      {children}
    </button>
  );
}

/** Lista di frasi (regole, checklist…). */
export function ListaTesti({
  ctx,
  path,
  label,
  aggiungi = "Aggiungi",
  placeholder,
}: {
  ctx: FormCtx;
  path: Path;
  label: string;
  aggiungi?: string;
  placeholder?: string;
}) {
  const items = (getIn(ctx.base, path) as string[] | undefined) ?? [];
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {items.map((itItem, i) => {
        const v = ctx.traduzione ? ((getIn(ctx.tr, [...path, i]) as string | undefined) ?? "") : itItem;
        return (
          <div key={i} className="flex items-center gap-1">
            <input
              value={v}
              placeholder={ctx.traduzione ? itItem : placeholder}
              onChange={(e) => ctx.set([...path, i], e.target.value)}
              className={cn(inputCls, "h-11")}
              aria-label={`${label} ${i + 1}`}
            />
            <ControlliElemento ctx={ctx} path={path} index={i} totale={items.length} />
          </div>
        );
      })}
      {!ctx.traduzione && <PulsanteAggiungi onClick={() => ctx.lista(path, { tipo: "aggiungi", item: "" })}>{aggiungi}</PulsanteAggiungi>}
    </fieldset>
  );
}

/** Lista di oggetti (passi del check-in, elettrodomestici, rifiuti…). */
export function ListaOggetti({
  ctx,
  path,
  label,
  nuovo,
  aggiungi = "Aggiungi",
  titolo,
  children,
}: {
  ctx: FormCtx;
  path: Path;
  label: string;
  nuovo: () => unknown;
  aggiungi?: string;
  titolo: (index: number) => string;
  children: (index: number) => ReactNode;
}) {
  const items = (getIn(ctx.base, path) as unknown[] | undefined) ?? [];
  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {items.map((_, i) => (
        <div key={i} className="rounded-xl border border-bordo bg-crema/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-grigio">{titolo(i)}</span>
            <ControlliElemento ctx={ctx} path={path} index={i} totale={items.length} />
          </div>
          <div className="space-y-3">{children(i)}</div>
        </div>
      ))}
      {!ctx.traduzione && <PulsanteAggiungi onClick={() => ctx.lista(path, { tipo: "aggiungi", item: nuovo() })}>{aggiungi}</PulsanteAggiungi>}
    </fieldset>
  );
}

/** Caricamento di una foto (campo condiviso tra le lingue). */
export function CampoFoto({
  url,
  onChange,
  carica,
  label = "Foto (facoltativa)",
  disabled,
  aspect = "aspect-[4/3]",
}: {
  url?: string | null;
  onChange: (url: string | null) => void;
  carica: (file: File) => Promise<string>;
  label?: string;
  disabled?: boolean;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setErrore(null);
    try {
      onChange(await carica(file));
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Caricamento non riuscito.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium">{label}</span>
      {url ? (
        <div className={cn("relative w-40 overflow-hidden rounded-xl border border-bordo bg-sabbia", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- anteprima di un file caricato */}
          <img src={url} alt="" className="size-full object-cover" />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 text-inchiostro shadow"
              aria-label="Rimuovi foto"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-bordo bg-white text-xs text-grigio hover:border-terracotta hover:text-terracotta disabled:opacity-50"
        >
          {loading ? <Spinner className="size-5" /> : <ImagePlus className="size-5" aria-hidden="true" />}
          {loading ? "Caricamento…" : "Carica foto"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {errore && <p className="text-xs text-red-700">{errore}</p>}
    </div>
  );
}

/** CampoFoto legato a un percorso del contenuto. */
export function CampoFotoPath({ ctx, path, label }: { ctx: FormCtx; path: Path; label?: string }) {
  return (
    <CampoFoto
      url={getIn(ctx.base, path) as string | undefined}
      onChange={(url) => ctx.set(path, url ?? "")}
      carica={ctx.caricaFoto}
      label={label}
      disabled={ctx.traduzione}
    />
  );
}
