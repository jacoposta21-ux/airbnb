/**
 * Utilità immutabili per leggere e scrivere dentro il JSON dei contenuti
 * tramite un percorso, es. ["passi", 2, "testo"].
 */
import { CAMPI_CONDIVISI } from "@/lib/i18n";
import type { Lingua } from "@/types/guide";

export type Path = Array<string | number>;
type Obj = Record<string, unknown>;

export function getIn(obj: unknown, path: Path): unknown {
  let cur = obj;
  for (const key of path) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Obj)[key as string];
  }
  return cur;
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path;
  const next = typeof rest[0] === "number" ? [] : {};
  if (typeof key === "number") {
    const arr = Array.isArray(obj) ? [...obj] : [];
    arr[key] = setIn(arr[key] ?? next, rest, value);
    return arr as T;
  }
  const o = (obj && typeof obj === "object" ? { ...(obj as Obj) } : {}) as Obj;
  o[key] = setIn(o[key] ?? next, rest, value);
  return o as T;
}

/** Il campo finale del percorso è condiviso tra le lingue (password, colori…)? */
export function isCondiviso(path: Path) {
  const last = [...path].reverse().find((k) => typeof k === "string");
  return typeof last === "string" && CAMPI_CONDIVISI.has(last);
}

type Multilingua = Partial<Record<Lingua, unknown>>;

/** Scrive un valore nella lingua giusta (i campi condivisi vanno sempre in italiano). */
export function scriviCampo(contenuto: Multilingua, lingua: Lingua, path: Path, value: unknown): Multilingua {
  const target: Lingua = lingua === "it" || isCondiviso(path) ? "it" : lingua;
  return { ...contenuto, [target]: setIn(contenuto[target] ?? {}, path, value) };
}

/** Operazioni sulla struttura delle liste, applicate a tutte le lingue per restare allineate. */
export type OpLista = { tipo: "aggiungi"; item: unknown } | { tipo: "rimuovi"; index: number } | { tipo: "sposta"; da: number; a: number };

export function applicaOpLista(arr: unknown[], op: OpLista): unknown[] {
  const out = [...arr];
  switch (op.tipo) {
    case "aggiungi":
      out.push(op.item);
      return out;
    case "rimuovi":
      if (op.index < out.length) out.splice(op.index, 1);
      return out;
    case "sposta": {
      if (op.da >= out.length || op.a < 0 || op.a >= Math.max(out.length, 1)) return out;
      const [item] = out.splice(op.da, 1);
      out.splice(op.a, 0, item);
      return out;
    }
  }
}

export function opListaMultilingua(contenuto: Multilingua, path: Path, op: OpLista, baseIt: unknown[]): Multilingua {
  const out: Multilingua = { ...contenuto };
  // L'italiano definisce la struttura.
  out.it = setIn(contenuto.it ?? {}, path, applicaOpLista(baseIt, op));
  if (op.tipo === "aggiungi") return out;
  for (const lingua of Object.keys(contenuto) as Lingua[]) {
    if (lingua === "it") continue;
    const arr = getIn(contenuto[lingua], path);
    if (!Array.isArray(arr)) continue;
    // Allinea la lunghezza a quella italiana prima di spostare/rimuovere.
    const allineato = Array.from({ length: Math.max(arr.length, baseIt.length) }, (_, i) => arr[i] ?? null);
    out[lingua] = setIn(contenuto[lingua], path, applicaOpLista(allineato, op));
  }
  return out;
}
