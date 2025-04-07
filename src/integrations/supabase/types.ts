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
      completed_puzzles: {
        Row: {
          completed_at: string
          completion_time: number
          difficulty: string
          id: string
          puzzle_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completion_time: number
          difficulty: string
          id?: string
          puzzle_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completion_time?: number
          difficulty?: string
          id?: string
          puzzle_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_puzzles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string
          id: string
          puzzle_data: Json
          puzzle_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          puzzle_data: Json
          puzzle_date: string
        }
        Update: {
          created_at?: string
          id?: string
          puzzle_data?: Json
          puzzle_date?: string
        }
        Relationships: []
      }
      extended_stats: {
        Row: {
          avg_completion_time: number | null
          best_completion_time: number | null
          best_time_date: string | null
          created_at: string
          difficulty: string
          games_played: number
          games_won: number
          id: string
          total_time: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_completion_time?: number | null
          best_completion_time?: number | null
          best_time_date?: string | null
          created_at?: string
          difficulty: string
          games_played?: number
          games_won?: number
          id?: string
          total_time?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_completion_time?: number | null
          best_completion_time?: number | null
          best_time_date?: string | null
          created_at?: string
          difficulty?: string
          games_played?: number
          games_won?: number
          id?: string
          total_time?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_stats: {
        Row: {
          best_time_daily: number | null
          best_time_easy: number | null
          best_time_expert: number | null
          best_time_hard: number | null
          best_time_master: number | null
          best_time_medium: number | null
          created_at: string
          daily_streak: number | null
          games_played: number | null
          games_won: number | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_time_daily?: number | null
          best_time_easy?: number | null
          best_time_expert?: number | null
          best_time_hard?: number | null
          best_time_master?: number | null
          best_time_medium?: number | null
          created_at?: string
          daily_streak?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_time_daily?: number | null
          best_time_easy?: number | null
          best_time_expert?: number | null
          best_time_hard?: number | null
          best_time_master?: number | null
          best_time_medium?: number | null
          created_at?: string
          daily_streak?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          background_music: boolean
          created_at: string
          haptic_feedback: boolean
          id: string
          updated_at: string
          user_id: string
          volume: number
        }
        Insert: {
          background_music?: boolean
          created_at?: string
          haptic_feedback?: boolean
          id?: string
          updated_at?: string
          user_id: string
          volume?: number
        }
        Update: {
          background_music?: boolean
          created_at?: string
          haptic_feedback?: boolean
          id?: string
          updated_at?: string
          user_id?: string
          volume?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_all_user_stats: {
        Args: { user_uuid: string }
        Returns: undefined
      }
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
