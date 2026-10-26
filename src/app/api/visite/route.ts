import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { TIPI_SEZIONE } from "@/types/guide";

const schema = z.object({
  guideId: z.uuid(),
  sezione: z.enum(TIPI_SEZIONE).nullable(),
});

/**
 * Registra una visita (o la lettura di una sezione) di una guida pubblica.
 * L'inserimento passa dalla RLS: funziona solo per guide pubblicate e pagate.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON non valido" }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  // Ignora i bot più comuni per non gonfiare le statistiche.
  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|preview|facebookexternalhit|whatsapp/i.test(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await createPublicClient()
    .from("views")
    .insert({ guide_id: parsed.data.guideId, sezione: parsed.data.sezione });
  if (error) return NextResponse.json({ error: "Visita non registrata" }, { status: 400 });

  return new NextResponse(null, { status: 204 });
}
