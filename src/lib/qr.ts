import "server-only";

import QRCode from "qrcode";
import { SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const urlGuida = (slug: string) => `${SITE_URL}/g/${slug}`;

/** QR code in PNG, scuro su bianco (il contrasto massimo si legge meglio). */
export function qrPng(testo: string, larghezza = 1024) {
  return QRCode.toBuffer(testo, {
    type: "png",
    width: larghezza,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#2A211C", light: "#FFFFFF" },
  });
}

/** Guida dell'host loggato, per le route di download. Null se non autorizzato. */
export async function guidaDelProprietario(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("guides").select("*").eq("id", id).eq("host_id", auth.user.id).maybeSingle();
  if (!data) return null;
  const { data: wifi } = await supabase.from("sections").select("contenuto, attiva").eq("guide_id", id).eq("tipo", "wifi").maybeSingle();
  return { guida: data, wifi: wifi?.attiva ? ((wifi.contenuto as { it?: { rete?: string; password?: string } }).it ?? null) : null };
}
