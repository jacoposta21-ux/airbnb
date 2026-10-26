import "server-only";

import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigurato() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Client Stripe creato solo quando serve (la chiave può mancare durante la build). */
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe non configurato: imposta STRIPE_SECRET_KEY.");
  client ??= new Stripe(key);
  return client;
}
