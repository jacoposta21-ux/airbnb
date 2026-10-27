import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_NAME } from "@/lib/config";
import { LEGALE } from "@/lib/legale";

const LINK = [
  { href: "/termini", label: "Termini di servizio" },
  { href: "/privacy", label: "Privacy e cookie" },
  { href: "/rimborsi", label: "Rimborsi" },
  { href: "/contatti", label: "Contatti" },
];

/** Footer del sito con i link alle pagine legali e i dati del titolare. */
export function SiteFooter() {
  return (
    <footer className="border-t border-bordo/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-grigio sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p>
            © {new Date().getFullYear()} {APP_NAME} · {LEGALE.titolare}
            {LEGALE.partitaIva && ` · P.IVA ${LEGALE.partitaIva}`}
          </p>
          {LEGALE.email && (
            <p>
              <a href={`mailto:${LEGALE.email}`} className="hover:text-inchiostro">
                {LEGALE.email}
              </a>
            </p>
          )}
        </div>
        <nav aria-label="Informazioni legali">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LINK.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-inchiostro hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
