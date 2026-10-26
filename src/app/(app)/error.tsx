"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-serif text-2xl font-semibold">Qualcosa è andato storto</h1>
      <p className="mt-2 text-grigio">
        Non siamo riusciti a caricare questa pagina. Controlla la connessione e riprova.
      </p>
      <Button className="mt-6" onClick={reset} icon={<RotateCcw className="size-4" />}>
        Riprova
      </Button>
    </div>
  );
}
