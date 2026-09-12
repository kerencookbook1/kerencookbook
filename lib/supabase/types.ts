export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      shopping_items: {
        Row: {
          id: string
          owner_id: string
          name: string
          amount: string | null
          unit: string | null
          aisle: string | null
          is_checked: boolean
          source_recipe_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          amount?: string | null
          unit?: string | null
          aisle?: string | null
          is_checked?: boolean
          source_recipe_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          amount?: string | null
          unit?: string | null
          aisle?: string | null
          is_checked?: boolean
          source_recipe_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      meal_plans: {
        Row: {
          id: string
          owner_id: string
          date: string
          meal_type: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          date: string
          meal_type: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          date?: string
          meal_type?: string
          recipe_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          owner_id: string
          provider: string
          api_key: string
          is_active: boolean
          saved_at: string
          last_tested_at: string | null
          last_test_ok: boolean | null
          last_test_error: string | null
        }
        Insert: {
          owner_id: string
          provider: string
          api_key: string
          is_active?: boolean
          saved_at?: string
          last_tested_at?: string | null
          last_test_ok?: boolean | null
          last_test_error?: string | null
        }
        Update: {
          owner_id?: string
          provider?: string
          api_key?: string
          is_active?: boolean
          saved_at?: string
          last_tested_at?: string | null
          last_test_ok?: boolean | null
          last_test_error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_groups: {
        Row: {
          id: string
          position: number
          recipe_id: string
          title: string | null
        }
        Insert: {
          id?: string
          position?: number
          recipe_id: string
          title?: string | null
        }
        Update: {
          id?: string
          position?: number
          recipe_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_groups_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          amount: string | null
          group_id: string | null
          id: string
          name: string
          position: number
          recipe_id: string
          unit: string | null
        }
        Insert: {
          amount?: string | null
          group_id?: string | null
          id?: string
          name: string
          position?: number
          recipe_id: string
          unit?: string | null
        }
        Update: {
          amount?: string | null
          group_id?: string | null
          id?: string
          name?: string
          position?: number
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "ingredient_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipe_images: {
        Row: {
          id: string
          is_primary: boolean
          position: number
          recipe_id: string
          storage_path: string
        }
        Insert: {
          id?: string
          is_primary?: boolean
          position?: number
          recipe_id: string
          storage_path: string
        }
        Update: {
          id?: string
          is_primary?: boolean
          position?: number
          recipe_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_images_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_steps: {
        Row: {
          body: string
          duration_seconds: number | null
          id: string
          position: number
          recipe_id: string
          title: string | null
        }
        Insert: {
          body: string
          duration_seconds?: number | null
          id?: string
          position?: number
          recipe_id: string
          title?: string | null
        }
        Update: {
          body?: string
          duration_seconds?: number | null
          id?: string
          position?: number
          recipe_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          author: string | null
          category: string | null
          cook_time: number | null
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          is_diet_auto: boolean
          is_diet_override: boolean | null
          is_favorite: boolean
          notes: string | null
          owner_id: string
          prep_time: number | null
          rating: number | null
          servings: number | null
          source_name: string | null
          source_photo_path: string | null
          source_url: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_diet_auto?: boolean
          is_diet_override?: boolean | null
          is_favorite?: boolean
          notes?: string | null
          owner_id: string
          prep_time?: number | null
          rating?: number | null
          servings?: number | null
          source_name?: string | null
          source_photo_path?: string | null
          source_url?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          cook_time?: number | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          is_diet_auto?: boolean
          is_diet_override?: boolean | null
          is_favorite?: boolean
          notes?: string | null
          owner_id?: string
          prep_time?: number | null
          rating?: number | null
          servings?: number | null
          source_name?: string | null
          source_photo_path?: string | null
          source_url?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
