export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      shopping_list: {
        Row: {
          id: string;
          created_at: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          name?: string;
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
