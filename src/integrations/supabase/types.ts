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
      games: {
        Row: {
          created_at: string | null
          description: string | null
          entry_fee: number | null
          id: string
          prize_amount: number | null
          prize_description: string | null
          status: string | null
          time_limit_minutes: number | null
          title: string
          total_questions: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entry_fee?: number | null
          id?: string
          prize_amount?: number | null
          prize_description?: string | null
          status?: string | null
          time_limit_minutes?: number | null
          title: string
          total_questions?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entry_fee?: number | null
          id?: string
          prize_amount?: number | null
          prize_description?: string | null
          status?: string | null
          time_limit_minutes?: number | null
          title?: string
          total_questions?: number | null
        }
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string | null
          id: string
          phone: string | null
          phone_verified: boolean | null
          role: string | null
          updated_at: string | null
          wallet_balance: number | null
          documents_verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
          documents_verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string | null
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: string | null
          updated_at?: string | null
          wallet_balance?: number | null
          documents_verified?: boolean | null
        }
      }
      user_game_progress: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          game_id: string | null
          id: string
          score: number | null
          status: string | null
          time_taken_seconds: number | null
          total_questions: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          score?: number | null
          status?: string | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          score?: number | null
          status?: string | null
          time_taken_seconds?: number | null
          total_questions?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string | null
          end_time: string | null
          status: string
          total_questions: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string
          total_questions?: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          status?: string
          total_questions?: number
          created_at?: string
          created_by?: string
        }
      }
      user_quiz_scores: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          total_questions: number
          correct_answers: number
          time_taken_seconds: number | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score?: number
          total_questions: number
          correct_answers?: number
          time_taken_seconds?: number | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          correct_answers?: number
          time_taken_seconds?: number | null
          completed_at?: string | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

export const Constants = {
  public: {
    Enums: {},
  },
} as const
