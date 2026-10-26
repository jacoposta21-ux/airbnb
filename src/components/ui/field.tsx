import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-xl border border-bordo bg-white px-3.5 py-2.5 text-[15px] text-inchiostro placeholder:text-grigio/60 shadow-xs transition-colors focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 disabled:bg-sabbia/50";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(inputBase, "leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputBase, "h-11 pr-8", className)} {...props} />;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

/** Etichetta + controllo + suggerimento/errore. */
export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-inchiostro">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-grigio">{hint}</p>
      ) : null}
    </div>
  );
}
