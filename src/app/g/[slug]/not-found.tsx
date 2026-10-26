import Link from "next/link";

export default function GuidaNonTrovata() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl" aria-hidden="true">🗝️</p>
      <h1 className="mt-4 font-serif text-2xl font-semibold">Guida non trovata</h1>
      <p className="mt-2 max-w-sm text-grigio">
        Il link potrebbe essere sbagliato oppure la guida non è più disponibile. Contatta il tuo host.
      </p>
      <p className="mt-1 max-w-sm text-sm text-grigio">Guide not found. Please check the link or contact your host.</p>
      <Link href="/" className="mt-6 text-sm font-medium text-terracotta underline underline-offset-4">
        Torna alla home
      </Link>
    </div>
  );
}
