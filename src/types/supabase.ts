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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          id: string
          images: string[] | null
          message: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          message?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          message?: string | null
          title?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          category: string | null
          data: Json | null
          device_info: Json | null
          id: string
          level: string
          message: string | null
          session_id: string | null
          stack_trace: string | null
          synced_at: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          data?: Json | null
          device_info?: Json | null
          id?: string
          level: string
          message?: string | null
          session_id?: string | null
          stack_trace?: string | null
          synced_at?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          data?: Json | null
          device_info?: Json | null
          id?: string
          level?: string
          message?: string | null
          session_id?: string | null
          stack_trace?: string | null
          synced_at?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_reports: {
        Row: {
          action: string | null
          context: Json | null
          device_info: Json | null
          error_id: string | null
          error_message: string | null
          error_stack: string | null
          id: string
          reproduction_steps: string | null
          synced_at: string | null
          timestamp: string
          user_email: string | null
          user_feedback: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          context?: Json | null
          device_info?: Json | null
          error_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          reproduction_steps?: string | null
          synced_at?: string | null
          timestamp?: string
          user_email?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          context?: Json | null
          device_info?: Json | null
          error_id?: string | null
          error_message?: string | null
          error_stack?: string | null
          id?: string
          reproduction_steps?: string | null
          synced_at?: string | null
          timestamp?: string
          user_email?: string | null
          user_feedback?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      renewals: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          approved_remark: string | null
          certificate_url: string | null
          id: string
          kind: Database["public"]["Enums"]["renewal_kind"]
          payment_method: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejected_remark: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["renewal_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          approved_remark?: string | null
          certificate_url?: string | null
          id?: string
          kind: Database["public"]["Enums"]["renewal_kind"]
          payment_method?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_remark?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["renewal_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          approved_remark?: string | null
          certificate_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["renewal_kind"]
          payment_method?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_remark?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["renewal_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "renewals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          platform: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          platform?: string | null
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          platform?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ack: boolean
          address: string | null
          approved_at: string | null
          approved_by: string | null
          approved_remark: string | null
          birth_date: string | null
          created_at: string
          email: string
          full_name: string
          gender: string | null
          ic_no: string | null
          id: string
          kita_resident: string | null
          marital_status: string | null
          membership_expiry: string | null
          migrated: boolean
          number_of_family_members: number | null
          occupation: string | null
          phone_no: string
          pkkc_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejected_remark: string | null
          role: Database["public"]["Enums"]["user_role"]
          slip_bayaran_url: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          ack?: boolean
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_remark?: string | null
          birth_date?: string | null
          created_at?: string
          email: string
          full_name?: string
          gender?: string | null
          ic_no?: string | null
          id: string
          kita_resident?: string | null
          marital_status?: string | null
          membership_expiry?: string | null
          migrated?: boolean
          number_of_family_members?: number | null
          occupation?: string | null
          phone_no?: string
          pkkc_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_remark?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slip_bayaran_url?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          ack?: boolean
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_remark?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: string | null
          ic_no?: string | null
          id?: string
          kita_resident?: string | null
          marital_status?: string | null
          membership_expiry?: string | null
          migrated?: boolean
          number_of_family_members?: number | null
          occupation?: string | null
          phone_no?: string
          pkkc_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_remark?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slip_bayaran_url?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      resolve_ic_to_email: { Args: { p_ic_no: string }; Returns: string }
      self_verify_and_set_password: {
        Args: { p_email: string; p_ic_no: string; p_new_password: string }
        Returns: string
      }
    }
    Enums: {
      renewal_kind: "payment" | "certificate"
      renewal_status: "pending" | "approved" | "rejected"
      user_role: "member" | "admin" | "ajk" | "user"
      user_status: "pending" | "active" | "inactive" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      renewal_kind: ["payment", "certificate"],
      renewal_status: ["pending", "approved", "rejected"],
      user_role: ["member", "admin", "ajk", "user"],
      user_status: ["pending", "active", "inactive", "rejected"],
    },
  },
} as const
