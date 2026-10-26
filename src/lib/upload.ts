"use client";

import { MEDIA_BUCKET } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const MAX_LATO = 1600;
const MAX_BYTES_ORIGINALE = 15 * 1024 * 1024;

/**
 * Ridimensiona e comprime un'immagine nel browser (WebP, max 1600 px) prima
 * dell'upload: guide leggere anche per ospiti con connessione scarsa.
 */
async function comprimi(file: File, maxLato = MAX_LATO): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scala = Math.min(1, maxLato / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scala);
  const h = Math.round(bitmap.height * scala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
  if (!blob) throw new Error("Compressione non riuscita");
  return blob;
}

/** Carica un'immagine nella cartella dell'host e restituisce l'URL pubblico. */
export async function caricaImmagine(file: File, hostId: string, guideId: string, maxLato?: number): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Il file deve essere un'immagine (JPG, PNG, WebP).");
  if (file.size > MAX_BYTES_ORIGINALE) throw new Error("L'immagine è troppo grande (massimo 15 MB).");

  let blob: Blob = file;
  let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  try {
    blob = await comprimi(file, maxLato);
    ext = "webp";
  } catch {
    // Browser senza supporto (raro): carica l'originale se non supera 5 MB.
    if (file.size > 5 * 1024 * 1024) throw new Error("Immagine troppo grande: riducila sotto i 5 MB.");
  }

  const supabase = createClient();
  const path = `${hostId}/${guideId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type || file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error("Caricamento non riuscito. Riprova.");
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
