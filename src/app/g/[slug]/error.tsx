"use client";

export default function ErroreGuida({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-2xl font-semibold">Connessione assente o lenta</h1>
      <p className="mt-2 max-w-sm text-grigio">Non riusciamo a caricare la guida. / We can&apos;t load the guide right now.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-terracotta px-5 py-2.5 font-medium text-white"
      >
        Riprova / Retry
      </button>
    </div>
  );
}
