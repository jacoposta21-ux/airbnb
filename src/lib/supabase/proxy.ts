import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, supabaseEnv } from "./env";

/** Percorsi che richiedono login. */
const PROTECTED_PREFIXES = ["/dashboard", "/guide"];
/** Percorsi da cui un utente già loggato viene rimandato alla dashboard. */
const AUTH_PAGES = ["/login", "/registrati"];

/**
 * Aggiorna la sessione Supabase a ogni richiesta (refresh del token nei
 * cookie) e protegge le pagine riservate agli host.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const { url, key } = supabaseEnv();
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  // Non inserire codice tra createServerClient e getClaims: serve a
  // rinnovare il token in modo affidabile.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  if (!isLoggedIn && PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(path + request.nextUrl.search)}`;
    return redirectWithCookies(loginUrl, response);
  }

  if (isLoggedIn && AUTH_PAGES.includes(path)) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.search = "";
    return redirectWithCookies(dashUrl, response);
  }

  return response;
}

/** Redirect che conserva eventuali cookie di sessione appena aggiornati. */
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}
