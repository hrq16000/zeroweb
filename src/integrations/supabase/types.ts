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
          portal_id: string | null
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
          portal_id?: string | null
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
          portal_id?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "analytics_events_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_alerts: {
        Row: {
          channel: string | null
          created_at: string
          id: string
          kind: string
          message: string | null
          payload: Json
          sent_at: string | null
          severity: string
          status: string
          threshold: number | null
          value: number | null
          zscore: number | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          id?: string
          kind: string
          message?: string | null
          payload?: Json
          sent_at?: string | null
          severity?: string
          status?: string
          threshold?: number | null
          value?: number | null
          zscore?: number | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          id?: string
          kind?: string
          message?: string | null
          payload?: Json
          sent_at?: string | null
          severity?: string
          status?: string
          threshold?: number | null
          value?: number | null
          zscore?: number | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          is_critical: boolean
          is_secret: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          is_critical?: boolean
          is_secret?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          is_critical?: boolean
          is_secret?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      app_settings_history: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          key: string
          new_value: string | null
          old_value: string | null
          reason: string | null
          rolled_back_from_id: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          key: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          rolled_back_from_id?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          key?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
          rolled_back_from_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_history_rolled_back_from_id_fkey"
            columns: ["rolled_back_from_id"]
            isOneToOne: false
            referencedRelation: "app_settings_history"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          meta?: Json | null
        }
        Relationships: []
      }
      bi_snapshots: {
        Row: {
          created_at: string
          ecosystem_id: string | null
          id: string
          kpis: Json
          portal_id: string | null
          scope: string
          snapshot_date: string
        }
        Insert: {
          created_at?: string
          ecosystem_id?: string | null
          id?: string
          kpis?: Json
          portal_id?: string | null
          scope?: string
          snapshot_date?: string
        }
        Update: {
          created_at?: string
          ecosystem_id?: string | null
          id?: string
          kpis?: Json
          portal_id?: string | null
          scope?: string
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_snapshots_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_snapshots_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "bi_snapshots_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_asns: {
        Row: {
          asn: string
          category: string
          created_at: string
          enabled: boolean
          org: string
          reason: string
        }
        Insert: {
          asn: string
          category?: string
          created_at?: string
          enabled?: boolean
          org: string
          reason?: string
        }
        Update: {
          asn?: string
          category?: string
          created_at?: string
          enabled?: boolean
          org?: string
          reason?: string
        }
        Relationships: []
      }
      break_glass_grants: {
        Row: {
          expires_at: string
          granted_at: string
          id: string
          reason: string
          revealed_at: string | null
          revoked_at: string | null
          setting_key: string
          user_id: string
        }
        Insert: {
          expires_at: string
          granted_at?: string
          id?: string
          reason: string
          revealed_at?: string | null
          revoked_at?: string | null
          setting_key: string
          user_id: string
        }
        Update: {
          expires_at?: string
          granted_at?: string
          id?: string
          reason?: string
          revealed_at?: string | null
          revoked_at?: string | null
          setting_key?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget_monthly: number | null
          cpa_target: number | null
          created_at: string
          id: string
          landing_page: string | null
          name: string
          notes: string | null
          platform: string
          roas_target: number | null
          slug: string
          status: string
          updated_at: string
          utm_campaign: string | null
        }
        Insert: {
          budget_monthly?: number | null
          cpa_target?: number | null
          created_at?: string
          id?: string
          landing_page?: string | null
          name: string
          notes?: string | null
          platform?: string
          roas_target?: number | null
          slug: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Update: {
          budget_monthly?: number | null
          cpa_target?: number | null
          created_at?: string
          id?: string
          landing_page?: string | null
          name?: string
          notes?: string | null
          platform?: string
          roas_target?: number | null
          slug?: string
          status?: string
          updated_at?: string
          utm_campaign?: string | null
        }
        Relationships: []
      }
      cart_funnel_progress: {
        Row: {
          cart_snapshot: Json
          created_at: string
          id: string
          metadata: Json
          payment_channel: Database["public"]["Enums"]["cart_payment_channel"]
          payment_ref: string | null
          payment_status: Database["public"]["Enums"]["cart_payment_status"]
          session_key: string
          step: string
          total_amount: number | null
          updated_at: string
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          cart_snapshot?: Json
          created_at?: string
          id?: string
          metadata?: Json
          payment_channel?: Database["public"]["Enums"]["cart_payment_channel"]
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["cart_payment_status"]
          session_key: string
          step?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          cart_snapshot?: Json
          created_at?: string
          id?: string
          metadata?: Json
          payment_channel?: Database["public"]["Enums"]["cart_payment_channel"]
          payment_ref?: string | null
          payment_status?: Database["public"]["Enums"]["cart_payment_status"]
          session_key?: string
          step?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          active: boolean
          created_at: string
          id: string
          kind_target: Database["public"]["Enums"]["partner_kind"] | null
          notes: string | null
          partner_id: string | null
          recurrence_months: number | null
          scope_category: string | null
          scope_product: string | null
          type: Database["public"]["Enums"]["commission_type"]
          updated_at: string
          value: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          kind_target?: Database["public"]["Enums"]["partner_kind"] | null
          notes?: string | null
          partner_id?: string | null
          recurrence_months?: number | null
          scope_category?: string | null
          scope_product?: string | null
          type: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          value: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          kind_target?: Database["public"]["Enums"]["partner_kind"] | null
          notes?: string | null
          partner_id?: string | null
          recurrence_months?: number | null
          scope_category?: string | null
          scope_product?: string | null
          type?: Database["public"]["Enums"]["commission_type"]
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "commission_rules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          categories: string[]
          city: string | null
          cnpj: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          phone: string | null
          rating_avg: number
          rating_count: number
          service_regions: string[]
          slug: string
          social: Json
          state: string | null
          status: string
          trade_name: string
          updated_at: string
          user_id: string | null
          verified: boolean
          views_count: number
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          categories?: string[]
          city?: string | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          service_regions?: string[]
          slug: string
          social?: Json
          state?: string | null
          status?: string
          trade_name: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          views_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          categories?: string[]
          city?: string | null
          cnpj?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          service_regions?: string[]
          slug?: string
          social?: Json
          state?: string | null
          status?: string
          trade_name?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          views_count?: number
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      company_categories: {
        Row: {
          category_id: string
          company_id: string
        }
        Insert: {
          category_id: string
          company_id: string
        }
        Update: {
          category_id?: string
          company_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_audit_log: {
        Row: {
          ad_storage: string | null
          analytics_storage: string | null
          created_at: string
          decision: string
          id: string
          ip_hash: string | null
          meta: Json
          path: string | null
          source: string
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          ad_storage?: string | null
          analytics_storage?: string | null
          created_at?: string
          decision: string
          id?: string
          ip_hash?: string | null
          meta?: Json
          path?: string | null
          source?: string
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          ad_storage?: string | null
          analytics_storage?: string | null
          created_at?: string
          decision?: string
          id?: string
          ip_hash?: string | null
          meta?: Json
          path?: string | null
          source?: string
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      content_metrics: {
        Row: {
          clicks: number | null
          cluster_slug: string
          conversions: number | null
          ctr: number | null
          id: string
          impressions: number | null
          position: number | null
          recorded_at: string
          url: string
        }
        Insert: {
          clicks?: number | null
          cluster_slug: string
          conversions?: number | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          position?: number | null
          recorded_at?: string
          url: string
        }
        Update: {
          clicks?: number | null
          cluster_slug?: string
          conversions?: number | null
          ctr?: number | null
          id?: string
          impressions?: number | null
          position?: number | null
          recorded_at?: string
          url?: string
        }
        Relationships: []
      }
      content_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_global: boolean
          kind: Database["public"]["Enums"]["template_kind"]
          name: string
          payload: Json
          portal_id: string | null
          preview_url: string | null
          slug: string
          status: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean
          kind: Database["public"]["Enums"]["template_kind"]
          name: string
          payload?: Json
          portal_id?: string | null
          preview_url?: string | null
          slug: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_global?: boolean
          kind?: Database["public"]["Enums"]["template_kind"]
          name?: string
          payload?: Json
          portal_id?: string | null
          preview_url?: string | null
          slug?: string
          status?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_templates_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "content_templates_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
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
      cross_sell_opportunities: {
        Row: {
          created_at: string
          ecosystem_id: string | null
          from_portal_id: string | null
          id: string
          identity_id: string | null
          metadata: Json
          offer_slug: string | null
          offer_title: string | null
          reason: string | null
          score: number
          status: string
          to_portal_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ecosystem_id?: string | null
          from_portal_id?: string | null
          id?: string
          identity_id?: string | null
          metadata?: Json
          offer_slug?: string | null
          offer_title?: string | null
          reason?: string | null
          score?: number
          status?: string
          to_portal_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ecosystem_id?: string | null
          from_portal_id?: string | null
          id?: string
          identity_id?: string | null
          metadata?: Json
          offer_slug?: string | null
          offer_title?: string | null
          reason?: string | null
          score?: number
          status?: string
          to_portal_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_sell_opportunities_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_sell_opportunities_from_portal_id_fkey"
            columns: ["from_portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "cross_sell_opportunities_from_portal_id_fkey"
            columns: ["from_portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_sell_opportunities_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "customer_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_sell_opportunities_to_portal_id_fkey"
            columns: ["to_portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "cross_sell_opportunities_to_portal_id_fkey"
            columns: ["to_portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_identities: {
        Row: {
          created_at: string
          document: string | null
          ecosystem_id: string | null
          first_seen_at: string
          full_name: string | null
          id: string
          last_seen_at: string
          metadata: Json
          primary_email: string | null
          primary_phone: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          ecosystem_id?: string | null
          first_seen_at?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          primary_email?: string | null
          primary_phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          ecosystem_id?: string | null
          first_seen_at?: string
          full_name?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json
          primary_email?: string | null
          primary_phone?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_identities_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_identity_links: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          identity_id: string
          link_source: string | null
          portal_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          identity_id: string
          link_source?: string | null
          portal_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          identity_id?: string
          link_source?: string | null
          portal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_identity_links_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "customer_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_identity_links_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "customer_identity_links_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_touchpoints: {
        Row: {
          created_at: string
          description: string | null
          ecosystem_id: string | null
          id: string
          identity_id: string
          kind: string
          occurred_at: string
          payload: Json
          portal_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          ecosystem_id?: string | null
          id?: string
          identity_id: string
          kind: string
          occurred_at?: string
          payload?: Json
          portal_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          ecosystem_id?: string | null
          id?: string
          identity_id?: string
          kind?: string
          occurred_at?: string
          payload?: Json
          portal_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_touchpoints_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_touchpoints_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "customer_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_touchpoints_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "customer_touchpoints_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      dw_events: {
        Row: {
          created_at: string
          ecosystem_id: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          identity_id: string | null
          numeric_value: number | null
          occurred_at: string
          payload: Json
          portal_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          ecosystem_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          identity_id?: string | null
          numeric_value?: number | null
          occurred_at?: string
          payload?: Json
          portal_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          ecosystem_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          identity_id?: string | null
          numeric_value?: number | null
          occurred_at?: string
          payload?: Json
          portal_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dw_events_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dw_events_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "customer_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dw_events_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "dw_events_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_form_conditions: {
        Row: {
          action: string
          created_at: string
          form_id: string
          from_question_id: string
          id: string
          operator: string
          priority: number
          target_question_id: string | null
          value: Json
        }
        Insert: {
          action: string
          created_at?: string
          form_id: string
          from_question_id: string
          id?: string
          operator: string
          priority?: number
          target_question_id?: string | null
          value?: Json
        }
        Update: {
          action?: string
          created_at?: string
          form_id?: string
          from_question_id?: string
          id?: string
          operator?: string
          priority?: number
          target_question_id?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_form_conditions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_form_conditions_from_question_id_fkey"
            columns: ["from_question_id"]
            isOneToOne: false
            referencedRelation: "dynamic_form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_form_conditions_target_question_id_fkey"
            columns: ["target_question_id"]
            isOneToOne: false
            referencedRelation: "dynamic_form_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_form_leads: {
        Row: {
          answers_json: Json
          assigned_to: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          form_id: string
          id: string
          intent_level: string
          metadata_json: Json
          pipeline_stage: string
          score: number
          score_breakdown: Json
          tags: string[]
          whatsapp_alert_error: string | null
          whatsapp_alert_sent_at: string | null
          whatsapp_alert_status: string | null
          whatsapp_user_url: string | null
        }
        Insert: {
          answers_json?: Json
          assigned_to?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          form_id: string
          id?: string
          intent_level?: string
          metadata_json?: Json
          pipeline_stage?: string
          score?: number
          score_breakdown?: Json
          tags?: string[]
          whatsapp_alert_error?: string | null
          whatsapp_alert_sent_at?: string | null
          whatsapp_alert_status?: string | null
          whatsapp_user_url?: string | null
        }
        Update: {
          answers_json?: Json
          assigned_to?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          form_id?: string
          id?: string
          intent_level?: string
          metadata_json?: Json
          pipeline_stage?: string
          score?: number
          score_breakdown?: Json
          tags?: string[]
          whatsapp_alert_error?: string | null
          whatsapp_alert_sent_at?: string | null
          whatsapp_alert_status?: string | null
          whatsapp_user_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_form_leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_form_questions: {
        Row: {
          created_at: string
          form_id: string
          hint: string | null
          id: string
          key: string
          label: string
          options_json: Json
          order_index: number
          placeholder: string | null
          required: boolean
          step_id: string | null
          type: string
          updated_at: string
          validation_json: Json
        }
        Insert: {
          created_at?: string
          form_id: string
          hint?: string | null
          id?: string
          key: string
          label: string
          options_json?: Json
          order_index?: number
          placeholder?: string | null
          required?: boolean
          step_id?: string | null
          type: string
          updated_at?: string
          validation_json?: Json
        }
        Update: {
          created_at?: string
          form_id?: string
          hint?: string | null
          id?: string
          key?: string
          label?: string
          options_json?: Json
          order_index?: number
          placeholder?: string | null
          required?: boolean
          step_id?: string | null
          type?: string
          updated_at?: string
          validation_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_form_questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dynamic_form_questions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "dynamic_form_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_form_steps: {
        Row: {
          created_at: string
          cta_label: string | null
          form_id: string
          id: string
          order_index: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          form_id: string
          id?: string
          order_index?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          form_id?: string
          id?: string
          order_index?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_form_steps_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_form_versions: {
        Row: {
          form_id: string
          id: string
          notes: string | null
          published_at: string
          published_by: string | null
          snapshot: Json
          version_number: number
        }
        Insert: {
          form_id: string
          id?: string
          notes?: string | null
          published_at?: string
          published_by?: string | null
          snapshot: Json
          version_number: number
        }
        Update: {
          form_id?: string
          id?: string
          notes?: string | null
          published_at?: string
          published_by?: string | null
          snapshot?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_form_versions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_forms: {
        Row: {
          config_json: Json
          created_at: string
          created_by: string | null
          current_version: number
          description: string | null
          id: string
          name: string
          published_version_id: string | null
          slug: string
          status: string
          updated_at: string
          whatsapp_config: Json
        }
        Insert: {
          config_json?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          name: string
          published_version_id?: string | null
          slug: string
          status?: string
          updated_at?: string
          whatsapp_config?: Json
        }
        Update: {
          config_json?: Json
          created_at?: string
          created_by?: string | null
          current_version?: number
          description?: string | null
          id?: string
          name?: string
          published_version_id?: string | null
          slug?: string
          status?: string
          updated_at?: string
          whatsapp_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_forms_published_version_id_fkey"
            columns: ["published_version_id"]
            isOneToOne: false
            referencedRelation: "dynamic_form_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_portals: {
        Row: {
          created_at: string
          ecosystem_id: string
          id: string
          portal_id: string
          role: string
        }
        Insert: {
          created_at?: string
          ecosystem_id: string
          id?: string
          portal_id: string
          role?: string
        }
        Update: {
          created_at?: string
          ecosystem_id?: string
          id?: string
          portal_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_portals_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_portals_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "ecosystem_portals_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystems: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          settings: Json
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          settings?: Json
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          settings?: Json
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      editorial_calendar: {
        Row: {
          cluster_slug: string
          commercial_value: number
          created_at: string
          funnel: string
          id: string
          intent: string
          notes: string | null
          priority: number
          published_url: string | null
          scheduled_for: string | null
          slug: string
          status: string
          template: string
          title: string
          updated_at: string
        }
        Insert: {
          cluster_slug: string
          commercial_value?: number
          created_at?: string
          funnel: string
          id?: string
          intent: string
          notes?: string | null
          priority?: number
          published_url?: string | null
          scheduled_for?: string | null
          slug: string
          status?: string
          template: string
          title: string
          updated_at?: string
        }
        Update: {
          cluster_slug?: string
          commercial_value?: number
          created_at?: string
          funnel?: string
          id?: string
          intent?: string
          notes?: string | null
          priority?: number
          published_url?: string | null
          scheduled_for?: string | null
          slug?: string
          status?: string
          template?: string
          title?: string
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
          portal_id: string | null
          updated_at: string
          variant: string
        }
        Insert: {
          clicks?: number
          conversions?: number
          experiment_name: string
          id?: string
          impressions?: number
          portal_id?: string | null
          updated_at?: string
          variant: string
        }
        Update: {
          clicks?: number
          conversions?: number
          experiment_name?: string
          id?: string
          impressions?: number
          portal_id?: string | null
          updated_at?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "experiments_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_consent_log: {
        Row: {
          created_at: string
          decision: string
          id: string
          page: string | null
          session_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          page?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          page?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          badge: string | null
          bg_gradient: string | null
          created_at: string
          cta_href: string | null
          cta_label: string | null
          cta_secondary_href: string | null
          cta_secondary_label: string | null
          eyebrow: string | null
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean
          page: string
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          bg_gradient?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          eyebrow?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          page?: string
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          bg_gradient?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          cta_secondary_href?: string | null
          cta_secondary_label?: string | null
          eyebrow?: string | null
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          page?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      identity_stitch_log: {
        Row: {
          actor: string | null
          created_at: string
          error_message: string | null
          id: string
          source: string | null
          status: string
          stitched_count: number
          user_id: string | null
          user_ref: string | null
          visitor_id: string | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source?: string | null
          status?: string
          stitched_count?: number
          user_id?: string | null
          user_ref?: string | null
          visitor_id?: string | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          source?: string | null
          status?: string
          stitched_count?: number
          user_id?: string | null
          user_ref?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      index_coverage_actions: {
        Row: {
          action_key: string
          actor: string | null
          created_at: string
          id: string
          issue_id: string
          notes: string | null
        }
        Insert: {
          action_key: string
          actor?: string | null
          created_at?: string
          id?: string
          issue_id: string
          notes?: string | null
        }
        Update: {
          action_key?: string
          actor?: string | null
          created_at?: string
          id?: string
          issue_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "index_coverage_actions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "index_coverage_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      index_coverage_issues: {
        Row: {
          created_at: string
          detected_at: string
          id: string
          issue_type: string
          message: string | null
          metadata: Json | null
          resolved_at: string | null
          source: string
          status_code: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          id?: string
          issue_type: string
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          source?: string
          status_code?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          id?: string
          issue_type?: string
          message?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          source?: string
          status_code?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      index_coverage_snapshots: {
        Row: {
          count: number
          created_at: string
          day: string
          id: string
          issue_type: string
          open_count: number
        }
        Insert: {
          count?: number
          created_at?: string
          day: string
          id?: string
          issue_type: string
          open_count?: number
        }
        Update: {
          count?: number
          created_at?: string
          day?: string
          id?: string
          issue_type?: string
          open_count?: number
        }
        Relationships: []
      }
      integration_health_checks: {
        Row: {
          checked_at: string
          id: string
          key: string
          latency_ms: number | null
          message: string | null
          source: string
          status: string
        }
        Insert: {
          checked_at?: string
          id?: string
          key: string
          latency_ms?: number | null
          message?: string | null
          source?: string
          status: string
        }
        Update: {
          checked_at?: string
          id?: string
          key?: string
          latency_ms?: number | null
          message?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      integration_schemas: {
        Row: {
          description: string | null
          enabled: boolean
          fields: Json
          key: string
          label: string
          sort_order: number
          testable: boolean
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          fields?: Json
          key: string
          label: string
          sort_order?: number
          testable?: boolean
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          fields?: Json
          key?: string
          label?: string
          sort_order?: number
          testable?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      integration_status: {
        Row: {
          key: string
          last_alert_at: string | null
          last_message: string | null
          last_status: string
          last_tested_at: string | null
          last_tested_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          last_alert_at?: string | null
          last_message?: string | null
          last_status?: string
          last_tested_at?: string | null
          last_tested_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          last_alert_at?: string | null
          last_message?: string | null
          last_status?: string
          last_tested_at?: string | null
          last_tested_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ip_blocklist: {
        Row: {
          asn: string | null
          block_reason: string
          country: string | null
          expires_at: string
          first_seen_at: string
          hits: number
          ip_hash: string
          risk_score: number
        }
        Insert: {
          asn?: string | null
          block_reason: string
          country?: string | null
          expires_at?: string
          first_seen_at?: string
          hits?: number
          ip_hash: string
          risk_score?: number
        }
        Update: {
          asn?: string | null
          block_reason?: string
          country?: string | null
          expires_at?: string
          first_seen_at?: string
          hits?: number
          ip_hash?: string
          risk_score?: number
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
      lead_pipeline_rules: {
        Row: {
          action: Json
          created_at: string
          created_by: string | null
          enabled: boolean
          form_id: string | null
          id: string
          name: string
          priority: number
          trigger: Json
          updated_at: string
        }
        Insert: {
          action?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          form_id?: string | null
          id?: string
          name: string
          priority?: number
          trigger?: Json
          updated_at?: string
        }
        Update: {
          action?: Json
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          form_id?: string | null
          id?: string
          name?: string
          priority?: number
          trigger?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_pipeline_rules_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "dynamic_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_log: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          payload: Json
          reason: string | null
          rule_id: string | null
          score: number | null
          target_id: string | null
          target_kind: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          payload?: Json
          reason?: string | null
          rule_id?: string | null
          score?: number | null
          target_id?: string | null
          target_kind?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          payload?: Json
          reason?: string | null
          rule_id?: string | null
          score?: number | null
          target_id?: string | null
          target_kind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_routing_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "lead_routing_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_routing_rules: {
        Row: {
          created_at: string
          ecosystem_id: string | null
          enabled: boolean
          id: string
          match_category: string | null
          match_city: string | null
          match_source: string | null
          match_specialty: string | null
          match_state: string | null
          name: string
          notes: string | null
          portal_id: string | null
          priority: number
          strategy: string
          target_id: string | null
          target_kind: string
          target_pool: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          ecosystem_id?: string | null
          enabled?: boolean
          id?: string
          match_category?: string | null
          match_city?: string | null
          match_source?: string | null
          match_specialty?: string | null
          match_state?: string | null
          name: string
          notes?: string | null
          portal_id?: string | null
          priority?: number
          strategy?: string
          target_id?: string | null
          target_kind: string
          target_pool?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          ecosystem_id?: string | null
          enabled?: boolean
          id?: string
          match_category?: string | null
          match_city?: string | null
          match_source?: string | null
          match_specialty?: string | null
          match_state?: string | null
          name?: string
          notes?: string | null
          portal_id?: string | null
          priority?: number
          strategy?: string
          target_id?: string | null
          target_kind?: string
          target_pool?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_routing_rules_ecosystem_id_fkey"
            columns: ["ecosystem_id"]
            isOneToOne: false
            referencedRelation: "ecosystems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_routing_rules_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "lead_routing_rules_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_stage_history: {
        Row: {
          actor: string | null
          created_at: string
          from_stage: string | null
          id: string
          lead_id: string
          reason: string | null
          to_stage: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          from_stage?: string | null
          id?: string
          lead_id: string
          reason?: string | null
          to_stage: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          from_stage?: string | null
          id?: string
          lead_id?: string
          reason?: string | null
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_stage_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "dynamic_form_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_submissions: {
        Row: {
          assignee: string | null
          audience_tag: string | null
          company: string | null
          created_at: string
          cta_variant: string | null
          email: string | null
          fbclid: string | null
          gclid: string | null
          hero_variant: string | null
          id: string
          landing_page: string | null
          last_interaction: string | null
          name: string | null
          notes: string | null
          offer_slug: string | null
          payload_json: Json | null
          phone: string | null
          portal_id: string | null
          referrer: string | null
          score: number
          score_label: string
          source: string | null
          status: string
          temperature: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          assignee?: string | null
          audience_tag?: string | null
          company?: string | null
          created_at?: string
          cta_variant?: string | null
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          last_interaction?: string | null
          name?: string | null
          notes?: string | null
          offer_slug?: string | null
          payload_json?: Json | null
          phone?: string | null
          portal_id?: string | null
          referrer?: string | null
          score?: number
          score_label?: string
          source?: string | null
          status?: string
          temperature?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          assignee?: string | null
          audience_tag?: string | null
          company?: string | null
          created_at?: string
          cta_variant?: string | null
          email?: string | null
          fbclid?: string | null
          gclid?: string | null
          hero_variant?: string | null
          id?: string
          landing_page?: string | null
          last_interaction?: string | null
          name?: string | null
          notes?: string | null
          offer_slug?: string | null
          payload_json?: Json | null
          phone?: string | null
          portal_id?: string | null
          referrer?: string | null
          score?: number
          score_label?: string
          source?: string | null
          status?: string
          temperature?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_submissions_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "lead_submissions_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      lhci_runs: {
        Row: {
          accessibility: number | null
          best_practices: number | null
          branch: string | null
          cls: number | null
          commit_sha: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: string | null
          decision_reason: string | null
          environment: string
          fcp_ms: number | null
          id: string
          lcp_ms: number | null
          logs: Json | null
          performance: number | null
          raw: Json | null
          seo: number | null
          status: string
          tbt_ms: number | null
          url: string
        }
        Insert: {
          accessibility?: number | null
          best_practices?: number | null
          branch?: string | null
          cls?: number | null
          commit_sha?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          decision_reason?: string | null
          environment?: string
          fcp_ms?: number | null
          id?: string
          lcp_ms?: number | null
          logs?: Json | null
          performance?: number | null
          raw?: Json | null
          seo?: number | null
          status?: string
          tbt_ms?: number | null
          url: string
        }
        Update: {
          accessibility?: number | null
          best_practices?: number | null
          branch?: string | null
          cls?: number | null
          commit_sha?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string | null
          decision_reason?: string | null
          environment?: string
          fcp_ms?: number | null
          id?: string
          lcp_ms?: number | null
          logs?: Json | null
          performance?: number | null
          raw?: Json | null
          seo?: number | null
          status?: string
          tbt_ms?: number | null
          url?: string
        }
        Relationships: []
      }
      license_audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: string
          ip_hash: string | null
          license_id: string | null
          payload: Json
          portal_id: string | null
          target: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          license_id?: string | null
          payload?: Json
          portal_id?: string | null
          target?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          license_id?: string | null
          payload?: Json
          portal_id?: string | null
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "license_audit_log_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_audit_log_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_audit_log_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "license_audit_log_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      license_usage_metrics: {
        Row: {
          created_at: string
          custom: Json
          day: string
          id: string
          leads_count: number
          license_id: string
          portal_id: string
          projects_count: number
          storage_mb: number
          users_count: number
          visits_count: number
        }
        Insert: {
          created_at?: string
          custom?: Json
          day?: string
          id?: string
          leads_count?: number
          license_id: string
          portal_id: string
          projects_count?: number
          storage_mb?: number
          users_count?: number
          visits_count?: number
        }
        Update: {
          created_at?: string
          custom?: Json
          day?: string
          id?: string
          leads_count?: number
          license_id?: string
          portal_id?: string
          projects_count?: number
          storage_mb?: number
          users_count?: number
          visits_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "license_usage_metrics_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_usage_metrics_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_usage_metrics_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "license_usage_metrics_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          features: Json
          id: string
          limits: Json
          metadata: Json
          notes: string | null
          parent_license_id: string | null
          plan: string
          portal_id: string
          renews_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["license_status"]
          type: Database["public"]["Enums"]["license_type"]
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          features?: Json
          id?: string
          limits?: Json
          metadata?: Json
          notes?: string | null
          parent_license_id?: string | null
          plan?: string
          portal_id: string
          renews_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["license_status"]
          type?: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          features?: Json
          id?: string
          limits?: Json
          metadata?: Json
          notes?: string | null
          parent_license_id?: string | null
          plan?: string
          portal_id?: string
          renews_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["license_status"]
          type?: Database["public"]["Enums"]["license_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_parent_license_id_fkey"
            columns: ["parent_license_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_parent_license_id_fkey"
            columns: ["parent_license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "licenses_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_settings: {
        Row: {
          auto_distribute_limit: number
          distribution_mode: string
          rr_pointer: number
          singleton: boolean
          updated_at: string
        }
        Insert: {
          auto_distribute_limit?: number
          distribution_mode?: string
          rr_pointer?: number
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          auto_distribute_limit?: number
          distribution_mode?: string
          rr_pointer?: number
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      mk_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "mk_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mk_specialties: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "mk_specialties_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          reason: string | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          active: boolean
          created_at: string
          cta: string
          description: string | null
          id: string
          landing_page: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta?: string
          description?: string | null
          id?: string
          landing_page?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta?: string
          description?: string | null
          id?: string
          landing_page?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          items: Json
          metadata: Json
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: string
          total: number
          updated_at: string
          user_id: string
          whatsapp_handoff_at: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          metadata?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id: string
          whatsapp_handoff_at?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          items?: Json
          metadata?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
          whatsapp_handoff_at?: string | null
        }
        Relationships: []
      }
      partner_attributions: {
        Row: {
          campaign: string | null
          conversion_type: string
          created_at: string
          id: string
          landing_path: string | null
          lead_id: string | null
          link_id: string | null
          notes: string | null
          partner_id: string
          status: string
          value_cents: number
        }
        Insert: {
          campaign?: string | null
          conversion_type?: string
          created_at?: string
          id?: string
          landing_path?: string | null
          lead_id?: string | null
          link_id?: string | null
          notes?: string | null
          partner_id: string
          status?: string
          value_cents?: number
        }
        Update: {
          campaign?: string | null
          conversion_type?: string
          created_at?: string
          id?: string
          landing_path?: string | null
          lead_id?: string | null
          link_id?: string | null
          notes?: string | null
          partner_id?: string
          status?: string
          value_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_attributions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "partner_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_attributions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_attributions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: string
          partner_id: string | null
          payload: Json | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: string
          partner_id?: string | null
          payload?: Json | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: string
          partner_id?: string | null
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_audit_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_audit_log_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_clicks: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_hash: string | null
          link_id: string
          partner_id: string
          referer: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          link_id: string
          partner_id: string
          referer?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_hash?: string | null
          link_id?: string
          partner_id?: string
          referer?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "partner_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_clicks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_clicks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_commissions: {
        Row: {
          attribution_id: string | null
          base_amount_cents: number
          commission_amount_cents: number
          commission_type: string
          created_at: string
          id: string
          notes: string | null
          partner_id: string
          period: string | null
          rule_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attribution_id?: string | null
          base_amount_cents?: number
          commission_amount_cents?: number
          commission_type: string
          created_at?: string
          id?: string
          notes?: string | null
          partner_id: string
          period?: string | null
          rule_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attribution_id?: string | null
          base_amount_cents?: number
          commission_amount_cents?: number
          commission_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          partner_id?: string
          period?: string | null
          rule_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_attribution_id_fkey"
            columns: ["attribution_id"]
            isOneToOne: true
            referencedRelation: "partner_attributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_links: {
        Row: {
          active: boolean
          campaign: string | null
          code: string
          created_at: string
          id: string
          label: string | null
          partner_id: string
          target_path: string
        }
        Insert: {
          active?: boolean
          campaign?: string | null
          code: string
          created_at?: string
          id?: string
          label?: string | null
          partner_id: string
          target_path?: string
        }
        Update: {
          active?: boolean
          campaign?: string | null
          code?: string
          created_at?: string
          id?: string
          label?: string | null
          partner_id?: string
          target_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_links_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_links_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_materials: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["material_kind"]
          title: string
          url: string
          visible_to_kinds: Database["public"]["Enums"]["partner_kind"][]
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["material_kind"]
          title: string
          url: string
          visible_to_kinds?: Database["public"]["Enums"]["partner_kind"][]
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["material_kind"]
          title?: string
          url?: string
          visible_to_kinds?: Database["public"]["Enums"]["partner_kind"][]
        }
        Relationships: []
      }
      partner_territories: {
        Row: {
          created_at: string
          ends_at: string | null
          exclusivity: Database["public"]["Enums"]["territory_exclusivity"]
          id: string
          partner_id: string
          scope: Database["public"]["Enums"]["territory_scope"]
          starts_at: string | null
          value: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          exclusivity?: Database["public"]["Enums"]["territory_exclusivity"]
          id?: string
          partner_id: string
          scope: Database["public"]["Enums"]["territory_scope"]
          starts_at?: string | null
          value: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          exclusivity?: Database["public"]["Enums"]["territory_exclusivity"]
          id?: string
          partner_id?: string
          scope?: Database["public"]["Enums"]["territory_scope"]
          starts_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_territories_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partner_ranking_30d"
            referencedColumns: ["partner_id"]
          },
          {
            foreignKeyName: "partner_territories_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          areas: string[]
          bio: string | null
          city: string | null
          company: string | null
          created_at: string
          email: string
          email_lower: string | null
          id: string
          kind: Database["public"]["Enums"]["partner_kind"]
          name: string
          notes: string | null
          phone: string | null
          specialties: string[]
          state: string | null
          status: Database["public"]["Enums"]["partner_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          areas?: string[]
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email: string
          email_lower?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["partner_kind"]
          name: string
          notes?: string | null
          phone?: string | null
          specialties?: string[]
          state?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          areas?: string[]
          bio?: string | null
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string
          email_lower?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["partner_kind"]
          name?: string
          notes?: string | null
          phone?: string | null
          specialties?: string[]
          state?: string | null
          status?: Database["public"]["Enums"]["partner_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          cta_href: string
          cta_label: string
          description: string | null
          features: Json
          highlight: boolean
          id: string
          name: string
          period: Database["public"]["Enums"]["plan_period"]
          price_cents: number | null
          price_label: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_href?: string
          cta_label?: string
          description?: string | null
          features?: Json
          highlight?: boolean
          id?: string
          name: string
          period?: Database["public"]["Enums"]["plan_period"]
          price_cents?: number | null
          price_label?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_href?: string
          cta_label?: string
          description?: string | null
          features?: Json
          highlight?: boolean
          id?: string
          name?: string
          period?: Database["public"]["Enums"]["plan_period"]
          price_cents?: number | null
          price_label?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      portal_companies: {
        Row: {
          company_id: string
          created_at: string
          featured: boolean
          portal_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          featured?: boolean
          portal_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          featured?: boolean
          portal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_companies_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "portal_companies_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_members: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          portal_id: string
          role: Database["public"]["Enums"]["portal_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          portal_id: string
          role?: Database["public"]["Enums"]["portal_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          portal_id?: string
          role?: Database["public"]["Enums"]["portal_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_members_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "portal_members_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_providers: {
        Row: {
          created_at: string
          featured: boolean
          portal_id: string
          provider_id: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          portal_id: string
          provider_id: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          portal_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_providers_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "portal_providers_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_services: {
        Row: {
          custom_name: string | null
          custom_payload: Json
          custom_price: number | null
          enabled: boolean
          portal_id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          custom_name?: string | null
          custom_payload?: Json
          custom_price?: number | null
          enabled?: boolean
          portal_id: string
          service_id: string
          updated_at?: string
        }
        Update: {
          custom_name?: string | null
          custom_payload?: Json
          custom_price?: number | null
          enabled?: boolean
          portal_id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_services_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "portal_services_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      portals: {
        Row: {
          accent_color: string | null
          aliases: string[]
          brand: Json
          contact: Json
          created_at: string
          domain: string | null
          id: string
          is_default: boolean
          logo_url: string | null
          name: string
          primary_color: string | null
          seo: Json
          settings: Json
          slug: string
          social: Json
          status: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          aliases?: string[]
          brand?: Json
          contact?: Json
          created_at?: string
          domain?: string | null
          id?: string
          is_default?: boolean
          logo_url?: string | null
          name: string
          primary_color?: string | null
          seo?: Json
          settings?: Json
          slug: string
          social?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          aliases?: string[]
          brand?: Json
          contact?: Json
          created_at?: string
          domain?: string | null
          id?: string
          is_default?: boolean
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          seo?: Json
          settings?: Json
          slug?: string
          social?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          slug: string | null
          twofa_enabled: boolean
          twofa_enabled_at: string | null
          updated_at: string
          user_ref: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          slug?: string | null
          twofa_enabled?: boolean
          twofa_enabled_at?: string | null
          updated_at?: string
          user_ref?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          slug?: string | null
          twofa_enabled?: boolean
          twofa_enabled_at?: string | null
          updated_at?: string
          user_ref?: string | null
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          created_at: string
          created_by: string | null
          file_path: string | null
          id: string
          kind: string
          mime_type: string | null
          project_id: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          project_id: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          project_id?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string
          created_at: string
          deliverables: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          notes: string | null
          owner: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          deliverables?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          owner?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          deliverables?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_categories: {
        Row: {
          category_id: string
          provider_id: string
        }
        Insert: {
          category_id: string
          provider_id: string
        }
        Update: {
          category_id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "mk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_portfolio: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          link: string | null
          provider_id: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          provider_id: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          provider_id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_portfolio_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          display_name: string
          email: string | null
          headline: string | null
          id: string
          phone: string | null
          rating_avg: number
          rating_count: number
          service_regions: string[]
          slug: string
          social: Json
          specialties: string[]
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          verified: boolean
          views_count: number
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          headline?: string | null
          id?: string
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          service_regions?: string[]
          slug: string
          social?: Json
          specialties?: string[]
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          views_count?: number
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          headline?: string | null
          id?: string
          phone?: string | null
          rating_avg?: number
          rating_count?: number
          service_regions?: string[]
          slug?: string
          social?: Json
          specialties?: string[]
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          views_count?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      rate_limit_buckets: {
        Row: {
          created_at: string
          id: number
          ip_hash: string
          scope: string
        }
        Insert: {
          created_at?: string
          id?: number
          ip_hash: string
          scope: string
        }
        Update: {
          created_at?: string
          id?: number
          ip_hash?: string
          scope?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          created_at: string
          enabled: boolean
          from_path: string
          hits: number
          id: string
          last_hit_at: string | null
          notes: string | null
          status_code: number
          to_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          from_path: string
          hits?: number
          id?: string
          last_hit_at?: string | null
          notes?: string | null
          status_code?: number
          to_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          from_path?: string
          hits?: number
          id?: string
          last_hit_at?: string | null
          notes?: string | null
          status_code?: number
          to_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      remarketing_audiences: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          rule: Json
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          rule?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          rule?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      request_distributions: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          request_id: string
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          request_id: string
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          request_id?: string
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_distributions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_email: string | null
          author_name: string | null
          author_user_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          author_email?: string | null
          author_name?: string | null
          author_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          author_email?: string | null
          author_name?: string | null
          author_user_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      route_404_log: {
        Row: {
          first_seen: string
          hits: number
          id: string
          last_seen: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          first_seen?: string
          hits?: number
          id?: string
          last_seen?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          first_seen?: string
          hits?: number
          id?: string
          last_seen?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      seo_audit_history: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          delta_pct: number | null
          details: Json
          id: string
          kind: Database["public"]["Enums"]["seo_audit_kind"]
          notes: string | null
          ran_at: string
          status: Database["public"]["Enums"]["seo_audit_status"]
          summary: Json
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delta_pct?: number | null
          details?: Json
          id?: string
          kind: Database["public"]["Enums"]["seo_audit_kind"]
          notes?: string | null
          ran_at?: string
          status?: Database["public"]["Enums"]["seo_audit_status"]
          summary?: Json
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          delta_pct?: number | null
          details?: Json
          id?: string
          kind?: Database["public"]["Enums"]["seo_audit_kind"]
          notes?: string | null
          ran_at?: string
          status?: Database["public"]["Enums"]["seo_audit_status"]
          summary?: Json
        }
        Relationships: []
      }
      seo_monitor_runs: {
        Row: {
          alerted: boolean
          details: Json
          id: string
          jsonld_ok: boolean
          jsonld_routes_checked: number | null
          jsonld_routes_failed: number | null
          robots_ok: boolean
          run_at: string
          sitemap_ok: boolean
          sitemap_url_count: number | null
        }
        Insert: {
          alerted?: boolean
          details?: Json
          id?: string
          jsonld_ok?: boolean
          jsonld_routes_checked?: number | null
          jsonld_routes_failed?: number | null
          robots_ok?: boolean
          run_at?: string
          sitemap_ok?: boolean
          sitemap_url_count?: number | null
        }
        Update: {
          alerted?: boolean
          details?: Json
          id?: string
          jsonld_ok?: boolean
          jsonld_routes_checked?: number | null
          jsonld_routes_failed?: number | null
          robots_ok?: boolean
          run_at?: string
          sitemap_ok?: boolean
          sitemap_url_count?: number | null
        }
        Relationships: []
      }
      service_catalog: {
        Row: {
          active: boolean
          category: string | null
          code: string
          created_at: string
          default_price: number | null
          description: string | null
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          code: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          code?: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          budget_range: string | null
          category_slug: string | null
          city: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json
          portal_id: string | null
          requester_email: string | null
          requester_name: string
          requester_phone: string | null
          requester_user_id: string | null
          state: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          category_slug?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          portal_id?: string | null
          requester_email?: string | null
          requester_name: string
          requester_phone?: string | null
          requester_user_id?: string | null
          state?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          category_slug?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          portal_id?: string | null
          requester_email?: string | null
          requester_name?: string
          requester_phone?: string | null
          requester_user_id?: string | null
          state?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "service_requests_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          benefits: Json
          category: string
          conditions: string | null
          created_at: string
          cta_label: string
          cta_target: string | null
          delivery_days: string | null
          description: string
          display_order: number
          faq: Json
          funnels: Json
          gallery: Json
          h1: string
          id: string
          image_alt: string | null
          image_path: string | null
          is_active: boolean
          is_featured: boolean
          keywords: Json
          name: string
          og_image_path: string | null
          og_type: string
          price: number | null
          price_from: number | null
          price_period: string | null
          problems: Json
          process: Json
          rich_html: string | null
          schema_jsonld: Json
          sections: Json
          seo_description: string | null
          seo_title: string | null
          service_type: string
          show_in_footer: boolean
          show_in_home_featured: boolean
          show_in_menu: boolean
          show_in_sitemap: boolean
          slug: string
          tagline: string | null
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: Json
          category: string
          conditions?: string | null
          created_at?: string
          cta_label?: string
          cta_target?: string | null
          delivery_days?: string | null
          description: string
          display_order?: number
          faq?: Json
          funnels?: Json
          gallery?: Json
          h1: string
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_active?: boolean
          is_featured?: boolean
          keywords?: Json
          name: string
          og_image_path?: string | null
          og_type?: string
          price?: number | null
          price_from?: number | null
          price_period?: string | null
          problems?: Json
          process?: Json
          rich_html?: string | null
          schema_jsonld?: Json
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          service_type: string
          show_in_footer?: boolean
          show_in_home_featured?: boolean
          show_in_menu?: boolean
          show_in_sitemap?: boolean
          slug: string
          tagline?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: Json
          category?: string
          conditions?: string | null
          created_at?: string
          cta_label?: string
          cta_target?: string | null
          delivery_days?: string | null
          description?: string
          display_order?: number
          faq?: Json
          funnels?: Json
          gallery?: Json
          h1?: string
          id?: string
          image_alt?: string | null
          image_path?: string | null
          is_active?: boolean
          is_featured?: boolean
          keywords?: Json
          name?: string
          og_image_path?: string | null
          og_type?: string
          price?: number | null
          price_from?: number | null
          price_period?: string | null
          problems?: Json
          process?: Json
          rich_html?: string | null
          schema_jsonld?: Json
          sections?: Json
          seo_description?: string | null
          seo_title?: string | null
          service_type?: string
          show_in_footer?: boolean
          show_in_home_featured?: boolean
          show_in_menu?: boolean
          show_in_sitemap?: boolean
          slug?: string
          tagline?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings_change_log: {
        Row: {
          action: string
          at: string
          id: string
          key: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          at?: string
          id?: string
          key?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          at?: string
          id?: string
          key?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          key: string
          label: string
          page: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          label: string
          page: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          label?: string
          page?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          body: string
          client_id: string
          created_at: string
          id: string
          priority: string
          project_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          client_id: string
          created_at?: string
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          priority?: string
          project_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_id: string
          author_role: string
          body: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_role?: string
          body: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitantes_rastreio: {
        Row: {
          asn: string | null
          block_reason: string | null
          blocked: boolean
          city: string | null
          country: string | null
          created_at: string
          day: string
          fbclid: string | null
          gclid: string | null
          id: string
          ip_address: unknown
          ip_hash: string
          is_bot: boolean
          landing_page: string | null
          meta: Json
          method: string | null
          path: string | null
          portal_id: string | null
          query: string | null
          referer: string | null
          region: string | null
          risk_score: number
          session_id: string | null
          tenant_slug: string | null
          ua_browser: string | null
          ua_device: string | null
          ua_os: string | null
          user_agent: string | null
          user_id: string | null
          user_ref: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          asn?: string | null
          block_reason?: string | null
          blocked?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          day?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          ip_address?: unknown
          ip_hash: string
          is_bot?: boolean
          landing_page?: string | null
          meta?: Json
          method?: string | null
          path?: string | null
          portal_id?: string | null
          query?: string | null
          referer?: string | null
          region?: string | null
          risk_score?: number
          session_id?: string | null
          tenant_slug?: string | null
          ua_browser?: string | null
          ua_device?: string | null
          ua_os?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ref?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          asn?: string | null
          block_reason?: string | null
          blocked?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          day?: string
          fbclid?: string | null
          gclid?: string | null
          id?: string
          ip_address?: unknown
          ip_hash?: string
          is_bot?: boolean
          landing_page?: string | null
          meta?: Json
          method?: string | null
          path?: string | null
          portal_id?: string | null
          query?: string | null
          referer?: string | null
          region?: string | null
          risk_score?: number
          session_id?: string | null
          tenant_slug?: string | null
          ua_browser?: string | null
          ua_device?: string | null
          ua_os?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_ref?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitantes_rastreio_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "visitantes_rastreio_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
      visitantes_rastreio_daily_agg: {
        Row: {
          blocked_count: number
          bot_count: number
          created_at: string
          day: string
          top_country: string | null
          top_utm_source: string | null
          total_visits: number
          unique_visitors: number
        }
        Insert: {
          blocked_count?: number
          bot_count?: number
          created_at?: string
          day: string
          top_country?: string | null
          top_utm_source?: string | null
          total_visits?: number
          unique_visitors?: number
        }
        Update: {
          blocked_count?: number
          bot_count?: number
          created_at?: string
          day?: string
          top_country?: string | null
          top_utm_source?: string | null
          total_visits?: number
          unique_visitors?: number
        }
        Relationships: []
      }
      visitor_events: {
        Row: {
          asn: string | null
          block_reason: string | null
          blocked: boolean
          city: string | null
          country: string | null
          created_at: string
          day: string
          fbclid: string | null
          gclid: string | null
          id: number
          ip_address: string | null
          ip_hash: string | null
          is_bot: boolean
          landing_page: string | null
          method: string | null
          path: string | null
          portal_id: string | null
          query: string | null
          referer: string | null
          risk_score: number
          session_id: string | null
          status_code: number | null
          tenant_slug: string | null
          ua_browser: string | null
          ua_device: string | null
          ua_os: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
        }
        Insert: {
          asn?: string | null
          block_reason?: string | null
          blocked?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          day?: string
          fbclid?: string | null
          gclid?: string | null
          id?: number
          ip_address?: string | null
          ip_hash?: string | null
          is_bot?: boolean
          landing_page?: string | null
          method?: string | null
          path?: string | null
          portal_id?: string | null
          query?: string | null
          referer?: string | null
          risk_score?: number
          session_id?: string | null
          status_code?: number | null
          tenant_slug?: string | null
          ua_browser?: string | null
          ua_device?: string | null
          ua_os?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Update: {
          asn?: string | null
          block_reason?: string | null
          blocked?: boolean
          city?: string | null
          country?: string | null
          created_at?: string
          day?: string
          fbclid?: string | null
          gclid?: string | null
          id?: number
          ip_address?: string | null
          ip_hash?: string | null
          is_bot?: boolean
          landing_page?: string | null
          method?: string | null
          path?: string | null
          portal_id?: string | null
          query?: string | null
          referer?: string | null
          risk_score?: number
          session_id?: string | null
          status_code?: number | null
          tenant_slug?: string | null
          ua_browser?: string | null
          ua_device?: string | null
          ua_os?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      visitor_saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          is_shared: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          is_shared?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          is_shared?: boolean
          name?: string
          updated_at?: string
          user_id?: string
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
          portal_id: string | null
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
          portal_id?: string | null
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
          portal_id?: string | null
          session_id?: string | null
          started_at?: string | null
          total_steps?: number
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wa_funnel_sessions_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "license_overview"
            referencedColumns: ["portal_id"]
          },
          {
            foreignKeyName: "wa_funnel_sessions_portal_id_fkey"
            columns: ["portal_id"]
            isOneToOne: false
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      license_overview: {
        Row: {
          code: string | null
          domain: string | null
          expires_at: string | null
          id: string | null
          leads_count: number | null
          limits: Json | null
          plan: string | null
          portal_id: string | null
          portal_name: string | null
          portal_slug: string | null
          renews_at: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["license_status"] | null
          type: Database["public"]["Enums"]["license_type"] | null
          users_count: number | null
        }
        Relationships: []
      }
      mv_block_reasons_daily: {
        Row: {
          day: string | null
          hits: number | null
          reason: string | null
        }
        Relationships: []
      }
      mv_visitors_daily: {
        Row: {
          blocked: number | null
          bots: number | null
          countries: number | null
          day: string | null
          humans: number | null
          total: number | null
          unique_visitors: number | null
        }
        Relationships: []
      }
      mv_visitors_hourly: {
        Row: {
          blocked: number | null
          bots: number | null
          hour: string | null
          humans: number | null
          total: number | null
        }
        Relationships: []
      }
      partner_ranking_30d: {
        Row: {
          clicks_30d: number | null
          conversions_30d: number | null
          kind: Database["public"]["Enums"]["partner_kind"] | null
          leads_30d: number | null
          name: string | null
          partner_id: string | null
          revenue_cents_30d: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_visitantes_rastreio_old: { Args: never; Returns: number }
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
      can_manage_settings: { Args: { _uid: string }; Returns: boolean }
      check_and_record_rate_limit: {
        Args: {
          p_ip_hash: string
          p_max_hits: number
          p_scope: string
          p_window_seconds: number
        }
        Returns: boolean
      }
      check_license_limit: {
        Args: { p_portal_id: string; p_resource: string }
        Returns: undefined
      }
      compute_lead_score: {
        Args: { p_row: Database["public"]["Tables"]["lead_submissions"]["Row"] }
        Returns: {
          label: string
          score: number
        }[]
      }
      db_required_tables_check: {
        Args: { _tables: string[] }
        Returns: {
          present: boolean
          tbl: string
        }[]
      }
      default_portal_id: { Args: never; Returns: string }
      generate_user_ref: { Args: never; Returns: string }
      has_portal_role: {
        Args: {
          _portal: string
          _role: Database["public"]["Enums"]["portal_role"]
          _uid: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_super: { Args: { _uid: string }; Returns: boolean }
      is_portal_member: {
        Args: { _portal: string; _uid: string }
        Returns: boolean
      }
      is_super_admin: { Args: { _uid: string }; Returns: boolean }
      normalize_phone: { Args: { p: string }; Returns: string }
      pgrst_reload_schema: { Args: never; Returns: undefined }
      purge_ip_blocklist: { Args: never; Returns: number }
      purge_rate_limit_buckets: { Args: never; Returns: number }
      purge_visitantes_rastreio_old: { Args: never; Returns: number }
      purge_visitor_events_old: { Args: never; Returns: number }
      refresh_visitor_mvs: { Args: never; Returns: undefined }
      resolve_or_create_identity: {
        Args: {
          p_ecosystem_id?: string
          p_email: string
          p_name: string
          p_phone: string
        }
        Returns: string
      }
      stitch_visitor_identity: {
        Args: { p_user_id: string; p_visitor_id: string }
        Returns: number
      }
      user_portal_ids: { Args: { _uid: string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "admin"
        | "cliente"
        | "prestador"
        | "empresa"
        | "parceiro"
        | "admin_integrations"
        | "dev"
      cart_payment_channel: "site" | "whatsapp" | "unknown"
      cart_payment_status:
        | "open"
        | "pending"
        | "paid"
        | "failed"
        | "cancelled"
        | "handoff"
      commission_type:
        | "fixo"
        | "percentual"
        | "recorrente"
        | "vitalicio"
        | "por_produto"
        | "por_categoria"
      license_status:
        | "active"
        | "suspended"
        | "expired"
        | "cancelled"
        | "trial"
        | "pending"
      license_type:
        | "master"
        | "franqueadora"
        | "licenciado"
        | "white_label"
        | "trial"
      material_kind:
        | "apresentacao"
        | "proposta"
        | "treinamento"
        | "material"
        | "link"
        | "download"
      partner_kind:
        | "afiliado"
        | "representante"
        | "parceiro_comercial"
        | "agencia"
        | "franqueado"
      partner_status: "pendente" | "aprovado" | "suspenso" | "bloqueado"
      plan_period: "month" | "year" | "project" | "custom"
      portal_role:
        | "super_admin"
        | "portal_admin"
        | "operator"
        | "commercial"
        | "client"
        | "provider"
        | "partner"
        | "franqueadora"
        | "gestor"
      seo_audit_kind: "seo_diff" | "legacy_links"
      seo_audit_status: "pending" | "approved" | "rejected"
      template_kind:
        | "landing_page"
        | "funnel"
        | "page"
        | "email"
        | "material"
        | "config"
      territory_exclusivity: "exclusivo" | "compartilhado"
      territory_scope: "cidade" | "regiao" | "estado" | "nacional"
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
        "cliente",
        "prestador",
        "empresa",
        "parceiro",
        "admin_integrations",
        "dev",
      ],
      cart_payment_channel: ["site", "whatsapp", "unknown"],
      cart_payment_status: [
        "open",
        "pending",
        "paid",
        "failed",
        "cancelled",
        "handoff",
      ],
      commission_type: [
        "fixo",
        "percentual",
        "recorrente",
        "vitalicio",
        "por_produto",
        "por_categoria",
      ],
      license_status: [
        "active",
        "suspended",
        "expired",
        "cancelled",
        "trial",
        "pending",
      ],
      license_type: [
        "master",
        "franqueadora",
        "licenciado",
        "white_label",
        "trial",
      ],
      material_kind: [
        "apresentacao",
        "proposta",
        "treinamento",
        "material",
        "link",
        "download",
      ],
      partner_kind: [
        "afiliado",
        "representante",
        "parceiro_comercial",
        "agencia",
        "franqueado",
      ],
      partner_status: ["pendente", "aprovado", "suspenso", "bloqueado"],
      plan_period: ["month", "year", "project", "custom"],
      portal_role: [
        "super_admin",
        "portal_admin",
        "operator",
        "commercial",
        "client",
        "provider",
        "partner",
        "franqueadora",
        "gestor",
      ],
      seo_audit_kind: ["seo_diff", "legacy_links"],
      seo_audit_status: ["pending", "approved", "rejected"],
      template_kind: [
        "landing_page",
        "funnel",
        "page",
        "email",
        "material",
        "config",
      ],
      territory_exclusivity: ["exclusivo", "compartilhado"],
      territory_scope: ["cidade", "regiao", "estado", "nacional"],
    },
  },
} as const
