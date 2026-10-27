import "server-only";

import { notFound } from "next/navigation";
import { requireHost } from "@/lib/auth";

/**
 * Email degli amministratori, separate da virgola (variabile ADMIN_EMAILS,
 * solo lato server). Nessun amministratore se non è impostata.
 */
function emailAdmin() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | null | undefined) {
  return Boolean(email) && emailAdmin().includes(email!.toLowerCase());
}

/** Consente l'accesso solo agli amministratori; per gli altri la pagina non esiste. */
export async function requireAdmin() {
  const sessione = await requireHost();
  if (!isAdmin(sessione.user.email)) notFound();
  return sessione;
}
