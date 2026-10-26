import { ExternalLink, Pencil, QrCode } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GuidaRiepilogo } from "@/lib/guides";
import { formatData } from "@/lib/utils";

/** Scheda di una guida nella dashboard. */
export function GuideCard({ guida }: { guida: GuidaRiepilogo }) {
  const pubblicata = guida.stato === "pubblicata" && guida.pagata;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={`/guide/${guida.id}/modifica`} className="relative block aspect-[16/9] bg-sabbia" tabIndex={-1}>
        {guida.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- copertine da storage, già ottimizzate all'upload
          <img src={guida.cover_url} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="size-full" style={{ background: `linear-gradient(135deg, ${guida.colore}, ${guida.colore}99)` }} />
        )}
        <div className="absolute left-3 top-3">
          {pubblicata ? (
            <Badge tone="success">Online</Badge>
          ) : guida.pagata ? (
            <Badge>Offline</Badge>
          ) : (
            <Badge tone="warning">Bozza</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-serif text-xl font-semibold leading-tight">
          <Link href={`/guide/${guida.id}/modifica`} className="hover:text-terracotta">
            {guida.nome_struttura}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-grigio">
          {[guida.citta, `${guida.lingue_attive.length} ${guida.lingue_attive.length === 1 ? "lingua" : "lingue"}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-1 text-xs text-grigio">Modificata il {formatData(guida.aggiornato_il)}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={`/guide/${guida.id}/modifica`} size="sm" icon={<Pencil className="size-4" />}>
            Modifica
          </ButtonLink>
          <ButtonLink
            href={`/guide/${guida.id}/pubblica`}
            size="sm"
            variant="secondary"
            icon={<QrCode className="size-4" />}
          >
            {guida.pagata ? "QR e statistiche" : "Pubblica"}
          </ButtonLink>
          <ButtonLink
            href={`/g/${guida.slug}`}
            size="sm"
            variant="ghost"
            target="_blank"
            icon={<ExternalLink className="size-4" />}
          >
            {pubblicata ? "Apri" : "Anteprima"}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
