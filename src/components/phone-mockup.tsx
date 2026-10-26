import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Cornice di smartphone con area scorrevole, per anteprime della guida. */
export function PhoneMockup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex h-[min(72vh,740px)] w-[min(100%,380px)] flex-col overflow-hidden rounded-[3rem] border-[10px] border-inchiostro bg-crema shadow-2xl",
        className,
      )}
    >
      {/* Barra di stato con la "isola" della fotocamera, fuori dall'area scorrevole */}
      <div className="relative h-7 shrink-0 bg-crema" aria-hidden="true">
        <div className="absolute left-1/2 top-1.5 h-5 w-24 -translate-x-1/2 rounded-full bg-inchiostro" />
      </div>
      <div data-anteprima-scroll className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none]">
        {children}
      </div>
    </div>
  );
}
