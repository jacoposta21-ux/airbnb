import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Dati per il pannello admin. Usa il service role (ignora la RLS): chiamare
 * solo dopo requireAdmin().
 */

const giorniFa = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export interface PanoramicaAdmin {
  host: number;
  hostNuovi7: number;
  guide: number;
  guideOnline: number;
  guidePagate: number;
  incassoTotale: number;
  incasso30: number;
  pagamenti: number;
  rimborsi: number;
  visite30: number;
  richiesteAi24h: number;
  richiesteAi30: number;
}

export async function caricaPanoramica(): Promise<PanoramicaAdmin> {
  const db = createAdminClient();
  const conta = async (q: PromiseLike<{ count: number | null; error: unknown }>) => (await q).count ?? 0;

  const [host, hostNuovi7, guide, guideOnline, guidePagate, rimborsi, visite30, ai24, ai30, pagati] = await Promise.all([
    conta(db.from("hosts").select("id", { count: "exact", head: true })),
    conta(db.from("hosts").select("id", { count: "exact", head: true }).gte("creato_il", giorniFa(7))),
    conta(db.from("guides").select("id", { count: "exact", head: true })),
    conta(db.from("guides").select("id", { count: "exact", head: true }).eq("pagata", true).eq("stato", "pubblicata")),
    conta(db.from("guides").select("id", { count: "exact", head: true }).eq("pagata", true)),
    conta(db.from("payments").select("id", { count: "exact", head: true }).eq("stato", "rimborsato")),
    conta(db.from("views").select("id", { count: "exact", head: true }).is("sezione", null).gte("data", giorniFa(30))),
    conta(db.from("ai_richieste").select("id", { count: "exact", head: true }).gte("creato_il", giorniFa(1))),
    conta(db.from("ai_richieste").select("id", { count: "exact", head: true }).gte("creato_il", giorniFa(30))),
    db.from("payments").select("importo, creato_il").eq("stato", "pagato"),
  ]);

  const righe = pagati.data ?? [];
  const limite30 = giorniFa(30);
  return {
    host,
    hostNuovi7,
    guide,
    guideOnline,
    guidePagate,
    rimborsi,
    visite30,
    richiesteAi24h: ai24,
    richiesteAi30: ai30,
    pagamenti: righe.length,
    incassoTotale: righe.reduce((s, p) => s + p.importo, 0),
    incasso30: righe.filter((p) => p.creato_il >= limite30).reduce((s, p) => s + p.importo, 0),
  };
}

export async function caricaPagamenti(limite = 25) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("payments")
    .select("id, stripe_session_id, importo, stato, creato_il, guides(nome_struttura, slug, hosts(email))")
    .order("creato_il", { ascending: false })
    .limit(limite);
  if (error) throw new Error(`Pagamenti non caricati: ${error.message}`);
  return data;
}

export async function caricaHost(limite = 50) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("hosts")
    .select("id, email, nome, telefono, creato_il, guides(id, pagata)")
    .order("creato_il", { ascending: false })
    .limit(limite);
  if (error) throw new Error(`Host non caricati: ${error.message}`);
  return data.map((h) => ({
    ...h,
    guide: h.guides.length,
    pagate: h.guides.filter((g) => g.pagata).length,
  }));
}

export async function caricaGuide(limite = 50) {
  const db = createAdminClient();
  const { data, error } = await db
    .from("guides")
    .select("id, slug, nome_struttura, citta, stato, pagata, lingue_attive, aggiornato_il, hosts(email)")
    .order("aggiornato_il", { ascending: false })
    .limit(limite);
  if (error) throw new Error(`Guide non caricate: ${error.message}`);
  return data;
}
