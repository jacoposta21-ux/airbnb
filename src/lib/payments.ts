import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import type Stripe from "stripe";
import { tagGuida } from "@/lib/public-guide";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Registra un pagamento completato e pubblica la guida.
 * Idempotente: può essere chiamata sia dal webhook sia dalla pagina di ritorno.
 * Usa il service role: è l'unico modo per impostare `pagata = true` (vedi trigger SQL).
 */
export async function registraPagamento(session: Stripe.Checkout.Session) {
  const guideId = session.metadata?.guide_id ?? session.client_reference_id;
  if (!guideId || session.payment_status !== "paid") return false;

  const admin = createAdminClient();
  const { error: payErr } = await admin.from("payments").upsert(
    { guide_id: guideId, stripe_session_id: session.id, importo: session.amount_total ?? 0, stato: "pagato" },
    { onConflict: "stripe_session_id" },
  );
  if (payErr) throw new Error(`Pagamento non registrato: ${payErr.message}`);

  const { data: guida, error } = await admin
    .from("guides")
    .update({ pagata: true, stato: "pubblicata" })
    .eq("id", guideId)
    .select("slug")
    .single();
  if (error) throw new Error(`Guida non aggiornata: ${error.message}`);

  revalidateTag(tagGuida(guida.slug), { expire: 0 });
  revalidatePath("/dashboard");
  return true;
}

/** Segna come fallita/scaduta una sessione di pagamento non andata a buon fine. */
export async function registraPagamentoFallito(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ stato: "fallito" })
    .eq("stripe_session_id", session.id)
    .eq("stato", "in_attesa");
}

/**
 * Rimborso totale fatto dalla dashboard Stripe: la guida torna in bozza (non
 * più pubblica) e il pagamento risulta rimborsato. Chiamata dal webhook
 * `charge.refunded`. I rimborsi parziali non cambiano lo stato della guida.
 */
export async function registraRimborso(charge: Stripe.Charge, sessionId: string) {
  if (!charge.refunded) return false;
  const admin = createAdminClient();
  const { data: pagamento } = await admin
    .from("payments")
    .update({ stato: "rimborsato" })
    .eq("stripe_session_id", sessionId)
    .select("guide_id")
    .maybeSingle();
  if (!pagamento) return false;

  const { data: guida, error } = await admin
    .from("guides")
    .update({ pagata: false, stato: "bozza" })
    .eq("id", pagamento.guide_id)
    .select("slug")
    .single();
  if (error) throw new Error(`Guida non aggiornata dopo il rimborso: ${error.message}`);

  revalidateTag(tagGuida(guida.slug), { expire: 0 });
  revalidatePath("/dashboard");
  return true;
}
