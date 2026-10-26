/**
 * Seed: crea l'host dimostrativo e la guida "Casa Brunelleschi" (Firenze),
 * pubblicata e pagata, raggiungibile su /g/demo-firenze.
 *
 * Uso:  npm run seed
 * Richiede NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local.
 * È idempotente: se la guida demo esiste già viene ricreata da zero.
 */
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import { DEMO_GUIDE } from "../src/data/demo-guide";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("✖ Imposta NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@example.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? randomBytes(12).toString("base64url");

const supabase = createClient<Database>(url, serviceKey, { auth: { persistSession: false } });

async function trovaOCreaUtente(): Promise<string> {
  // Cerca l'utente demo tra i primi utenti (sufficiente per un progetto nuovo).
  const { data: list, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const esistente = list.users.find((u) => u.email === DEMO_EMAIL);
  if (esistente) return esistente.id;

  const { data, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { nome: "Giulia (demo)" },
  });
  if (createError) throw createError;
  console.log(`✔ Creato utente demo ${DEMO_EMAIL} con password: ${DEMO_PASSWORD}`);
  return data.user.id;
}

async function main() {
  const hostId = await trovaOCreaUtente();

  // Il trigger crea già il profilo, ma lo aggiorniamo per sicurezza.
  await supabase.from("hosts").upsert({ id: hostId, email: DEMO_EMAIL, nome: "Giulia (demo)", telefono: DEMO_GUIDE.contatto_telefono });

  await supabase.from("guides").delete().eq("slug", DEMO_GUIDE.slug);

  const { data: guida, error } = await supabase
    .from("guides")
    .insert({
      host_id: hostId,
      slug: DEMO_GUIDE.slug,
      nome_struttura: DEMO_GUIDE.nome_struttura,
      citta: DEMO_GUIDE.citta,
      stato: "pubblicata",
      pagata: true,
      colore: DEMO_GUIDE.colore,
      cover_url: DEMO_GUIDE.cover_url,
      logo_url: DEMO_GUIDE.logo_url,
      lingue_attive: DEMO_GUIDE.lingue_attive,
      contatto_nome: DEMO_GUIDE.contatto_nome,
      contatto_telefono: DEMO_GUIDE.contatto_telefono,
      contatto_whatsapp: DEMO_GUIDE.contatto_whatsapp,
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: secErr } = await supabase.from("sections").insert(
    DEMO_GUIDE.sezioni.map((s) => ({
      guide_id: guida.id,
      tipo: s.tipo,
      ordine: s.ordine,
      attiva: s.attiva,
      contenuto: s.contenuto as never,
    })),
  );
  if (secErr) throw secErr;

  const { error: placeErr } = await supabase.from("places").insert(
    DEMO_GUIDE.luoghi.map((l) => ({
      guide_id: guida.id,
      categoria: l.categoria,
      nome: l.nome,
      descrizione: l.descrizione,
      maps_url: l.maps_url,
      ordine: l.ordine,
    })),
  );
  if (placeErr) throw placeErr;

  console.log(`✔ Guida demo pronta: /g/${DEMO_GUIDE.slug}`);
}

main().catch((err) => {
  console.error("✖ Seed non riuscito:", err.message ?? err);
  process.exit(1);
});
