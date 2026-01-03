/**
 * Supabase Database Types
 * Auto-generated types for type safety
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clothing_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          color: string;
          image_url: string | null;
          season: string[];
          brand: string | null;
          tags: string[] | null;
          favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          color: string;
          image_url?: string | null;
          season: string[];
          brand?: string | null;
          tags?: string[] | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          color?: string;
          image_url?: string | null;
          season?: string[];
          brand?: string | null;
          tags?: string[] | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      outfits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          items: string[]; // Array of clothing_item IDs
          season: string | null;
          occasion: string | null;
          favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          items: string[];
          season?: string | null;
          occasion?: string | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          items?: string[];
          season?: string | null;
          occasion?: string | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
