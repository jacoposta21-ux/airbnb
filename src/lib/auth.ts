import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Accetta solo percorsi interni ("/dashboard", "/guide/…") per evitare
 * open redirect verso siti esterni.
 */
export function safeNextPath(value: FormDataEntryValue | string | null | undefined, fallback = "/dashboard") {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : fallback;
}

/**
 * Restituisce l'host loggato (profilo + client Supabase) oppure rimanda al login.
 * `cache` evita richieste duplicate nello stesso render.
 */
export const requireHost = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const { data: host } = await supabase.from("hosts").select("*").eq("id", data.user.id).maybeSingle();

  return {
    supabase,
    user: data.user,
    host: host ?? { id: data.user.id, email: data.user.email ?? "", nome: null, telefono: null, creato_il: "" },
  };
});
