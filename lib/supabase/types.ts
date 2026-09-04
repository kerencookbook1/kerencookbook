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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          prep_time: number | null
          cook_time: number | null
          servings: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          prep_time?: number | null
          cook_time?: number | null
          servings?: number | null
          status?: string
          updated_at?: string
        }
      }
      ingredient_groups: {
        Row: {
          id: string
          recipe_id: string
          title: string | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          title?: string | null
          position?: number
        }
        Update: {
          title?: string | null
          position?: number
        }
      }
      ingredients: {
        Row: {
          id: string
          recipe_id: string
          group_id: string | null
          name: string
          amount: string | null
          unit: string | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          group_id?: string | null
          name: string
          amount?: string | null
          unit?: string | null
          position?: number
        }
        Update: {
          group_id?: string | null
          name?: string
          amount?: string | null
          unit?: string | null
          position?: number
        }
      }
      recipe_steps: {
        Row: {
          id: string
          recipe_id: string
          title: string | null
          body: string
          duration_seconds: number | null
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          title?: string | null
          body: string
          duration_seconds?: number | null
          position?: number
        }
        Update: {
          title?: string | null
          body?: string
          duration_seconds?: number | null
          position?: number
        }
      }
      recipe_images: {
        Row: {
          id: string
          recipe_id: string
          storage_path: string
          is_primary: boolean
          position: number
        }
        Insert: {
          id?: string
          recipe_id: string
          storage_path: string
          is_primary?: boolean
          position?: number
        }
        Update: {
          storage_path?: string
          is_primary?: boolean
          position?: number
        }
      }
    }
  }
}
