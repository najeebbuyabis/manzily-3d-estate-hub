export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          agent_id: string
          amount: number
          commission_rate: number
          created_at: string
          id: string
          payment_date: string | null
          property_id: string
          property_sale_price: number
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount: number
          commission_rate: number
          created_at?: string
          id?: string
          payment_date?: string | null
          property_id: string
          property_sale_price: number
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          payment_date?: string | null
          property_id?: string
          property_sale_price?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          credit_count: number | null
          currency: string | null
          description_ar: string | null
          description_en: string | null
          duration_days: number | null
          features_ar: string[] | null
          features_en: string[] | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name_ar: string
          name_en: string
          price: number
          sort_order: number | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_count?: number | null
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name_ar: string
          name_en: string
          price: number
          sort_order?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_count?: number | null
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          duration_days?: number | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name_ar?: string
          name_en?: string
          price?: number
          sort_order?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      developer_projects: {
        Row: {
          created_at: string
          developer_id: string
          id: string
          property_id: string
        }
        Insert: {
          created_at?: string
          developer_id: string
          id?: string
          property_id: string
        }
        Update: {
          created_at?: string
          developer_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_number: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_number: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_number?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_fee_settings: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          fee_amount: number
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          fee_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          fee_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      listing_payments: {
        Row: {
          agent_id: string
          amount: number
          created_at: string
          currency: string
          id: string
          payment_status: string
          property_id: string | null
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_status?: string
          property_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_status?: string
          property_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          mobile: string
          otp: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          mobile: string
          otp: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          mobile?: string
          otp?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          ads_purchased: number | null
          amount_paid: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: string | null
          payment_provider: string | null
          payment_status: string | null
          plan_type: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ads_purchased?: number | null
          amount_paid: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          plan_type?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ads_purchased?: number | null
          amount_paid?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          plan_type?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          agent_id: string
          bathrooms: number | null
          bedrooms: number | null
          civil_number: string | null
          contact_info: string | null
          created_at: string
          features: string[] | null
          id: string
          images: string[] | null
          listing_type: string
          location: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          price: number
          property_type: string
          size: number
          size_unit: string
          status: string
          tour_link: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          agent_id: string
          bathrooms?: number | null
          bedrooms?: number | null
          civil_number?: string | null
          contact_info?: string | null
          created_at?: string
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_type: string
          location: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          price: number
          property_type: string
          size: number
          size_unit?: string
          status?: string
          tour_link?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          agent_id?: string
          bathrooms?: number | null
          bedrooms?: number | null
          civil_number?: string | null
          contact_info?: string | null
          created_at?: string
          features?: string[] | null
          id?: string
          images?: string[] | null
          listing_type?: string
          location?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          price?: number
          property_type?: string
          size?: number
          size_unit?: string
          status?: string
          tour_link?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      property_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          property_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          property_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          property_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      property_moderation_messages: {
        Row: {
          admin_id: string
          agent_id: string
          id: string
          message: string
          message_type: string
          property_id: string
          read_at: string | null
          sent_at: string
        }
        Insert: {
          admin_id: string
          agent_id: string
          id?: string
          message: string
          message_type: string
          property_id: string
          read_at?: string | null
          sent_at?: string
        }
        Update: {
          admin_id?: string
          agent_id?: string
          id?: string
          message?: string
          message_type?: string
          property_id?: string
          read_at?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_moderation_messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_addons: {
        Row: {
          addon_type: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          price: number
          user_id: string | null
        }
        Insert: {
          addon_type: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          price: number
          user_id?: string | null
        }
        Update: {
          addon_type?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          price?: number
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          active: boolean | null
          ads_limit: number | null
          created_at: string | null
          currency: string | null
          description_ar: string | null
          description_en: string | null
          features_ar: string[] | null
          features_en: string[] | null
          id: string
          is_monthly: boolean | null
          is_unlimited: boolean | null
          name_ar: string
          name_en: string
          popular: boolean | null
          price: number
        }
        Insert: {
          active?: boolean | null
          ads_limit?: number | null
          created_at?: string | null
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id: string
          is_monthly?: boolean | null
          is_unlimited?: boolean | null
          name_ar: string
          name_en: string
          popular?: boolean | null
          price: number
        }
        Update: {
          active?: boolean | null
          ads_limit?: number | null
          created_at?: string | null
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          features_ar?: string[] | null
          features_en?: string[] | null
          id?: string
          is_monthly?: boolean | null
          is_unlimited?: boolean | null
          name_ar?: string
          name_en?: string
          popular?: boolean | null
          price?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          credit_count: number | null
          currency: string | null
          expires_on: string | null
          id: string
          package_details: Json | null
          status: string
          tap_payment_id: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          credit_count?: number | null
          currency?: string | null
          expires_on?: string | null
          id?: string
          package_details?: Json | null
          status?: string
          tap_payment_id?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          credit_count?: number | null
          currency?: string | null
          expires_on?: string | null
          id?: string
          package_details?: Json | null
          status?: string
          tap_payment_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_remaining: number | null
          id: string
          last_free_ad_date: string | null
          total_credits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_remaining?: number | null
          id?: string
          last_free_ad_date?: string | null
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_remaining?: number | null
          id?: string
          last_free_ad_date?: string | null
          total_credits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      property_event_stats: {
        Row: {
          event_count: number | null
          event_date: string | null
          event_type: string | null
          property_id: string | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_duplicate_civil_number: {
        Args: { civil_num: string; property_id?: string }
        Returns: {
          duplicate_count: number
          existing_properties: Json
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
