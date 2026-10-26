"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireHost } from "@/lib/auth";
import { PREZZO_GUIDA_CENTESIMI } from "@/lib/config";
import { tagGuida } from "@/lib/public-guide";
import { stripe, stripeConfigurato } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
}

/** Crea la sessione Stripe Checkout per pubblicare la guida e reindirizza al pagamento. */
export async function avviaPagamento(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase, host } = await requireHost();

  const { data: guida } = await supabase.from("guides").select("id, nome_struttura, pagata").eq("id", id).maybeSingle();
  if (!guida) redirect("/dashboard");
  if (guida.pagata) redirect(`/guide/${id}/pubblica`);
  if (!stripeConfigurato()) redirect(`/guide/${id}/pubblica?pagamento=non-configurato`);

  const base = await origin();
  let url: string | null;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      locale: "it",
      customer_email: host.email || undefined,
      client_reference_id: guida.id,
      metadata: { guide_id: guida.id, host_id: host.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: PREZZO_GUIDA_CENTESIMI,
            product_data: {
              name: `Pubblicazione guida digitale – ${guida.nome_struttura}`.slice(0, 250),
              description: "Pagamento una tantum: link, QR code, cartello stampabile, traduzioni e modifiche illimitate.",
            },
          },
        },
      ],
      success_url: `${base}/guide/${guida.id}/pubblica?pagamento=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/guide/${guida.id}/pubblica?pagamento=annullato`,
    });

    // Traccia il tentativo (la tabella payments è scrivibile solo dal server).
    await createAdminClient().from("payments").insert({
      guide_id: guida.id,
      stripe_session_id: session.id,
      importo: PREZZO_GUIDA_CENTESIMI,
      stato: "in_attesa",
    });
    url = session.url;
  } catch (e) {
    console.error("Errore Stripe Checkout", e);
    redirect(`/guide/${id}/pubblica?pagamento=errore`);
  }
  if (!url) redirect(`/guide/${id}/pubblica?pagamento=errore`);
  redirect(url);
}

/** Mette offline o ripubblica una guida già pagata (senza pagare di nuovo). */
export async function cambiaVisibilita(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const stato = formData.get("stato") === "pubblicata" ? "pubblicata" : "bozza";
  const { supabase } = await requireHost();
  // Il trigger SQL impedisce di pubblicare guide non pagate.
  const { data } = await supabase.from("guides").update({ stato }).eq("id", id).select("slug").maybeSingle();
  if (data) revalidateTag(tagGuida(data.slug), { expire: 0 });
  revalidatePath(`/guide/${id}/pubblica`);
  revalidatePath("/dashboard");
}
