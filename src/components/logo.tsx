import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Marchio: una chiave stilizzata dentro un arco, come un portone italiano. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <path d="M4 30V14C4 7.4 9.4 2 16 2s12 5.4 12 12v16z" fill="var(--color-terracotta)" />
      <circle cx="16" cy="14" r="4" fill="none" stroke="white" strokeWidth="2.2" />
      <path d="M16 18v8m0-3h3" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label={`${APP_NAME} — home`}>
      <LogoMark />
      <span className="font-serif text-xl font-semibold tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
