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
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          slug?: string | null
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
            referencedRelation: "portals"
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
            referencedRelation: "portals"
            referencedColumns: ["id"]
          },
        ]
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
      default_portal_id: { Args: never; Returns: string }
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
      is_super_admin: { Args: { _uid: string }; Returns: boolean }
      user_portal_ids: { Args: { _uid: string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "cliente" | "prestador" | "empresa" | "parceiro"
      portal_role:
        | "super_admin"
        | "portal_admin"
        | "operator"
        | "commercial"
        | "client"
        | "provider"
        | "partner"
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
      app_role: ["admin", "cliente", "prestador", "empresa", "parceiro"],
      portal_role: [
        "super_admin",
        "portal_admin",
        "operator",
        "commercial",
        "client",
        "provider",
        "partner",
      ],
    },
  },
} as const
