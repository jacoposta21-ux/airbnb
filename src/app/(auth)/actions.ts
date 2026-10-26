"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";

export interface AuthState {
  error?: string;
  message?: string;
  fields?: { email?: string; nome?: string };
}

const loginSchema = z.object({
  email: z.email("Inserisci un indirizzo email valido."),
  password: z.string().min(1, "Inserisci la password."),
});

const signupSchema = z.object({
  nome: z.string().trim().min(2, "Inserisci il tuo nome.").max(80),
  email: z.email("Inserisci un indirizzo email valido."),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri."),
});

/** Origine della richiesta (http://localhost:3000, https://…vercel.app, …). */
async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

/** Traduce gli errori più comuni di Supabase Auth in italiano. */
function traduciErrore(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o password non corretti.";
  if (m.includes("email not confirmed")) return "Conferma prima il tuo indirizzo email: controlla la posta in arrivo.";
  if (m.includes("already registered")) return "Esiste già un account con questa email. Prova ad accedere.";
  if (m.includes("rate limit")) return "Troppi tentativi. Riprova tra qualche minuto.";
  if (m.includes("password")) return "La password non rispetta i requisiti di sicurezza.";
  return "Si è verificato un errore. Riprova tra poco.";
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const fields = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: traduciErrore(error.message), fields };

  redirect(safeNextPath(formData.get("next")));
}

export async function registrati(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  const fields = { email: String(formData.get("email") ?? ""), nome: String(formData.get("nome") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { nome: parsed.data.nome },
      emailRedirectTo: `${await origin()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: traduciErrore(error.message), fields };

  // Se la conferma email è disattivata, la sessione è già attiva.
  if (data.session) redirect("/dashboard");

  return {
    message: `Ti abbiamo inviato un'email a ${parsed.data.email}. Clicca sul link per attivare l'account.`,
    fields,
  };
}

export async function loginConGoogle(formData: FormData) {
  const supabase = await createClient();
  const next = safeNextPath(formData.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?errore=google");
  redirect(data.url);
}
