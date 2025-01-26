export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      canny_boards: {
        Row: {
          canny_board_id: string
          company_id: string
          created_at: string
          id: string
          last_synced_at: string
          name: string
          post_count: number
        }
        Insert: {
          canny_board_id: string
          company_id: string
          created_at?: string
          id?: string
          last_synced_at?: string
          name: string
          post_count?: number
        }
        Update: {
          canny_board_id?: string
          company_id?: string
          created_at?: string
          id?: string
          last_synced_at?: string
          name?: string
          post_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "canny_boards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      canny_posts: {
        Row: {
          author_name: string | null
          board_id: string | null
          board_name: string | null
          canny_post_id: string
          comment_count: number
          company_id: string
          created_at: string
          details: string | null
          id: string
          last_synced_at: string
          project_id: string | null
          score: number
          status: string
          title: string
          url: string | null
        }
        Insert: {
          author_name?: string | null
          board_id?: string | null
          board_name?: string | null
          canny_post_id: string
          comment_count?: number
          company_id: string
          created_at?: string
          details?: string | null
          id?: string
          last_synced_at?: string
          project_id?: string | null
          score?: number
          status: string
          title: string
          url?: string | null
        }
        Update: {
          author_name?: string | null
          board_id?: string | null
          board_name?: string | null
          canny_post_id?: string
          comment_count?: number
          company_id?: string
          created_at?: string
          details?: string | null
          id?: string
          last_synced_at?: string
          project_id?: string | null
          score?: number
          status?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canny_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canny_posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      canny_sync_logs: {
        Row: {
          company_id: string
          created_at: string
          error_message: string | null
          id: string
          records_synced: number
          status: string
        }
        Insert: {
          company_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number
          status: string
        }
        Update: {
          company_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "canny_sync_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          name: string
          onboarding_completed: boolean | null
          settings: Json | null
          slug: string
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          onboarding_completed?: boolean | null
          settings?: Json | null
          slug: string
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          onboarding_completed?: boolean | null
          settings?: Json | null
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          canny_api_key: string
          company_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          canny_api_key?: string
          company_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          canny_api_key?: string
          company_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pledge_options: {
        Row: {
          amount: number
          benefits: Json | null
          created_at: string | null
          description: string | null
          id: string
          project_id: string | null
          title: string
        }
        Insert: {
          amount: number
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title: string
        }
        Update: {
          amount?: number
          benefits?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledge_options_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pledges: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_intent_id: string | null
          payment_method_id: string | null
          pledge_option_id: string
          project_id: string
          status: Database["public"]["Enums"]["pledge_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          pledge_option_id: string
          project_id: string
          status?: Database["public"]["Enums"]["pledge_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          pledge_option_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["pledge_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pledges_pledge_option_id_fkey"
            columns: ["pledge_option_id"]
            isOneToOne: false
            referencedRelation: "pledge_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pledges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount_pledged: number | null
          company_id: string
          created_at: string | null
          description: string | null
          end_date: string
          goal: number
          header_image_url: string | null
          id: string
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          amount_pledged?: number | null
          company_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          goal: number
          header_image_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          amount_pledged?: number | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          goal?: number
          header_image_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_private_access: {
        Row: {
          access_type: string | null
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          access_type?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_private_access_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          settings?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_project: {
        Args: {
          p_user_id: string
          p_project_id: string
        }
        Returns: boolean
      }
      create_company_with_owner: {
        Args: {
          user_id: string
          company_name: string
          owner_first_name: string
          owner_last_name: string
          company_email: string
          company_website?: string
        }
        Returns: Json
      }
      generate_company_slug: {
        Args: {
          company_name: string
        }
        Returns: string
      }
      get_user_accessible_projects: {
        Args: {
          p_user_id: string
        }
        Returns: string[]
      }
      get_user_type: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      rollback_user_types: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_user_type: {
        Args: {
          user_id: string
          new_type: Database["public"]["Enums"]["user_type"]
        }
        Returns: undefined
      }
      set_user_types: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      pledge_status: "pending" | "completed" | "cancelled" | "failed"
      project_status: "published" | "draft" | "completed" | "cancelled"
      user_type: "company_member" | "public_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
