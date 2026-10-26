import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type RGB } from "pdf-lib";
import { APP_NAME } from "@/lib/config";
import { qrPng } from "@/lib/qr";

/** Formato A5 in punti tipografici (148 × 210 mm). */
const A5 = { w: 419.53, h: 595.28 };

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/** I font standard PDF usano WinAnsi: rimuove i caratteri non rappresentabili. */
function pulisci(testo: string) {
  return testo.replace(/[^\x20-\x7E -ÿ€–—’“”•…]/g, "").trim();
}

/** Riduce la dimensione del testo finché non entra nella larghezza disponibile. */
function misura(font: PDFFont, testo: string, size: number, maxW: number) {
  let s = size;
  while (s > 8 && font.widthOfTextAtSize(testo, s) > maxW) s -= 0.5;
  return s;
}

function centrato(page: ReturnType<PDFDocument["addPage"]>, testo: string, y: number, font: PDFFont, size: number, color: RGB) {
  const s = misura(font, testo, size, A5.w - 60);
  page.drawText(testo, { x: (A5.w - font.widthOfTextAtSize(testo, s)) / 2, y, size: s, font, color });
}

export interface DatiCartello {
  nome_struttura: string;
  colore: string;
  url: string;
  wifi?: { rete?: string; password?: string } | null;
}

/** Cartello A5 da stampare e appendere in casa: QR code grande e istruzioni in più lingue. */
export async function creaCartelloPdf(d: DatiCartello) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Guida ospiti – ${pulisci(d.nome_struttura)}`);
  pdf.setCreator(APP_NAME);
  const page = pdf.addPage([A5.w, A5.h]);

  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const brand = hexToRgb(d.colore);
  const inchiostro = rgb(0.165, 0.129, 0.11);
  const grigio = rgb(0.435, 0.38, 0.341);
  const crema = rgb(0.984, 0.969, 0.945);

  // Sfondo e fascia superiore nel colore della guida
  page.drawRectangle({ x: 0, y: 0, width: A5.w, height: A5.h, color: crema });
  page.drawRectangle({ x: 0, y: A5.h - 150, width: A5.w, height: 150, color: brand });
  centrato(page, "Benvenuti!", A5.h - 70, serif, 38, rgb(1, 1, 1));
  centrato(page, "Welcome · Bienvenue · Willkommen · Bienvenidos", A5.h - 98, sans, 11, rgb(1, 1, 1));
  centrato(page, pulisci(d.nome_struttura), A5.h - 128, sansBold, 15, rgb(1, 1, 1));

  // Riquadro bianco con il QR code
  const qrSize = 200;
  const boxSize = qrSize + 30;
  const boxY = A5.h - 150 - 30 - boxSize;
  page.drawRectangle({ x: (A5.w - boxSize) / 2, y: boxY, width: boxSize, height: boxSize, color: rgb(1, 1, 1), borderColor: rgb(0.894, 0.843, 0.769), borderWidth: 1 });
  const qr = await pdf.embedPng(await qrPng(d.url, 900));
  page.drawImage(qr, { x: (A5.w - qrSize) / 2, y: boxY + 15, width: qrSize, height: qrSize });

  // Istruzioni
  let y = boxY - 30;
  centrato(page, "Inquadra il QR code con la fotocamera", y, sansBold, 13, inchiostro);
  y -= 17;
  centrato(page, "Wi-Fi, check-in, raccolta differenziata, consigli e numeri utili", y, sans, 9.5, grigio);
  y -= 15;
  centrato(page, "Scan with your phone camera for the house guide", y, sans, 9.5, grigio);

  // Wi-Fi, se presente
  if (d.wifi?.rete || d.wifi?.password) {
    y -= 34;
    page.drawRectangle({ x: 40, y: y - 12, width: A5.w - 80, height: 34, color: rgb(1, 1, 1), borderColor: rgb(0.894, 0.843, 0.769), borderWidth: 1 });
    const testo = pulisci(`Wi-Fi: ${d.wifi.rete ?? ""}${d.wifi.password ? `   ·   Password: ${d.wifi.password}` : ""}`);
    centrato(page, testo, y, sansBold, 11, inchiostro);
  }

  // Link e piè di pagina
  centrato(page, d.url.replace(/^https?:\/\//, ""), 42, sans, 9, brand);
  centrato(page, `Guida creata con ${APP_NAME}`, 24, sans, 7.5, grigio);

  return pdf.save();
}
