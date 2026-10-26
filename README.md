# GuidaOspiti

Web app SaaS per gli host italiani di affitti brevi (Airbnb, Booking): in pochi minuti
crea una guida digitale per gli ospiti, tradotta e pensata per l'Italia, condivisibile
tramite link e QR code.

> Il nome dell'app si cambia con la variabile `NEXT_PUBLIC_APP_NAME`.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **Supabase**: autenticazione (email + Google), Postgres con Row Level Security, Storage immagini
- **Stripe**: pagamento una tantum per guida (fase 4)
- **API Claude**: generazione e traduzione dei contenuti (fase 3)
- Deploy su **Vercel**

## Stato dei lavori

| Fase | Contenuto | Stato |
| ---- | --------- | ----- |
| 1 | Struttura del progetto, database, autenticazione, dashboard | ✅ |
| 2 | Editor a sezioni, wizard, duplicazione, pagina pubblica `/g/[slug]`, landing completa | ✅ |
| 3 | Generazione AI e traduzioni | ✅ |
| 4 | Pagamenti Stripe, QR code, cartello A5, statistiche | ✅ |

## Struttura

```
src/
  app/
    (auth)/login, (auth)/registrati   accesso e registrazione (server action)
    (app)/dashboard                   elenco guide dell'host (area protetta)
    (app)/guide/nuova                 scelta: procedura guidata, AI, duplica
    (app)/guide/nuova/wizard          procedura guidata, una sezione alla volta
    (app)/guide/[id]/modifica         editor a sezioni con anteprima live su telefono
    (app)/guide/[id]/pubblica         pagamento, link, QR code, cartello A5, statistiche
    api/stripe/webhook                conferma dei pagamenti Stripe
    api/guide/[id]/qr                 QR code in PNG
    api/guide/[id]/cartello           cartello A5 in PDF
    g/[slug]                          guida pubblica per l'ospite (nessun login)
    api/visite                        registrazione anonima delle visite
    auth/callback                     ritorno da Google OAuth / conferma email
    auth/esci                         logout
    page.tsx                          landing page
  components/
    guide/                            vista della guida (pubblica, anteprima, landing)
    editor/                           editor: form per sezione, consigli locali, impostazioni
    wizard/                           procedura guidata
    ui/                               pulsanti, campi, card, avvisi…
  data/demo-guide.ts                  guida dimostrativa di Firenze (seed + landing)
  lib/
    supabase/                         client browser, server, admin e refresh sessione
    auth.ts                           requireHost(), redirect sicuri
    guides.ts                         accesso ai dati delle guide
    sections.ts                       catalogo sezioni e contenuti predefiniti italiani
    i18n.ts                           testi dell'interfaccia in 5 lingue, scelta lingua, fusione traduzioni
    guide-actions.ts                  Server Action: crea, salva, duplica, elimina guida
    public-guide.ts                   lettura in cache della guida pubblica
    upload.ts                         compressione (WebP, max 1600 px) e upload immagini
    config.ts                         nome app, prezzo, URL del sito
  types/
    guide.ts                          tipi di dominio (contenuto di ogni sezione)
    database.ts                       tipi delle tabelle Supabase
  proxy.ts                            refresh sessione e protezione delle pagine riservate
supabase/migrations/                  schema SQL, RLS, storage
scripts/seed.ts                       crea la guida demo
```

## Intelligenza artificiale (Claude)

- **Generazione** (`/guide/nuova/ai`): l'host incolla il testo dell'annuncio e qualche dato
  chiave; Claude restituisce, con output strutturato (schema Zod), il contenuto di tutte
  le sezioni e qualche luogo consigliato. Il prompt vieta di inventare password, codici,
  numeri e locali: i dati mancanti restano vuoti da completare.
- **Traduzione** (pulsante *Traduci con AI* nell'editor): una richiesta per lingua, in
  parallelo. Modalità *solo testi mancanti* (conserva le correzioni manuali) oppure
  *ritraduci tutto*. Password, indirizzi, colori, numeri e CIN non vengono mai toccati.
- Modello: `claude-opus-5-5` (in `src/lib/ai.ts`), con *fallback* lato server in caso di
  rifiuto dei filtri di sicurezza. Effort `medium` per la generazione, `low` per la traduzione.
- **Limiti di costo**: ogni host può fare al massimo 10 generazioni e 30 traduzioni ogni
  24 ore (tabella `ai_richieste`, valori in `src/lib/ai-actions.ts`).
- Su Vercel le pagine che chiamano l'AI dichiarano `maxDuration = 300` secondi: serve un
  piano che lo consenta (sul piano Hobby il limite può essere più basso).

## Indicizzazione

Le guide **non vengono mai indicizzate** dai motori di ricerca (meta `noindex` e header
`X-Robots-Tag`), perché contengono password Wi-Fi e istruzioni per entrare in casa.

## Come funzionano le traduzioni

Il contenuto italiano definisce la struttura (quanti passi, quanti elettrodomestici…);
ogni traduzione contiene solo i testi. Quando una traduzione manca, l'ospite vede il
testo italiano. Alcuni campi sono uguali in tutte le lingue (password Wi-Fi, indirizzo,
colori dei contenitori, numeri di telefono, codice CIN): vedi `CAMPI_CONDIVISI` in
`src/lib/i18n.ts`.

## Prestazioni della guida pubblica

- Dati letti in cache (`unstable_cache`) e invalidati a ogni salvataggio dell'editor.
- Nessuna libreria pesante lato ospite; immagini compresse in WebP al caricamento e
  caricate in modo pigro.
- Un piccolo service worker (`public/sw-guida.js`) conserva le guide già aperte, che si
  riaprono anche senza connessione.

## Modello dati

| Tabella | Contenuto |
| ------- | --------- |
| `hosts` | profilo dell'host (creato automaticamente alla registrazione) |
| `guides` | una guida per appartamento: slug, stato, pagata, colore, logo, copertina, lingue attive, contatto |
| `sections` | sezioni della guida: `tipo`, `ordine`, `attiva`, `contenuto` (JSON per lingua: `{ "it": {...}, "en": {...} }`) |
| `places` | consigli locali con categoria, descrizione per lingua e link Google Maps |
| `payments` | sessioni Stripe Checkout (scritte solo dal server) |
| `views` | visite alla guida e alle singole sezioni |

**Sicurezza (RLS)**: ogni host vede e modifica solo le proprie guide; le guide
*pubblicate e pagate* sono leggibili da chiunque. Un trigger impedisce all'host di
segnare da solo una guida come pagata: lo può fare solo il webhook Stripe (service role).

## Installazione

Requisiti: Node.js 20+ e un progetto [Supabase](https://supabase.com) (piano gratuito ok).

```bash
npm install
cp .env.example .env.local   # poi compila le variabili
```

### 1. Database

Nel pannello Supabase apri **SQL Editor** e incolla il contenuto di
`supabase/migrations/20261026000000_schema_iniziale.sql`, oppure con la CLI:

```bash
npx supabase link --project-ref <id-progetto>
npx supabase db push
```

Applica **tutte** le migrazioni in ordine (`20261026…_schema_iniziale.sql`, poi
`20261027…_limiti_ai.sql`). Creano tabelle, policy RLS, trigger, il bucket di storage
`guide-media` e il registro delle richieste AI.

### 2. Autenticazione

In Supabase → **Authentication → URL Configuration**:

- *Site URL*: `http://localhost:3000` (in produzione il tuo dominio)
- *Redirect URLs*: `http://localhost:3000/auth/callback` e `https://tuodominio.it/auth/callback`

Per l'accesso con Google: **Authentication → Providers → Google**, inserisci Client ID e
Secret creati su Google Cloud Console (redirect URI: `https://<id-progetto>.supabase.co/auth/v1/callback`).

### 3. Dati d'esempio

```bash
npm run seed
```

Crea l'utente `demo@example.com` (la password viene stampata a terminale, oppure
impostala con `DEMO_PASSWORD`) e la guida dimostrativa *Casa Brunelleschi* nel centro di
Firenze, su `/g/demo-firenze`.

> Tariffe, orari ZTL e calendario della raccolta nella guida demo sono indicativi:
> verificali sempre sul sito del Comune prima di usarli in una guida reale.

### 4. Pagamenti (Stripe)

1. Crea un account su [stripe.com](https://stripe.com) e copia la *Secret key* (in modalità
   test inizia con `sk_test_`) in `STRIPE_SECRET_KEY`.
2. **Webhook**: Stripe → Developers → Webhooks → *Add endpoint*
   - URL: `https://<tuo-dominio>/api/stripe/webhook`
   - Eventi: `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`
   - Copia il *Signing secret* (`whsec_…`) in `STRIPE_WEBHOOK_SECRET`.
3. In locale usa la Stripe CLI per inoltrare gli eventi:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   (stampa un `whsec_…` temporaneo da mettere in `.env.local`). Carta di test: `4242 4242 4242 4242`.

Come funziona: l'host paga su Stripe Checkout (`/guide/[id]/pubblica`); il webhook, con la
chiave service role, segna la guida come `pagata` e `pubblicata`. Anche la pagina di
ritorno verifica la sessione con Stripe, quindi la guida si sblocca subito anche se il
webhook arriva in ritardo. Il trigger SQL impedisce a chiunque altro di segnare una guida
come pagata.

> Fatturazione: Checkout non emette fatture. Se ti servono (in Italia di norma sì),
> attiva `invoice_creation` in `src/lib/payment-actions.ts`, Stripe Tax o collega il tuo
> sistema di fatturazione elettronica.

### 5. Avvio

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # controllo TypeScript
npm run lint
```

## Variabili d'ambiente

| Variabile | Dove si trova | Note |
| --------- | ------------- | ---- |
| `NEXT_PUBLIC_APP_NAME` | — | nome mostrato nell'app |
| `NEXT_PUBLIC_SITE_URL` | — | URL pubblico, usato per link e QR code |
| `NEXT_PUBLIC_PREZZO_GUIDA_CENTESIMI` | — | prezzo di pubblicazione (default 2900 = 29 €) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys | va bene anche la vecchia *anon key* |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys | **segreta**, solo lato server |
| `ANTHROPIC_API_KEY` | console.anthropic.com | fase 3 |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys | fase 4 |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks | fase 4 |

## Deploy su Vercel

1. Importa il repository su [vercel.com/new](https://vercel.com/new).
2. In **Settings → Environment Variables** inserisci tutte le variabili qui sopra
   (`NEXT_PUBLIC_SITE_URL` = il dominio di produzione).
3. Aggiungi `https://<dominio>/auth/callback` tra i Redirect URL di Supabase.
4. Deploy. Ogni push sul branch principale verrà pubblicato automaticamente.
