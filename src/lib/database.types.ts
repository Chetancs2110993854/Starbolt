export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string 
          name: string 
          email: string 
          role: string 
          business_name: string | null
          phone: string | null
          phone_verified: boolean | null
          commission_earned: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          role: string
          business_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          commission_earned?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          business_name?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          commission_earned?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          business_url: string
          business_name: string
          package_id: string
          total_reviews: number
          completed_reviews: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          business_url: string
          business_name: string
          package_id: string
          total_reviews: number
          completed_reviews?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          business_url?: string
          business_name?: string
          package_id?: string
          total_reviews?: number
          completed_reviews?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      review_tasks: {
        Row: {
          id: string
          order_id: string
          intern_id: string | null
          status: string | null
          commission: number
          guidelines: string[]
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          intern_id?: string | null
          status?: string | null
          commission: number
          guidelines: string[]
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          intern_id?: string | null
          status?: string | null
          commission?: number
          guidelines?: string[]
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      review_proofs: {
        Row: {
          id: string
          task_id: string
          intern_id: string
          screenshot_url: string
          review_content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          intern_id: string
          screenshot_url: string
          review_content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          intern_id?: string
          screenshot_url?: string
          review_content?: string
          created_at?: string | null
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