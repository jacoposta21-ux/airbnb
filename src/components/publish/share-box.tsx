"use client";

import { MessageCircle } from "lucide-react";
import { CopyButton } from "@/components/guide/copy-button";

/** Link della guida con copia rapida e messaggio pronto per gli ospiti. */
export function ShareBox({ url, nome }: { url: string; nome: string }) {
  const messaggio = `Ciao! Ecco la guida di ${nome}, con tutte le informazioni per il vostro soggiorno (check-in, Wi-Fi, consigli): ${url}`;
  return (
    <div className="space-y-4" style={{ ["--brand" as string]: "var(--color-terracotta)" }}>
      <div className="flex items-center gap-2 rounded-xl border border-bordo bg-white p-2 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-sm">{url}</span>
        <CopyButton text={url} label="Copia link" copiedLabel="Copiato!" />
      </div>
      <div className="rounded-xl border border-bordo bg-white p-4">
        <p className="text-sm font-medium">Messaggio pronto da inviare agli ospiti</p>
        <p className="mt-2 rounded-lg bg-crema p-3 text-sm text-grigio">{messaggio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={messaggio} label="Copia messaggio" copiedLabel="Copiato!" />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(messaggio)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-bordo bg-white px-4 py-2 text-sm font-medium hover:bg-sabbia"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Invia con WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
