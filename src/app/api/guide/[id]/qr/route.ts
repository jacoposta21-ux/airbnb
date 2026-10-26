import { NextResponse, type NextRequest } from "next/server";
import { guidaDelProprietario, qrPng, urlGuida } from "@/lib/qr";
import { slugify } from "@/lib/utils";

/** QR code della guida in PNG. Con ?download=1 il browser lo scarica. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/guide/[id]/qr">) {
  const { id } = await ctx.params;
  const trovata = await guidaDelProprietario(id);
  if (!trovata) return NextResponse.json({ error: "Guida non trovata" }, { status: 404 });

  const png = await qrPng(urlGuida(trovata.guida.slug));
  const nomeFile = `qr-${slugify(trovata.guida.nome_struttura) || "guida"}.png`;
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=300",
      ...(request.nextUrl.searchParams.has("download") ? { "Content-Disposition": `attachment; filename="${nomeFile}"` } : {}),
    },
  });
}
