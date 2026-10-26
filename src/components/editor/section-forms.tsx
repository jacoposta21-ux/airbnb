"use client";

import { getIn } from "./path";
import { CampoFotoPath, CampoSiNo, CampoTesto, ListaOggetti, ListaTesti, type FormCtx } from "./form-controls";
import { RIFIUTI_PREDEFINITI } from "@/lib/sections";
import type { TipoSezione } from "@/types/guide";

/** Colori tipici dei contenitori in Italia, proposti come scorciatoia. */
const COLORI_CONTENITORI = [
  { colore: "#7A4E2D", nome: "marrone" },
  { colore: "#E2B93B", nome: "giallo" },
  { colore: "#2F6DB5", nome: "blu" },
  { colore: "#3E8E4E", nome: "verde" },
  { colore: "#6B6B6B", nome: "grigio" },
  { colore: "#F2F2F2", nome: "bianco" },
  { colore: "#C0392B", nome: "rosso" },
];

function testoDi(ctx: FormCtx, path: (string | number)[], fallback: string) {
  const v = getIn(ctx.base, path);
  return typeof v === "string" && v.trim() ? v : fallback;
}

/** Form specifico per ogni tipo di sezione. */
export function SectionForm({ tipo, ctx }: { tipo: TipoSezione; ctx: FormCtx }) {
  switch (tipo) {
    case "benvenuto":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["titolo"]} label="Titolo" placeholder="Benvenuti!" />
          <CampoTesto ctx={ctx} path={["messaggio"]} label="Messaggio di benvenuto" multiline rows={6} />
          <CampoTesto ctx={ctx} path={["firma"]} label="Firma" placeholder="Giulia e Marco" />
          <p className="text-xs text-grigio">La foto di copertina si cambia dalla scheda “Aspetto e contatti”.</p>
        </div>
      );

    case "arrivo":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["indirizzo"]} label="Indirizzo completo" placeholder="Via dei Servi 12, 50122 Firenze" hint="Usato per il link a Google Maps e per il pulsante “Indicazioni”." />
          <CampoTesto ctx={ctx} path={["maps_url"]} label="Link Google Maps (facoltativo)" type="url" hint="Lascia vuoto per generarlo automaticamente dall'indirizzo." />
          <CampoTesto ctx={ctx} path={["orario_checkin"]} label="Orario di check-in" placeholder="Dalle 15:00 alle 22:00" />
          <ListaOggetti
            ctx={ctx}
            path={["passi"]}
            label="Istruzioni passo passo"
            aggiungi="Aggiungi un passo"
            nuovo={() => ({ testo: "" })}
            titolo={(i) => `Passo ${i + 1}`}
          >
            {(i) => (
              <>
                <CampoTesto ctx={ctx} path={["passi", i, "testo"]} label="Cosa fare" multiline rows={2} />
                <CampoFotoPath ctx={ctx} path={["passi", i, "foto_url"]} />
              </>
            )}
          </ListaOggetti>
          <CampoTesto ctx={ctx} path={["note"]} label="Note" multiline />
        </div>
      );

    case "wifi":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["rete"]} label="Nome della rete (SSID)" mono />
          <CampoTesto ctx={ctx} path={["password"]} label="Password" mono hint="L'ospite avrà un pulsante per copiarla con un tocco." />
          <CampoTesto ctx={ctx} path={["note"]} label="Note" multiline rows={2} placeholder="Il router è nel mobile dell'ingresso…" />
        </div>
      );

    case "casa":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["intro"]} label="Introduzione" multiline rows={2} />
          <ListaOggetti
            ctx={ctx}
            path={["elementi"]}
            label="Elettrodomestici e istruzioni"
            aggiungi="Aggiungi un elemento"
            nuovo={() => ({ nome: "", istruzioni: "" })}
            titolo={(i) => testoDi(ctx, ["elementi", i, "nome"], `Elemento ${i + 1}`)}
          >
            {(i) => (
              <>
                <CampoTesto ctx={ctx} path={["elementi", i, "nome"]} label="Nome" placeholder="Lavatrice, aria condizionata, caldaia…" />
                <CampoTesto ctx={ctx} path={["elementi", i, "istruzioni"]} label="Istruzioni" multiline />
                <CampoFotoPath ctx={ctx} path={["elementi", i, "foto_url"]} />
              </>
            )}
          </ListaOggetti>
        </div>
      );

    case "regole":
      return (
        <div className="space-y-4">
          <ListaTesti ctx={ctx} path={["regole"]} label="Regole" aggiungi="Aggiungi una regola" />
          <CampoTesto ctx={ctx} path={["note"]} label="Note" multiline rows={2} />
        </div>
      );

    case "differenziata":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["intro"]} label="Introduzione" multiline rows={3} />
          <ListaOggetti
            ctx={ctx}
            path={["rifiuti"]}
            label="Tipi di rifiuto"
            aggiungi="Aggiungi un tipo di rifiuto"
            nuovo={() => ({ ...RIFIUTI_PREDEFINITI[4], tipo: "altro", nome: "", cosa_si: "", cosa_no: "" })}
            titolo={(i) => testoDi(ctx, ["rifiuti", i, "nome"], `Rifiuto ${i + 1}`)}
          >
            {(i) => {
              const colore = (getIn(ctx.base, ["rifiuti", i, "colore"]) as string) || "#6B6B6B";
              return (
                <>
                  <CampoTesto ctx={ctx} path={["rifiuti", i, "nome"]} label="Nome" placeholder="Plastica e metalli" />
                  {!ctx.traduzione && (
                    <div className="space-y-1.5">
                      <span className="block text-sm font-medium">Colore del contenitore</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {COLORI_CONTENITORI.map((c) => (
                          <button
                            key={c.colore}
                            type="button"
                            title={c.nome}
                            aria-label={c.nome}
                            aria-pressed={colore.toLowerCase() === c.colore.toLowerCase()}
                            onClick={() => {
                              ctx.set(["rifiuti", i, "colore"], c.colore);
                              ctx.set(["rifiuti", i, "nome_colore"], c.nome);
                            }}
                            className="size-8 rounded-full border-2 border-white shadow ring-1 ring-bordo aria-pressed:ring-2 aria-pressed:ring-inchiostro"
                            style={{ background: c.colore }}
                          />
                        ))}
                        <input
                          type="color"
                          value={colore}
                          onChange={(e) => ctx.set(["rifiuti", i, "colore"], e.target.value)}
                          className="size-8 cursor-pointer rounded-full border border-bordo bg-white p-0.5"
                          aria-label="Altro colore"
                        />
                      </div>
                    </div>
                  )}
                  <CampoTesto ctx={ctx} path={["rifiuti", i, "nome_colore"]} label="Nome del colore" placeholder="blu" hint="Aiuta chi non distingue bene i colori." />
                  <CampoTesto ctx={ctx} path={["rifiuti", i, "giorni"]} label="Giorni e orari" placeholder="Lunedì e giovedì, dalle 20 alle 24" />
                  <CampoTesto ctx={ctx} path={["rifiuti", i, "cosa_si"]} label="Cosa sì (separato da virgole)" multiline rows={2} />
                  <CampoTesto ctx={ctx} path={["rifiuti", i, "cosa_no"]} label="Cosa no (separato da virgole)" multiline rows={2} />
                </>
              );
            }}
          </ListaOggetti>
          <CampoTesto ctx={ctx} path={["dove_conferire"]} label="Dove si buttano i rifiuti" multiline hint="Es. “Cassonetti in fondo alla via, a destra uscendo dal portone”." />
          <CampoTesto ctx={ctx} path={["note"]} label="Note" multiline rows={2} />
        </div>
      );

    case "tassa":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["cin"]} label="Codice CIN" mono placeholder="IT048017C2XXXXXXXX" hint="Il Codice Identificativo Nazionale è obbligatorio per gli affitti brevi: va esposto anche all'esterno." />
          <CampoTesto ctx={ctx} path={["importo"]} label="Importo" placeholder="3 € a persona a notte, massimo 7 notti" />
          <CampoTesto ctx={ctx} path={["esenzioni"]} label="Esenzioni" multiline rows={2} />
          <CampoTesto ctx={ctx} path={["modalita_pagamento"]} label="Come si paga" multiline rows={2} />
          <CampoTesto ctx={ctx} path={["note"]} label="Note" multiline rows={2} />
        </div>
      );

    case "parcheggio":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["parcheggio"]} label="Dove parcheggiare" multiline />
          <CampoSiNo ctx={ctx} path={["ztl_presente"]} label="La casa è in una ZTL (o la strada per arrivarci ci passa)" hint="Mostra all'ospite un avviso ben visibile." />
          {Boolean(getIn(ctx.base, ["ztl_presente"])) && (
            <CampoTesto ctx={ctx} path={["ztl"]} label="Informazioni sulla ZTL" multiline hint="Orari, varchi, cosa fare se si arriva in auto, eventuale permesso." />
          )}
          <CampoTesto ctx={ctx} path={["mezzi_pubblici"]} label="Mezzi pubblici" multiline />
        </div>
      );

    case "consigli":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["intro"]} label="Introduzione" multiline rows={2} />
        </div>
      );

    case "emergenze":
      return (
        <div className="space-y-4">
          <ListaOggetti
            ctx={ctx}
            path={["numeri"]}
            label="Numeri utili"
            aggiungi="Aggiungi un numero"
            nuovo={() => ({ nome: "", numero: "" })}
            titolo={(i) => testoDi(ctx, ["numeri", i, "numero"], `Numero ${i + 1}`)}
          >
            {(i) => (
              <>
                <CampoTesto ctx={ctx} path={["numeri", i, "nome"]} label="Descrizione" />
                <CampoTesto ctx={ctx} path={["numeri", i, "numero"]} label="Numero" type="tel" mono />
              </>
            )}
          </ListaOggetti>
          <CampoTesto ctx={ctx} path={["guardia_medica"]} label="Guardia medica" multiline rows={2} />
          <CampoTesto ctx={ctx} path={["farmacia_turno"]} label="Farmacia di turno" multiline rows={2} />
          <CampoTesto ctx={ctx} path={["ospedale"]} label="Ospedale / pronto soccorso più vicino" multiline rows={2} />
          <CampoTesto ctx={ctx} path={["note"]} label="Note (quadro elettrico, valvola del gas…)" multiline rows={2} />
          <p className="text-xs text-grigio">Il tuo numero di telefono viene aggiunto automaticamente dai contatti della guida.</p>
        </div>
      );

    case "checkout":
      return (
        <div className="space-y-4">
          <CampoTesto ctx={ctx} path={["orario"]} label="Orario di check-out" placeholder="Entro le 10:00" />
          <CampoTesto ctx={ctx} path={["istruzioni"]} label="Istruzioni" multiline />
          <ListaTesti ctx={ctx} path={["checklist"]} label="Checklist prima di partire" aggiungi="Aggiungi una voce" />
        </div>
      );
  }
}
