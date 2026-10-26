/** Utilità per unire le traduzioni generate dall'AI con quelle esistenti. */

/** Mantiene i testi già tradotti (anche corretti a mano) e riempie solo i vuoti. */
export function preferisciEsistente(nuovo: unknown, esistente: unknown): unknown {
  if (typeof esistente === "string") return esistente.trim() ? esistente : nuovo;
  if (Array.isArray(nuovo)) {
    const es = Array.isArray(esistente) ? esistente : [];
    return nuovo.map((v, i) => preferisciEsistente(v, es[i]));
  }
  if (nuovo && typeof nuovo === "object") {
    const es = esistente && typeof esistente === "object" ? (esistente as Record<string, unknown>) : {};
    return Object.fromEntries(Object.entries(nuovo).map(([k, v]) => [k, preferisciEsistente(v, es[k])]));
  }
  return nuovo ?? esistente;
}

/** Riallinea le liste tradotte alla lunghezza di quelle italiane. */
export function allinea(tradotto: unknown, base: unknown): unknown {
  if (Array.isArray(base)) {
    const tr = Array.isArray(tradotto) ? tradotto : [];
    return base.map((b, i) => allinea(tr[i], b));
  }
  if (base && typeof base === "object") {
    const tr = tradotto && typeof tradotto === "object" ? (tradotto as Record<string, unknown>) : {};
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, allinea(tr[k], v)]));
  }
  if (typeof base === "string") return typeof tradotto === "string" ? tradotto : "";
  return base;
}
