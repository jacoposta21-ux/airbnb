import { NextResponse } from "next/server";
import { creaCartelloPdf } from "@/lib/cartello";
import { guidaDelProprietario, urlGuida } from "@/lib/qr";
import { slugify } from "@/lib/utils";

/** Cartello A5 stampabile in PDF con il QR code della guida. */
export async function GET(_request: Request, ctx: RouteContext<"/api/guide/[id]/cartello">) {
  const { id } = await ctx.params;
  const trovata = await guidaDelProprietario(id);
  if (!trovata) return NextResponse.json({ error: "Guida non trovata" }, { status: 404 });

  const pdf = await creaCartelloPdf({
    nome_struttura: trovata.guida.nome_struttura,
    colore: trovata.guida.colore,
    url: urlGuida(trovata.guida.slug),
    wifi: trovata.wifi,
  });
  const nomeFile = `cartello-${slugify(trovata.guida.nome_struttura) || "guida"}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nomeFile}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
