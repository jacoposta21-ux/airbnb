import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Stato di caricamento a pagina intera, usato nei file loading.tsx. */
export function PageLoader({ label = "Caricamento…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-grigio" role="status">
      <Spinner className="mr-3 size-5 text-terracotta" />
      <span>{label}</span>
    </div>
  );
}
