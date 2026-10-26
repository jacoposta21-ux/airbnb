import {
  Car,
  Coffee,
  Heart,
  House,
  KeyRound,
  Landmark,
  LogOut,
  MapPin,
  Pill,
  Receipt,
  Recycle,
  ScrollText,
  ShoppingCart,
  Siren,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { CategoriaLuogo, TipoSezione } from "@/types/guide";

export const ICONE_SEZIONE: Record<TipoSezione, LucideIcon> = {
  benvenuto: Heart,
  arrivo: KeyRound,
  wifi: Wifi,
  casa: House,
  regole: ScrollText,
  differenziata: Recycle,
  tassa: Receipt,
  parcheggio: Car,
  consigli: MapPin,
  emergenze: Siren,
  checkout: LogOut,
};

export const ICONE_CATEGORIA: Record<CategoriaLuogo, LucideIcon> = {
  ristorante: Utensils,
  bar: Coffee,
  supermercato: ShoppingCart,
  farmacia: Pill,
  attrazione: Landmark,
  altro: MapPin,
};

export function SectionIcon({ tipo, className }: { tipo: TipoSezione; className?: string }) {
  const Icon = ICONE_SEZIONE[tipo];
  return <Icon className={className} aria-hidden="true" />;
}
