import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-sabbia text-grigio",
  success: "bg-oliva-chiaro text-oliva",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
