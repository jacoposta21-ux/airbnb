import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-oliva/30 bg-oliva-chiaro text-oliva",
  info: "border-bordo bg-sabbia/60 text-inchiostro",
};

const icons = { error: AlertCircle, success: CheckCircle2, info: Info };

export function Alert({ tone = "info", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  const Icon = icons[tone];
  return (
    <div
      className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", tones[tone], className)}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
