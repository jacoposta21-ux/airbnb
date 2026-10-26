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
| 2 | Editor a sezioni, wizard, pagina pubblica `/g/[slug]`, landing completa | ⏳ |
| 3 | Generazione AI e traduzioni | ⏳ |
| 4 | Pagamenti Stripe, QR code, cartello A5, statistiche | ⏳ |

## Struttura

```
src/
  app/
    (auth)/login, (auth)/registrati   accesso e registrazione (server action)
    (app)/dashboard                   elenco guide dell'host (area protetta)
    auth/callback                     ritorno da Google OAuth / conferma email
    auth/esci                         logout
    page.tsx                          landing page
  components/                         componenti riutilizzabili (ui/, auth/, dashboard/)
  data/demo-guide.ts                  guida dimostrativa di Firenze (seed + landing)
  lib/
    supabase/                         client browser, server, admin e refresh sessione
    auth.ts                           requireHost(), redirect sicuri
    guides.ts                         accesso ai dati delle guide
    sections.ts                       catalogo sezioni e contenuti predefiniti italiani
    config.ts                         nome app, prezzo, URL del sito
  types/
    guide.ts                          tipi di dominio (contenuto di ogni sezione)
    database.ts                       tipi delle tabelle Supabase
  proxy.ts                            refresh sessione e protezione delle pagine riservate
supabase/migrations/                  schema SQL, RLS, storage
scripts/seed.ts                       crea la guida demo
```

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

La migrazione crea tabelle, policy RLS, trigger e il bucket di storage `guide-media`.

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

### 4. Avvio

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
