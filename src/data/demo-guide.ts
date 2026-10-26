/**
 * Guida dimostrativa: "Casa Brunelleschi", bilocale nel centro di Firenze.
 * Usata dal seed (scripts/seed.ts) e come esempio sulla landing page,
 * dove viene mostrata anche senza database.
 *
 * Nota: indirizzo, codice CIN, password e numero dell'host sono di fantasia.
 * Tariffe e orari (tassa di soggiorno, ZTL, raccolta) sono indicativi:
 * verificateli sempre sul sito del Comune prima di usarli in una guida reale.
 */

import type { GuidaCompleta, Luogo, Sezione } from "../types/guide";
import { mapsSearchUrl } from "../lib/utils";

/** Illustrazione locale (public/demo): nessuna dipendenza da immagini esterne. */
const COVER = "/demo/firenze-cover.svg";

const sezioni: Sezione[] = [
  {
    id: "demo-benvenuto",
    tipo: "benvenuto",
    ordine: 0,
    attiva: true,
    contenuto: {
      it: {
        titolo: "Benvenuti a Casa Brunelleschi!",
        messaggio:
          "Ciao e benvenuti a Firenze! Siamo Giulia e Marco e siamo felicissimi di ospitarvi nel nostro appartamento, a cinque minuti a piedi dal Duomo. Qui trovate tutto quello che vi serve: come entrare, il Wi-Fi, come funziona la casa e i nostri indirizzi del cuore. Se avete bisogno di qualsiasi cosa, scriveteci su WhatsApp: rispondiamo sempre.",
        firma: "Giulia e Marco",
      },
      en: {
        titolo: "Welcome to Casa Brunelleschi!",
        messaggio:
          "Hi and welcome to Florence! We are Giulia and Marco and we are delighted to host you in our apartment, a five-minute walk from the Duomo. Here you will find everything you need: how to get in, the Wi-Fi, how the house works and our favourite local spots. If you need anything at all, just message us on WhatsApp: we always reply.",
        firma: "Giulia & Marco",
      },
    },
  },
  {
    id: "demo-arrivo",
    tipo: "arrivo",
    ordine: 1,
    attiva: true,
    contenuto: {
      it: {
        indirizzo: "Via dei Servi 12, 50122 Firenze FI",
        maps_url: mapsSearchUrl("Via dei Servi 12, 50122 Firenze"),
        orario_checkin: "Dalle 15:00 alle 22:00 (arrivi più tardi su richiesta)",
        passi: [
          { testo: "Il portone è verde, accanto alla gelateria. Al citofono non serve suonare." },
          { testo: "Aprite la cassetta delle chiavi a destra del portone con il codice che vi inviamo il giorno dell'arrivo." },
          { testo: "Salite al secondo piano (non c'è ascensore): la porta è quella a sinistra, interno 4." },
          { testo: "Rimettete le chiavi di riserva nella cassetta e mischiate i numeri del codice." },
        ],
        note: "Per legge dobbiamo registrare i documenti di tutti gli ospiti sul portale Alloggiati Web: inviateci una foto di un documento valido per ciascuno prima dell'arrivo.",
      },
      en: {
        indirizzo: "Via dei Servi 12, 50122 Firenze FI",
        maps_url: mapsSearchUrl("Via dei Servi 12, 50122 Firenze"),
        orario_checkin: "From 3 pm to 10 pm (later arrivals on request)",
        passi: [
          { testo: "The main door is green, next to the gelato shop. No need to ring the intercom." },
          { testo: "Open the key box to the right of the door with the code we send you on your arrival day." },
          { testo: "Walk up to the second floor (there is no lift): it's the door on the left, number 4." },
          { testo: "Put the spare keys back in the box and scramble the code." },
        ],
        note: "Italian law requires us to register every guest's ID on the police portal (Alloggiati Web): please send us a photo of a valid ID for each guest before you arrive.",
      },
    },
  },
  {
    id: "demo-wifi",
    tipo: "wifi",
    ordine: 2,
    attiva: true,
    contenuto: {
      it: { rete: "CasaBrunelleschi", password: "Cupola1436!", note: "Il router è nel mobile dell'ingresso: se la connessione cade, spegnetelo e riaccendetelo." },
      en: { rete: "CasaBrunelleschi", password: "Cupola1436!", note: "The router is in the hallway cabinet: if the connection drops, switch it off and on again." },
    },
  },
  {
    id: "demo-casa",
    tipo: "casa",
    ordine: 3,
    attiva: true,
    contenuto: {
      it: {
        intro: "Qualche istruzione per sentirvi subito a casa.",
        elementi: [
          { nome: "Aria condizionata", istruzioni: "Il telecomando è sul comodino. Premete ON, modalità ❄️ e impostate 24-25 °C. Tenete le finestre chiuse mentre è accesa." },
          { nome: "Macchina del caffè", istruzioni: "Moka sul fornello: riempite d'acqua fino alla valvola, caffè nel filtro senza pressare, fuoco basso. Il caffè è nel barattolo rosso." },
          { nome: "Lavatrice", istruzioni: "In bagno. Detersivo nel cassetto, programma 'Cotone 40°' (circa 1 ora). Lo stendino è dietro la porta." },
          { nome: "Piano cottura a induzione", istruzioni: "Tenete premuto il tasto ⏻ per 2 secondi, poi scegliete la zona e la potenza con + e −. Funziona solo con le pentole in dotazione." },
        ],
      },
      en: {
        intro: "A few instructions to make you feel at home straight away.",
        elementi: [
          { nome: "Air conditioning", istruzioni: "The remote is on the bedside table. Press ON, ❄️ mode and set 24-25 °C. Please keep the windows closed while it's on." },
          { nome: "Coffee maker", istruzioni: "Moka pot on the hob: fill with water up to the valve, add coffee to the filter without pressing, low heat. Coffee is in the red jar." },
          { nome: "Washing machine", istruzioni: "In the bathroom. Detergent in the drawer, 'Cotton 40°' programme (about 1 hour). The drying rack is behind the door." },
          { nome: "Induction hob", istruzioni: "Hold the ⏻ button for 2 seconds, then choose the zone and power with + and −. It only works with the pans provided." },
        ],
      },
    },
  },
  {
    id: "demo-regole",
    tipo: "regole",
    ordine: 4,
    attiva: true,
    contenuto: {
      it: {
        regole: [
          "Silenzio dalle 22:00 alle 8:00: il palazzo è abitato da famiglie",
          "Vietato fumare in casa (potete farlo sul balconcino)",
          "Niente feste e nessun ospite oltre a quelli registrati",
          "Animali non ammessi",
          "Spegnete aria condizionata e luci quando uscite",
        ],
        note: "Grazie per rispettare la casa come se fosse vostra!",
      },
      en: {
        regole: [
          "Quiet hours from 10 pm to 8 am: families live in the building",
          "No smoking indoors (you may smoke on the small balcony)",
          "No parties and no guests other than those registered",
          "No pets allowed",
          "Please switch off the air conditioning and lights when you go out",
        ],
        note: "Thank you for treating our home as if it were your own!",
      },
    },
  },
  {
    id: "demo-differenziata",
    tipo: "differenziata",
    ordine: 5,
    attiva: true,
    contenuto: {
      it: {
        intro:
          "A Firenze la raccolta differenziata è obbligatoria. In cucina, sotto il lavello, trovate i contenitori già divisi per colore: vi basta seguire la tabella qui sotto.",
        rifiuti: [
          { tipo: "organico", nome: "Organico", colore: "#7A4E2D", nome_colore: "marrone", giorni: "Tutti i giorni", cosa_si: "Avanzi di cibo, fondi di caffè, bustine di tè, tovaglioli di carta", cosa_no: "Liquidi, sacchetti di plastica" },
          { tipo: "carta", nome: "Carta e cartone", colore: "#E2B93B", nome_colore: "giallo", giorni: "Tutti i giorni", cosa_si: "Giornali, scatole appiattite, cartoni della pizza puliti", cosa_no: "Carta unta, scontrini, carta forno" },
          { tipo: "plastica", nome: "Multimateriale: plastica e metalli", colore: "#2F6DB5", nome_colore: "blu", giorni: "Tutti i giorni", cosa_si: "Bottiglie, vaschette, flaconi, lattine, Tetra Pak", cosa_no: "Giocattoli, posate di plastica dura" },
          { tipo: "vetro", nome: "Vetro", colore: "#3E8E4E", nome_colore: "verde", giorni: "Campana verde, a qualsiasi ora tranne di notte", cosa_si: "Bottiglie e vasetti senza tappo", cosa_no: "Ceramica, specchi, bicchieri di cristallo" },
          { tipo: "indifferenziato", nome: "Indifferenziato", colore: "#6B6B6B", nome_colore: "grigio", giorni: "Tutti i giorni", cosa_si: "Pannolini, spugne, cocci, mozziconi spenti", cosa_no: "Tutto ciò che è riciclabile, pile, farmaci" },
        ],
        dove_conferire:
          "Le postazioni con i cassonetti sono in Piazza della Santissima Annunziata, a 100 metri: uscite dal portone e girate a destra. La campana del vetro è all'angolo con Via Battisti.",
        note: "Pile esauste e farmaci scaduti: lasciateli nel sacchetto sul ripiano della cucina, ci pensiamo noi.",
      },
      en: {
        intro:
          "Recycling is mandatory in Florence. In the kitchen, under the sink, you'll find bins already sorted by colour: just follow the table below.",
        rifiuti: [
          { tipo: "organico", nome: "Organic waste", colore: "#7A4E2D", nome_colore: "brown", giorni: "Every day", cosa_si: "Food scraps, coffee grounds, tea bags, paper napkins", cosa_no: "Liquids, plastic bags" },
          { tipo: "carta", nome: "Paper and cardboard", colore: "#E2B93B", nome_colore: "yellow", giorni: "Every day", cosa_si: "Newspapers, flattened boxes, clean pizza boxes", cosa_no: "Greasy paper, receipts, baking paper" },
          { tipo: "plastica", nome: "Mixed: plastic and metal", colore: "#2F6DB5", nome_colore: "blue", giorni: "Every day", cosa_si: "Bottles, trays, containers, cans, Tetra Pak cartons", cosa_no: "Toys, hard plastic cutlery" },
          { tipo: "vetro", nome: "Glass", colore: "#3E8E4E", nome_colore: "green", giorni: "Green bell-shaped bin, any time except at night", cosa_si: "Glass bottles and jars without lids", cosa_no: "Ceramics, mirrors, crystal glasses" },
          { tipo: "indifferenziato", nome: "General waste", colore: "#6B6B6B", nome_colore: "grey", giorni: "Every day", cosa_si: "Nappies, sponges, broken crockery, cigarette butts", cosa_no: "Anything recyclable, batteries, medicines" },
        ],
        dove_conferire:
          "The bins are in Piazza della Santissima Annunziata, 100 metres away: leave the building and turn right. The glass bin is on the corner with Via Battisti.",
        note: "Used batteries and expired medicines: leave them in the bag on the kitchen shelf and we'll take care of them.",
      },
    },
  },
  {
    id: "demo-tassa",
    tipo: "tassa",
    ordine: 6,
    attiva: true,
    contenuto: {
      it: {
        cin: "IT048017C2DEMO0001",
        importo: "7 € a persona a notte, per le prime 7 notti consecutive",
        esenzioni: "Bambini fino a 12 anni non compiuti",
        modalita_pagamento: "In contanti all'arrivo (lasciatela nella busta sul tavolo) oppure con il link di pagamento che vi inviamo.",
        note: "L'imposta è stabilita dal Comune di Firenze e viene versata interamente al Comune: non è un costo nostro.",
      },
      en: {
        cin: "IT048017C2DEMO0001",
        importo: "€7 per person per night, for the first 7 consecutive nights",
        esenzioni: "Children under 12",
        modalita_pagamento: "Cash on arrival (leave it in the envelope on the table) or via the payment link we send you.",
        note: "The tourist tax is set by the City of Florence and paid in full to the City: it is not our fee.",
      },
    },
  },
  {
    id: "demo-parcheggio",
    tipo: "parcheggio",
    ordine: 7,
    attiva: true,
    contenuto: {
      it: {
        parcheggio:
          "L'appartamento è in centro storico: vi consigliamo di lasciare l'auto al Parcheggio Sant'Ambrogio (circa 25 € al giorno) o al Parcheggio Stazione SMN e raggiungerci a piedi.",
        ztl_presente: true,
        ztl:
          "Siamo dentro la ZTL: le telecamere multano automaticamente le auto non autorizzate, anche solo per un passaggio. Di giorno è attiva dal lunedì al venerdì 7:30–20:00 e il sabato 7:30–16:00; d'estate c'è anche la ZTL notturna. Non entrate in auto se non con un permesso.",
        mezzi_pubblici:
          "Dalla stazione Santa Maria Novella sono 15 minuti a piedi. In alternativa, taxi dal parcheggio davanti alla stazione (circa 10 €).",
      },
      en: {
        parcheggio:
          "The apartment is in the historic centre: we recommend leaving your car at the Sant'Ambrogio car park (about €25 per day) or at the SMN Station car park and walking to us.",
        ztl_presente: true,
        ztl:
          "We are inside the ZTL (limited traffic zone): cameras automatically fine unauthorised cars, even for driving through once. During the day it is active Monday to Friday 7:30 am–8 pm and Saturday 7:30 am–4 pm; in summer there is also a night ZTL. Do not drive in without a permit.",
        mezzi_pubblici:
          "From Santa Maria Novella station it's a 15-minute walk. Alternatively, take a taxi from the rank in front of the station (about €10).",
      },
    },
  },
  {
    id: "demo-consigli",
    tipo: "consigli",
    ordine: 8,
    attiva: true,
    contenuto: {
      it: { intro: "I nostri posti del cuore, a pochi passi da casa. Diteci se vi sono piaciuti!" },
      en: { intro: "Our favourite places, a short walk from home. Let us know if you liked them!" },
    },
  },
  {
    id: "demo-emergenze",
    tipo: "emergenze",
    ordine: 9,
    attiva: true,
    contenuto: {
      it: {
        numeri: [
          { nome: "Numero unico di emergenza (ambulanza, polizia, vigili del fuoco)", numero: "112" },
          { nome: "Guardia medica (continuità assistenziale)", numero: "116117" },
        ],
        guardia_medica: "Chiamate il 116117 di notte, nei weekend e nei festivi per problemi di salute non urgenti.",
        farmacia_turno: "La Farmacia Comunale dentro la stazione Santa Maria Novella è aperta 24 ore su 24.",
        ospedale: "Pronto soccorso dell'Ospedale di Santa Maria Nuova, Piazza di Santa Maria Nuova 1 (10 minuti a piedi).",
        note: "Il quadro elettrico è dietro la porta d'ingresso. La valvola del gas è sotto il lavello.",
      },
      en: {
        numeri: [
          { nome: "Emergency number (ambulance, police, fire brigade)", numero: "112" },
          { nome: "Out-of-hours doctor (guardia medica)", numero: "116117" },
        ],
        guardia_medica: "Call 116117 at night, at weekends and on public holidays for non-urgent health problems.",
        farmacia_turno: "The Farmacia Comunale inside Santa Maria Novella station is open 24 hours a day.",
        ospedale: "Emergency room at Santa Maria Nuova Hospital, Piazza di Santa Maria Nuova 1 (10-minute walk).",
        note: "The fuse box is behind the front door. The gas valve is under the kitchen sink.",
      },
    },
  },
  {
    id: "demo-checkout",
    tipo: "checkout",
    ordine: 10,
    attiva: true,
    contenuto: {
      it: {
        orario: "Entro le 10:30",
        istruzioni:
          "Lasciate le chiavi nella cassetta accanto al portone e mischiate il codice. Se avete bisogno di lasciare i bagagli qualche ora, chiedeteci: troviamo sempre una soluzione.",
        checklist: [
          "Chiudete finestre e persiane",
          "Spegnete aria condizionata, luci e piano cottura",
          "Buttate la spazzatura negli appositi contenitori",
          "Lasciate le stoviglie usate in lavastoviglie",
          "Controllate di non aver dimenticato caricabatterie e documenti",
        ],
      },
      en: {
        orario: "By 10:30 am",
        istruzioni:
          "Leave the keys in the key box next to the main door and scramble the code. If you need to leave your luggage for a few hours, just ask: we always find a solution.",
        checklist: [
          "Close the windows and shutters",
          "Switch off the air conditioning, lights and hob",
          "Take the rubbish out to the correct bins",
          "Put used dishes in the dishwasher",
          "Make sure you haven't left chargers or documents behind",
        ],
      },
    },
  },
];

const luogo = (
  id: string,
  categoria: Luogo["categoria"],
  nome: string,
  it: string,
  en: string,
  query: string,
  ordine: number,
): Luogo => ({ id, categoria, nome, descrizione: { it, en }, maps_url: mapsSearchUrl(query), ordine });

const luoghi: Luogo[] = [
  luogo("demo-l1", "ristorante", "Trattoria Mario", "Trattoria storica vicino al Mercato Centrale, solo a pranzo. Ribollita e bistecca da provare.", "Historic trattoria near the Central Market, lunch only. Try the ribollita and the steak.", "Trattoria Mario, Via Rosina 2r, Firenze", 0),
  luogo("demo-l2", "ristorante", "Mercato Centrale", "Primo piano pieno di banchi di cibo: perfetto per accontentare tutti, aperto fino a tardi.", "First floor full of food stalls: perfect to please everyone, open until late.", "Mercato Centrale Firenze", 1),
  luogo("demo-l3", "bar", "Caffè in Piazza Santissima Annunziata", "Per un cappuccino al banco come i fiorentini, a due passi da casa.", "For a cappuccino at the counter like the locals, just around the corner.", "Piazza della Santissima Annunziata, Firenze", 2),
  luogo("demo-l4", "supermercato", "Supermercato in Via dei Servi", "Piccolo supermercato aperto tutti i giorni, a 2 minuti a piedi.", "Small supermarket open every day, a 2-minute walk away.", "supermercato Via dei Servi Firenze", 3),
  luogo("demo-l5", "farmacia", "Farmacia Comunale Stazione SMN", "Aperta 24 ore su 24, dentro la stazione Santa Maria Novella.", "Open 24/7, inside Santa Maria Novella station.", "Farmacia Comunale 13 Stazione Santa Maria Novella Firenze", 4),
  luogo("demo-l6", "attrazione", "Duomo e Cupola del Brunelleschi", "A 5 minuti a piedi. Prenotate online la salita alla Cupola con qualche giorno di anticipo.", "A 5-minute walk. Book the climb to the Dome online a few days in advance.", "Cattedrale di Santa Maria del Fiore, Firenze", 5),
  luogo("demo-l7", "attrazione", "Galleria dell'Accademia", "Il David di Michelangelo, a 3 minuti da casa. Meglio prenotare.", "Michelangelo's David, 3 minutes from home. Booking recommended.", "Galleria dell'Accademia, Firenze", 6),
  luogo("demo-l8", "attrazione", "Piazzale Michelangelo", "Il tramonto più bello su Firenze: 30 minuti a piedi o bus 12/13.", "The most beautiful sunset over Florence: 30 minutes on foot or bus 12/13.", "Piazzale Michelangelo, Firenze", 7),
];

export const DEMO_GUIDE: GuidaCompleta = {
  id: "demo",
  slug: "demo-firenze",
  nome_struttura: "Casa Brunelleschi",
  citta: "Firenze",
  stato: "pubblicata",
  pagata: true,
  colore: "#C4572E",
  logo_url: null,
  cover_url: COVER,
  lingue_attive: ["it", "en"],
  contatto_nome: "Giulia",
  contatto_telefono: "+39 333 000 0000",
  contatto_whatsapp: "+39 333 000 0000",
  sezioni,
  luoghi,
};
