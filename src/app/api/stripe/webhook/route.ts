import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { registraPagamento, registraPagamentoFallito } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

/**
 * Webhook Stripe. Eventi da abilitare nella dashboard Stripe:
 * checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, checkout.session.expired
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const firma = request.headers.get("stripe-signature");
  if (!secret || !firma) return NextResponse.json({ error: "Webhook non configurato" }, { status: 400 });

  let event: Stripe.Event;
  try {
    // Serve il corpo grezzo, non il JSON già interpretato, per verificare la firma.
    event = await stripe().webhooks.constructEventAsync(await request.text(), firma, secret);
  } catch (e) {
    console.error("Firma webhook Stripe non valida", e);
    return NextResponse.json({ error: "Firma non valida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await registraPagamento(event.data.object);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await registraPagamentoFallito(event.data.object);
        break;
    }
  } catch (e) {
    console.error("Errore nella gestione del webhook", e);
    // 500: Stripe riproverà più tardi.
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }

  return NextResponse.json({ ricevuto: true });
}
