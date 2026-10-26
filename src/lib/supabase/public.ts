import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Client anonimo, senza cookie: vede solo ciò che la RLS rende pubblico
 * (guide pubblicate e pagate). Usabile dentro funzioni in cache.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
