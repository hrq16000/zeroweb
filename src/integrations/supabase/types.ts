export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          cta_variant: string | null
          device_type: string | null
          event_name: string
          hero_variant: string | null
          id: string
          location: string | null
          metadata_json: Json | null
          page: string | null
          path: string | null
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          cta_variant?: string | null
          device_type?: string | null
          event_name: string
          hero_variant?: string | null
          id?: string
          location?: string | null
          metadata_json?: Json | null
          page?: string | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          cta_variant?: string | null
          device_type?: string | null
          event_name?: string
          hero_variant?: string | null
          id?: string
          location?: string | null
          metadata_json?: Json | null
          page?: string | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      crm_settings: {
        Row: {
          assignees: string[]
          distribution_mode: string
          fixed_assignee: string | null
          id: string
          round_robin_pointer: number
          singleton: boolean
          updated_at: string
        }
        Insert: {
          assignees?: string[]
          distribution_mode?: string
          fixed_assignee?: string | null
          id?: string
          round_robin_pointer?: number
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          assignees?: string[]
          distribution_mode?: string
          fixed_assignee?: string | null
          id?: string
          round_robin_pointer?: number
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      experiments: {
        Row: {
          clicks: number
          conversions: number
          experiment_name: string
          id: string
          impressions: number
          updated_at: string
          variant: string
        }
        Insert: {
          clicks?: number
          conversions?: number
          experiment_name: string
          id?: string
          impressions?: number
          updated_at?: string
          variant: string
        }
        Update: {
          clicks?: number
          conversions?: number
          experiment_name?: string
          id?: string
          impressions?: number
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      lead_history: {
        Row: {
          actor: string | null
          created_at: string
          from_value: string | null
          id: string
          kind: string
          lead_id: string
          note: string | null
          to_value: string | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          from_value?: string | null
          id?: string
          kind: string
          lead_id: string
          note?: string | null
          to_value?: string | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          from_value?: string | null
          id?: string
          kind?: string
          lead_id?: string
          note?: string | null
          to_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_submissions: {
        Row: {
          assignee: string | null
          company: string | null
          created_at: string
          cta_variant: string | null
          email: string | null
          hero_variant: string | null
          id: string
          landing_page: string | null
          last_interaction: string | null
          name: string | null
          notes: string | null
          payload_json: Json | null
          phone: string | null
          score: number
          score_label: string
          source: string | null
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assignee?: string | null
          company?: string | null
          created_at?: string
          cta_variant?: string | null
          email?: string | null
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          last_interaction?: string | null
          name?: string | null
          notes?: string | null
          payload_json?: Json | null
          phone?: string | null
          score?: number
          score_label?: string
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assignee?: string | null
          company?: string | null
          created_at?: string
          cta_variant?: string | null
          email?: string | null
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          last_interaction?: string | null
          name?: string | null
          notes?: string | null
          payload_json?: Json | null
          phone?: string | null
          score?: number
          score_label?: string
          source?: string | null
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      wa_funnel_sessions: {
        Row: {
          answers_json: Json | null
          completed: boolean
          completed_at: string | null
          created_at: string
          cta_variant: string | null
          current_step: number
          hero_variant: string | null
          id: string
          landing_page: string | null
          session_id: string | null
          started_at: string | null
          total_steps: number
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          answers_json?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          cta_variant?: string | null
          current_step?: number
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          session_id?: string | null
          started_at?: string | null
          total_steps?: number
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          answers_json?: Json | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          cta_variant?: string | null
          current_step?: number
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          session_id?: string | null
          started_at?: string | null
          total_steps?: number
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_experiment: {
        Args: {
          p_clicks?: number
          p_conversions?: number
          p_impressions?: number
          p_name: string
          p_variant: string
        }
        Returns: undefined
      }
      compute_lead_score: {
        Args: { p_row: Database["public"]["Tables"]["lead_submissions"]["Row"] }
        Returns: {
          label: string
          score: number
        }[]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
