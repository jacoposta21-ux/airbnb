import { Eye, TrendingUp } from "lucide-react";
import { SectionIcon } from "@/components/guide/section-icon";
import { INFO_SEZIONE } from "@/lib/sections";
import type { TipoSezione } from "@/types/guide";

export interface Statistiche {
  visite_totali: number;
  visite_30_giorni: number;
  sezioni: Array<{ sezione: TipoSezione; visite: number }>;
  per_giorno: Array<{ giorno: string; visite: number }>;
}

/** Ultimi 30 giorni, compresi quelli senza visite. */
function ultimi30Giorni(perGiorno: Statistiche["per_giorno"]) {
  const mappa = new Map(perGiorno.map((d) => [d.giorno, d.visite]));
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { giorno: key, visite: mappa.get(key) ?? 0, data: d };
  });
}

const fmtGiorno = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" });

function Tile({ label, valore, icon: Icon }: { label: string; valore: number; icon: typeof Eye }) {
  return (
    <div className="rounded-2xl border border-bordo bg-white p-4">
      <div className="flex items-center gap-1.5 text-sm text-grigio">
        <Icon className="size-4" aria-hidden="true" /> {label}
      </div>
      <div className="mt-1 font-serif text-3xl font-semibold tabular-nums">{valore.toLocaleString("it-IT")}</div>
    </div>
  );
}

/** Statistiche base: visite e sezioni più consultate. */
export function StatsPanel({ stats }: { stats: Statistiche }) {
  const giorni = ultimi30Giorni(stats.per_giorno);
  const max = Math.max(1, ...giorni.map((g) => g.visite));
  const maxSez = Math.max(1, ...stats.sezioni.map((s) => s.visite));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Tile label="Visite totali" valore={stats.visite_totali} icon={Eye} />
        <Tile label="Ultimi 30 giorni" valore={stats.visite_30_giorni} icon={TrendingUp} />
      </div>

      <figure className="rounded-2xl border border-bordo bg-white p-4">
        <figcaption className="text-sm font-medium">Visite al giorno, ultimi 30 giorni</figcaption>
        {stats.visite_30_giorni === 0 ? (
          <p className="py-8 text-center text-sm text-grigio">Ancora nessuna visita: condividi il link o appendi il cartello.</p>
        ) : (
          <>
            <div className="mt-4 flex h-28 items-end gap-0.5 border-b border-bordo" aria-hidden="true">
              {giorni.map((g) => (
                <div key={g.giorno} className="group relative flex h-full flex-1 items-end justify-center">
                  <div
                    className="w-full max-w-6 rounded-t bg-terracotta transition-opacity group-hover:opacity-80"
                    style={{ height: g.visite ? `${Math.max(4, (g.visite / max) * 100)}%` : 0 }}
                  />
                  <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded-lg bg-inchiostro px-2 py-1 text-xs text-white group-hover:block">
                    {fmtGiorno.format(g.data)}: {g.visite} {g.visite === 1 ? "visita" : "visite"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-grigio" aria-hidden="true">
              <span>{fmtGiorno.format(giorni[0].data)}</span>
              <span>oggi</span>
            </div>
            <table className="sr-only">
              <caption>Visite al giorno</caption>
              <tbody>
                {giorni.map((g) => (
                  <tr key={g.giorno}>
                    <th scope="row">{fmtGiorno.format(g.data)}</th>
                    <td>{g.visite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </figure>

      <div className="rounded-2xl border border-bordo bg-white p-4">
        <h3 className="text-sm font-medium">Sezioni più consultate</h3>
        {stats.sezioni.length === 0 ? (
          <p className="py-6 text-center text-sm text-grigio">I dati compariranno quando gli ospiti apriranno la guida.</p>
        ) : (
          <ol className="mt-3 space-y-2.5">
            {stats.sezioni.slice(0, 8).map((s) => (
              <li key={s.sezione} className="grid grid-cols-[minmax(0,12rem)_1fr] items-center gap-3 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <SectionIcon tipo={s.sezione} className="size-4 shrink-0 text-grigio" />
                  {INFO_SEZIONE[s.sezione]?.etichetta ?? s.sezione}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 rounded-r bg-terracotta" style={{ width: `${(s.visite / maxSez) * 85}%` }} aria-hidden="true" />
                  <span className="tabular-nums text-grigio">{s.visite}</span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
