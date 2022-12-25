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
      items: {
        Row: {
          id: string
          created_at: string
          name: string
          group: string
          checked: boolean
          list_id: string
          assigned_to: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          group: string
          checked?: boolean
          list_id: string
          assigned_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          group?: string
          checked?: boolean
          list_id?: string
          assigned_to?: string | null
        }
      }
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
