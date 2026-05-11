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
      attachments: {
        Row: {
          created_at: string
          entity: string
          entity_id: string
          id: string
          kind: string
          mime: string | null
          size_bytes: number | null
          storage_key: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          kind?: string
          mime?: string | null
          size_bytes?: number | null
          storage_key: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          kind?: string
          mime?: string | null
          size_bytes?: number | null
          storage_key?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id: string
          id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string
          id?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receiving: {
        Row: {
          created_at: string
          id: string
          invoice_date: string | null
          invoice_no: string
          notes: string | null
          receive_no: string
          received_at: string
          received_by: string
          site_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_date?: string | null
          invoice_no: string
          notes?: string | null
          receive_no: string
          received_at?: string
          received_by: string
          site_id: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_date?: string | null
          invoice_no?: string
          notes?: string | null
          receive_no?: string
          received_at?: string
          received_by?: string
          site_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receiving_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receiving_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_receiving_items: {
        Row: {
          created_at: string
          expiry_date: string | null
          gr_id: string
          id: string
          item_id: string
          location_id: string
          lot_no: string | null
          notes: string | null
          qty: number
          qty_base: number
          unit_cost: number
          unit_id: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          gr_id: string
          id?: string
          item_id: string
          location_id: string
          lot_no?: string | null
          notes?: string | null
          qty: number
          qty_base: number
          unit_cost?: number
          unit_id: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          gr_id?: string
          id?: string
          item_id?: string
          location_id?: string
          lot_no?: string | null
          notes?: string | null
          qty?: number
          qty_base?: number
          unit_cost?: number
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goods_receiving_items_gr_id_fkey"
            columns: ["gr_id"]
            isOneToOne: false
            referencedRelation: "goods_receiving"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receiving_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receiving_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_receiving_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      item_units: {
        Row: {
          barcode: string | null
          created_at: string
          factor_to_base: number
          id: string
          is_default_issue: boolean
          is_default_purchase: boolean
          item_id: string
          unit_id: string
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          factor_to_base: number
          id?: string
          is_default_issue?: boolean
          is_default_purchase?: boolean
          item_id: string
          unit_id: string
        }
        Update: {
          barcode?: string | null
          created_at?: string
          factor_to_base?: number
          id?: string
          is_default_issue?: boolean
          is_default_purchase?: boolean
          item_id?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_units_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      item_vendors: {
        Row: {
          created_at: string
          item_id: string
          last_cost: number | null
          vendor_id: string
          vendor_sku: string | null
        }
        Insert: {
          created_at?: string
          item_id: string
          last_cost?: number | null
          vendor_id: string
          vendor_sku?: string | null
        }
        Update: {
          created_at?: string
          item_id?: string
          last_cost?: number | null
          vendor_id?: string
          vendor_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_vendors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          barcode: string | null
          base_unit_id: string
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_perishable: boolean
          name: string
          reorder_point: number | null
          reorder_qty: number | null
          sku: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          base_unit_id: string
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_perishable?: boolean
          name: string
          reorder_point?: number | null
          reorder_qty?: number | null
          sku: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          base_unit_id?: string
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_perishable?: boolean
          name?: string
          reorder_point?: number | null
          reorder_qty?: number | null
          sku?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_base_unit_id_fkey"
            columns: ["base_unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_site_id: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_site_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_site_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_site_fk"
            columns: ["default_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      stock_balances: {
        Row: {
          avg_cost: number
          id: string
          item_id: string
          last_movement_at: string | null
          location_id: string
          qty_on_hand: number
          qty_reserved: number
          updated_at: string
        }
        Insert: {
          avg_cost?: number
          id?: string
          item_id: string
          last_movement_at?: string | null
          location_id: string
          qty_on_hand?: number
          qty_reserved?: number
          updated_at?: string
        }
        Update: {
          avg_cost?: number
          id?: string
          item_id?: string
          last_movement_at?: string | null
          location_id?: string
          qty_on_hand?: number
          qty_reserved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_balances_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          site_id: string
          type: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          site_id: string
          type?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          site_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_locations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          factor_to_base: number
          id: string
          item_id: string
          location_id: string
          movement_no: string
          notes: string | null
          performed_at: string
          performed_by: string
          qty_after: number
          qty_base: number
          qty_before: number
          qty_input: number
          ref_id: string | null
          ref_type: string | null
          request_id: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost: number | null
          unit_id: string
        }
        Insert: {
          factor_to_base: number
          id?: string
          item_id: string
          location_id: string
          movement_no: string
          notes?: string | null
          performed_at?: string
          performed_by: string
          qty_after: number
          qty_base: number
          qty_before: number
          qty_input: number
          ref_id?: string | null
          ref_type?: string | null
          request_id?: string | null
          type: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
          unit_id: string
        }
        Update: {
          factor_to_base?: number
          id?: string
          item_id?: string
          location_id?: string
          movement_no?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string
          qty_after?: number
          qty_base?: number
          qty_before?: number
          qty_input?: number
          ref_id?: string | null
          ref_type?: string | null
          request_id?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
          unit_cost?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          code: string
          created_at: string
          id: string
          is_weight: boolean
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_weight?: boolean
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_weight?: boolean
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          site_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          site_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_site_fk"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          code: string
          contact_name: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          code: string
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      post_stock_movement: {
        Args: {
          p_cost: number
          p_factor: number
          p_item: string
          p_loc: string
          p_notes?: string
          p_qty_base: number
          p_qty_input: number
          p_ref_id: string
          p_ref_type: string
          p_request_id: string
          p_type: Database["public"]["Enums"]["movement_type"]
          p_unit: string
          p_user: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "warehouse_manager"
        | "receiver"
        | "counter"
        | "issuer"
        | "auditor"
        | "viewer"
      movement_type:
        | "RECEIVE"
        | "ISSUE"
        | "TRANSFER_OUT"
        | "TRANSFER_IN"
        | "ADJUST"
        | "COUNT_VARIANCE"
        | "RETURN"
        | "DAMAGE"
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
    Enums: {
      app_role: [
        "admin",
        "warehouse_manager",
        "receiver",
        "counter",
        "issuer",
        "auditor",
        "viewer",
      ],
      movement_type: [
        "RECEIVE",
        "ISSUE",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "ADJUST",
        "COUNT_VARIANCE",
        "RETURN",
        "DAMAGE",
      ],
    },
  },
} as const
