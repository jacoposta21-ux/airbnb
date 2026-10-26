import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { APP_NAME, PREZZO_GUIDA_LABEL } from "@/lib/config";

// Landing provvisoria: la versione completa (esempio di guida, prezzi, FAQ)
// arriva con la pagina pubblica della guida.
export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Accedi
          </ButtonLink>
          <ButtonLink href="/registrati" size="sm">
            Prova gratis
          </ButtonLink>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-6xl">
          La guida per i tuoi ospiti, pronta in pochi minuti.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-grigio">
          {APP_NAME} crea una guida digitale per il tuo affitto breve, pensata per l&apos;Italia e tradotta in 5
          lingue. Paghi {PREZZO_GUIDA_LABEL} una volta sola, quando la pubblichi.
        </p>
        <ButtonLink href="/registrati" size="lg" className="mt-8">
          Crea la tua guida gratis
        </ButtonLink>
      </main>
    </div>
  );
}
