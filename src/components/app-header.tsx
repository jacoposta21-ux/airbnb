import { LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

/** Intestazione dell'area riservata agli host. */
export function AppHeader({ nome, email, admin = false }: { nome: string | null; email: string; admin?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-bordo/70 bg-crema/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/dashboard" className="hidden rounded-full px-3 py-2 text-sm font-medium hover:bg-sabbia sm:block">
            Le mie guide
          </Link>
          {admin && (
            <Link href="/admin" className="rounded-full px-3 py-2 text-sm font-medium text-terracotta hover:bg-sabbia">
              Admin
            </Link>
          )}
          <span className="hidden max-w-48 truncate text-sm text-grigio md:block" title={email}>
            {nome || email}
          </span>
          <form action="/auth/esci" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-grigio hover:bg-sabbia hover:text-inchiostro"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
