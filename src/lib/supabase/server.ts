import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Client Supabase per Server Component, Server Action e Route Handler.
 * Agisce con i permessi dell'utente loggato (RLS attiva).
 * Va creato a ogni richiesta, mai condiviso.
 */
export async function createClient() {
  // Prima i cookie: rende la pagina dinamica anche se l'env manca.
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chiamato da un Server Component: i cookie non si possono scrivere.
          // Nessun problema, la sessione viene aggiornata dal proxy.
        }
      },
    },
  });
}
