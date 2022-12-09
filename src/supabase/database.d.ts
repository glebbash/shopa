export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      shopping_list: {
        Row: {
          id: string
          created_at: string
          name: string
          created_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          created_by: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          created_by?: string
        }
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
  }
}
