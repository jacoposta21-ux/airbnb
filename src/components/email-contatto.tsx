import Link from "next/link";
import { LEGALE } from "@/lib/legale";

/** Email di contatto cliccabile; se non configurata rimanda alla pagina Contatti. */
export function EmailContatto() {
  if (!LEGALE.email) return <Link href="/contatti">i recapiti indicati nella pagina Contatti</Link>;
  return <a href={`mailto:${LEGALE.email}`}>{LEGALE.email}</a>;
}
