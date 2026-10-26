/**
 * Tipi del database Supabase, allineati a supabase/migrations.
 *
 * Si possono rigenerare automaticamente con:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 * (in quel caso mantenere gli alias in fondo al file).
 */

import type { CategoriaLuogo, TipoSezione } from "./guide";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type StatoGuida = "bozza" | "pubblicata";
type StatoPagamento = "in_attesa" | "pagato" | "fallito" | "rimborsato";

export interface Database {
  public: {
    Tables: {
      hosts: {
        Row: {
          id: string;
          email: string;
          nome: string | null;
          telefono: string | null;
          creato_il: string;
        };
        Insert: {
          id: string;
          email: string;
          nome?: string | null;
          telefono?: string | null;
          creato_il?: string;
        };
        Update: Partial<Database["public"]["Tables"]["hosts"]["Insert"]>;
        Relationships: [];
      };
      guides: {
        Row: {
          id: string;
          host_id: string;
          slug: string;
          nome_struttura: string;
          citta: string;
          stato: StatoGuida;
          pagata: boolean;
          colore: string;
          logo_url: string | null;
          cover_url: string | null;
          lingue_attive: string[];
          contatto_nome: string | null;
          contatto_telefono: string | null;
          contatto_whatsapp: string | null;
          creato_il: string;
          aggiornato_il: string;
          pubblicata_il: string | null;
        };
        Insert: {
          id?: string;
          host_id: string;
          slug: string;
          nome_struttura: string;
          citta?: string;
          stato?: StatoGuida;
          pagata?: boolean;
          colore?: string;
          logo_url?: string | null;
          cover_url?: string | null;
          lingue_attive?: string[];
          contatto_nome?: string | null;
          contatto_telefono?: string | null;
          contatto_whatsapp?: string | null;
          creato_il?: string;
          aggiornato_il?: string;
          pubblicata_il?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["guides"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "guides_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "hosts";
            referencedColumns: ["id"];
          },
        ];
      };
      sections: {
        Row: {
          id: string;
          guide_id: string;
          tipo: TipoSezione;
          ordine: number;
          attiva: boolean;
          contenuto: Json;
        };
        Insert: {
          id?: string;
          guide_id: string;
          tipo: TipoSezione;
          ordine?: number;
          attiva?: boolean;
          contenuto?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["sections"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "sections_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: false;
            referencedRelation: "guides";
            referencedColumns: ["id"];
          },
        ];
      };
      places: {
        Row: {
          id: string;
          guide_id: string;
          categoria: CategoriaLuogo;
          nome: string;
          descrizione: Json;
          maps_url: string | null;
          ordine: number;
        };
        Insert: {
          id?: string;
          guide_id: string;
          categoria?: CategoriaLuogo;
          nome: string;
          descrizione?: Json;
          maps_url?: string | null;
          ordine?: number;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "places_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: false;
            referencedRelation: "guides";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          guide_id: string;
          stripe_session_id: string;
          importo: number;
          stato: StatoPagamento;
          creato_il: string;
        };
        Insert: {
          id?: string;
          guide_id: string;
          stripe_session_id: string;
          importo: number;
          stato?: StatoPagamento;
          creato_il?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "payments_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: false;
            referencedRelation: "guides";
            referencedColumns: ["id"];
          },
        ];
      };
      views: {
        Row: {
          id: number;
          guide_id: string;
          sezione: TipoSezione | null;
          data: string;
        };
        Insert: {
          guide_id: string;
          sezione?: TipoSezione | null;
          data?: string;
        };
        Update: Partial<Database["public"]["Tables"]["views"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "views_guide_id_fkey";
            columns: ["guide_id"];
            isOneToOne: false;
            referencedRelation: "guides";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      guide_stats: {
        Args: { p_guide_id: string };
        Returns: Json;
      };
      is_guide_owner: {
        Args: { p_guide_id: string };
        Returns: boolean;
      };
      is_guide_public: {
        Args: { p_guide_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      stato_guida: StatoGuida;
      tipo_sezione: TipoSezione;
      categoria_luogo: CategoriaLuogo;
      stato_pagamento: StatoPagamento;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Alias comodi
export type Tabella<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type GuideRow = Tabella<"guides">;
export type SectionRow = Tabella<"sections">;
export type PlaceRow = Tabella<"places">;
export type HostRow = Tabella<"hosts">;
