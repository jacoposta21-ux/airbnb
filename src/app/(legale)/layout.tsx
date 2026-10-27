import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { ButtonLink } from "@/components/ui/button";

export default function LegaleLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-bordo/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ButtonLink href="/registrati" size="sm">
            Prova gratis
          </ButtonLink>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <article className="testo-legale">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
