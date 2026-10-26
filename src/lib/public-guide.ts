import "server-only";

import { unstable_cache } from "next/cache";
import { DEMO_GUIDE } from "@/data/demo-guide";
import { DEMO_SLUG } from "@/lib/config";
import { loadGuidaCompleta } from "@/lib/guides";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { GuidaCompleta } from "@/types/guide";

/** Tag di cache della guida pubblica: invalidato a ogni salvataggio. */
export const tagGuida = (slug: string) => `guida:${slug}`;

/**
 * Guida pubblicata e pagata, in cache (si aggiorna quando l'host salva).
 * Le guide pubbliche si leggono con il client anonimo: la RLS garantisce che
 * bozze e guide non pagate non escano mai da qui.
 */
function guidaPubblicaInCache(slug: string) {
  return unstable_cache(
    async () => {
      const guida = await loadGuidaCompleta(createPublicClient(), { slug });
      if (!guida) return null;
      const { host_id: _hostId, ...pubblica } = guida;
      void _hostId;
      return pubblica;
    },
    ["guida-pubblica", slug],
    { tags: [tagGuida(slug)], revalidate: 3600 },
  )();
}

export type RisultatoGuida =
  | { tipo: "pubblica"; guida: GuidaCompleta }
  | { tipo: "anteprima"; guida: GuidaCompleta }
  | { tipo: "demo"; guida: GuidaCompleta };

/**
 * Risolve /g/[slug]:
 *  1. guida pubblica (in cache);
 *  2. altrimenti, se l'utente loggato è il proprietario, anteprima con filigrana;
 *  3. altrimenti, per lo slug demo, la guida d'esempio integrata nel codice.
 */
export async function risolviGuida(slug: string): Promise<RisultatoGuida | null> {
  if (isSupabaseConfigured()) {
    const pubblica = await guidaPubblicaInCache(slug);
    if (pubblica) return { tipo: "pubblica", guida: pubblica };

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.sub) {
      const propria = await loadGuidaCompleta(supabase, { slug });
      if (propria && propria.host_id === data.claims.sub) return { tipo: "anteprima", guida: propria };
    }
  }

  if (slug === DEMO_SLUG) return { tipo: "demo", guida: DEMO_GUIDE };
  return null;
}
