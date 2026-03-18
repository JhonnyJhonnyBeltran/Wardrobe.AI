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
          color_hex: string | null;
          image_url: string | null;
          original_image_url: string | null;
          season: string[];
          brand: string | null;
          tags: string[] | null;
          favorite: boolean;
          is_ai_processed: boolean;
          size: string | null;
          reference: string | null;
          fabric: string | null;
          source_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          color: string;
          color_hex?: string | null;
          image_url?: string | null;
          original_image_url?: string | null;
          season: string[];
          brand?: string | null;
          tags?: string[] | null;
          favorite?: boolean;
          is_ai_processed?: boolean;
          size?: string | null;
          reference?: string | null;
          fabric?: string | null;
          source_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          color?: string;
          color_hex?: string | null;
          image_url?: string | null;
          original_image_url?: string | null;
          season?: string[];
          brand?: string | null;
          tags?: string[] | null;
          favorite?: boolean;
          is_ai_processed?: boolean;
          size?: string | null;
          reference?: string | null;
          fabric?: string | null;
          source_url?: string | null;
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
       profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          bio: string | null;
          gender: string | null;
          age_range: string | null;
          height: number | null;
          height_range: string | null;
          preferred_styles: string[] | null;
          uses_accessories: boolean | null;
          visual_style_preferences: string[] | null;
          style_completed: boolean;
          morphology: string | null;
          colorimetry: string | null;
          hair_type: string | null;
          skin_tone: string | null;
          body_shape: string | null;
          favorite_colors: string[] | null;
          occasions_preferences: string[] | null;
          budget_range: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          bio?: string | null;
          gender?: string | null;
          age_range?: string | null;
          height?: number | null;
          height_range?: string | null;
          preferred_styles?: string[] | null;
          uses_accessories?: boolean | null;
          visual_style_preferences?: string[] | null;
          style_completed?: boolean;
          morphology?: string | null;
          colorimetry?: string | null;
          hair_type?: string | null;
          skin_tone?: string | null;
          body_shape?: string | null;
          favorite_colors?: string[] | null;
          occasions_preferences?: string[] | null;
          budget_range?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          bio?: string | null;
          gender?: string | null;
          age_range?: string | null;
          height?: number | null;
          height_range?: string | null;
          preferred_styles?: string[] | null;
          uses_accessories?: boolean | null;
          visual_style_preferences?: string[] | null;
          style_completed?: boolean;
          morphology?: string | null;
          colorimetry?: string | null;
          hair_type?: string | null;
          skin_tone?: string | null;
          body_shape?: string | null;
          favorite_colors?: string[] | null;
          occasions_preferences?: string[] | null;
          budget_range?: string | null;
          updated_at?: string | null;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          status: 'pending' | 'accepted';
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          status?: 'pending' | 'accepted';
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          status?: 'pending' | 'accepted';
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          sender_id: string;
          receiver_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      users: { // Legacy/Alias - keeping for compatibility but prioritizing profiles
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar: string | null;
          age_range: string | null;
          gender: string | null;
          height: number | null;
          height_range: string | null;
          preferred_styles: string[] | null;
          uses_accessories: boolean | null;
          visual_style_preferences: string[] | null;
          style_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          age_range?: string | null;
          gender?: string | null;
          height?: number | null;
          height_range?: string | null;
          preferred_styles?: string[] | null;
          uses_accessories?: boolean | null;
          visual_style_preferences?: string[] | null;
          style_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar?: string | null;
          age_range?: string | null;
          gender?: string | null;
          height?: number | null;
          height_range?: string | null;
          preferred_styles?: string[] | null;
          uses_accessories?: boolean | null;
          visual_style_preferences?: string[] | null;
          style_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          website: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          website?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          website?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string | null;
          likes: number;
          comments: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          likes?: number;
          comments?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string | null;
          likes?: number;
          comments?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      save_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      save_folder_items: {
        Row: {
          id: string;
          folder_id: string;
          save_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          save_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string;
          save_id?: string;
          created_at?: string;
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
