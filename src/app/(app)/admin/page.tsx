import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/admin";
import { moderaGuida } from "@/lib/admin-actions";
import { caricaGuide, caricaHost, caricaPagamenti, caricaPanoramica } from "@/lib/admin-data";
import { formatData } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const euro = (centesimi: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(centesimi / 100);

const TONO_PAGAMENTO = { pagato: "success", in_attesa: "warning", fallito: "neutral", rimborsato: "neutral" } as const;

function Tile({ label, valore, nota }: { label: string; valore: string | number; nota?: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-grigio">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold tabular-nums">{valore}</p>
      {nota && <p className="mt-0.5 text-xs text-grigio">{nota}</p>}
    </Card>
  );
}

function Sezione({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-serif text-xl font-semibold">{titolo}</h2>
      <Card className="overflow-x-auto">{children}</Card>
    </section>
  );
}

const th = "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-grigio";
const td = "px-4 py-3 align-middle";

export default async function AdminPage() {
  await requireAdmin();
  const [p, pagamenti, host, guide] = await Promise.all([caricaPanoramica(), caricaPagamenti(), caricaHost(), caricaGuide()]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-serif text-3xl font-semibold">Pannello admin</h1>
      <p className="mt-1 text-grigio">Visibile solo agli amministratori. Dati aggiornati a ogni apertura.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Incassi totali" valore={euro(p.incassoTotale)} nota={`${p.pagamenti} pagamenti · ${p.rimborsi} rimborsi`} />
        <Tile label="Incassi ultimi 30 giorni" valore={euro(p.incasso30)} />
        <Tile label="Host registrati" valore={p.host} nota={`+${p.hostNuovi7} negli ultimi 7 giorni`} />
        <Tile label="Guide" valore={p.guide} nota={`${p.guideOnline} online · ${p.guidePagate} pagate`} />
        <Tile label="Visite alle guide" valore={p.visite30} nota="ultimi 30 giorni" />
        <Tile label="Richieste AI" valore={p.richiesteAi24h} nota={`ultime 24 ore · ${p.richiesteAi30} in 30 giorni`} />
      </div>

      <Sezione titolo="Pagamenti recenti">
        {pagamenti.length === 0 ? (
          <p className="p-6 text-center text-sm text-grigio">Nessun pagamento ancora.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-bordo">
              <tr>
                <th className={th}>Data</th>
                <th className={th}>Guida</th>
                <th className={th}>Host</th>
                <th className={th}>Importo</th>
                <th className={th}>Stato</th>
                <th className={th}>Stripe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo">
              {pagamenti.map((pg) => (
                <tr key={pg.id}>
                  <td className={td}>{formatData(pg.creato_il)}</td>
                  <td className={td}>{pg.guides?.nome_struttura ?? "—"}</td>
                  <td className={`${td} text-grigio`}>{pg.guides?.hosts?.email ?? "—"}</td>
                  <td className={`${td} tabular-nums`}>{euro(pg.importo)}</td>
                  <td className={td}>
                    <Badge tone={TONO_PAGAMENTO[pg.stato]}>{pg.stato.replace("_", " ")}</Badge>
                  </td>
                  <td className={td}>
                    <a
                      href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(pg.stripe_session_id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-terracotta hover:underline"
                    >
                      Apri <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sezione>

      <Sezione titolo="Guide">
        {guide.length === 0 ? (
          <p className="p-6 text-center text-sm text-grigio">Nessuna guida ancora.</p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-bordo">
              <tr>
                <th className={th}>Guida</th>
                <th className={th}>Host</th>
                <th className={th}>Stato</th>
                <th className={th}>Lingue</th>
                <th className={th}>Modificata</th>
                <th className={th}>Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo">
              {guide.map((g) => {
                const online = g.pagata && g.stato === "pubblicata";
                return (
                  <tr key={g.id}>
                    <td className={td}>
                      <span className="font-medium">{g.nome_struttura}</span>
                      {g.citta && <span className="block text-xs text-grigio">{g.citta}</span>}
                    </td>
                    <td className={`${td} text-grigio`}>{g.hosts?.email ?? "—"}</td>
                    <td className={td}>
                      {online ? <Badge tone="success">Online</Badge> : g.pagata ? <Badge>Offline</Badge> : <Badge tone="warning">Bozza</Badge>}
                    </td>
                    <td className={`${td} uppercase text-grigio`}>{g.lingue_attive.join(" ")}</td>
                    <td className={td}>{formatData(g.aggiornato_il)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        {online && (
                          <a href={`/g/${g.slug}`} target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline">
                            Apri
                          </a>
                        )}
                        {g.pagata && (
                          <form action={moderaGuida}>
                            <input type="hidden" name="id" value={g.id} />
                            <input type="hidden" name="stato" value={online ? "bozza" : "pubblicata"} />
                            <SubmitButton size="sm" variant={online ? "danger" : "secondary"}>
                              {online ? "Metti offline" : "Riattiva"}
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Sezione>

      <Sezione titolo="Host">
        {host.length === 0 ? (
          <p className="p-6 text-center text-sm text-grigio">Nessun host registrato.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead className="border-b border-bordo">
              <tr>
                <th className={th}>Email</th>
                <th className={th}>Nome</th>
                <th className={th}>Telefono</th>
                <th className={th}>Registrato</th>
                <th className={th}>Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordo">
              {host.map((h) => (
                <tr key={h.id}>
                  <td className={td}>
                    <a href={`mailto:${h.email}`} className="hover:underline">
                      {h.email}
                    </a>
                  </td>
                  <td className={td}>{h.nome ?? "—"}</td>
                  <td className={`${td} text-grigio`}>{h.telefono ?? "—"}</td>
                  <td className={td}>{formatData(h.creato_il)}</td>
                  <td className={`${td} tabular-nums`}>
                    {h.guide} <span className="text-grigio">({h.pagate} pagate)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Sezione>
    </div>
  );
}
