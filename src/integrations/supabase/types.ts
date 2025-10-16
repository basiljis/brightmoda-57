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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_section_visibility: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          section_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          section_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          section_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_summary: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_display_settings: {
        Row: {
          card_rounding: string
          card_spacing: string
          card_text_alignment: string
          card_vertical_spacing: string
          cards_per_row_desktop: number
          cards_per_row_mobile: number
          cards_per_row_tablet: number
          cart_button_size: string
          cart_button_type: string
          cart_position: string
          created_at: string
          favorite_icon_style: string
          favorite_position: string
          full_width_layout: boolean
          id: string
          show_hover_effects: boolean
          show_image_zoom_on_hover: boolean
          updated_at: string
        }
        Insert: {
          card_rounding?: string
          card_spacing?: string
          card_text_alignment?: string
          card_vertical_spacing?: string
          cards_per_row_desktop?: number
          cards_per_row_mobile?: number
          cards_per_row_tablet?: number
          cart_button_size?: string
          cart_button_type?: string
          cart_position?: string
          created_at?: string
          favorite_icon_style?: string
          favorite_position?: string
          full_width_layout?: boolean
          id?: string
          show_hover_effects?: boolean
          show_image_zoom_on_hover?: boolean
          updated_at?: string
        }
        Update: {
          card_rounding?: string
          card_spacing?: string
          card_text_alignment?: string
          card_vertical_spacing?: string
          cards_per_row_desktop?: number
          cards_per_row_mobile?: number
          cards_per_row_tablet?: number
          cart_button_size?: string
          cart_button_type?: string
          cart_position?: string
          created_at?: string
          favorite_icon_style?: string
          favorite_position?: string
          full_width_layout?: boolean
          id?: string
          show_hover_effects?: boolean
          show_image_zoom_on_hover?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          size_chart_image_url: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          size_chart_image_url?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          size_chart_image_url?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          show_on_homepage: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          show_on_homepage?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          show_on_homepage?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      colors: {
        Row: {
          created_at: string
          hex_code: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          hex_code: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          hex_code?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_addresses: {
        Row: {
          address_line: string
          city: string
          created_at: string
          id: string
          is_default: boolean
          phone: string
          postal_code: string | null
          recipient_name: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          phone: string
          postal_code?: string | null
          recipient_name: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          phone?: string
          postal_code?: string | null
          recipient_name?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_settings: {
        Row: {
          cdek_client_id: string | null
          cdek_client_secret: string | null
          created_at: string
          default_city_code: number | null
          default_city_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          cdek_client_id?: string | null
          cdek_client_secret?: string | null
          created_at?: string
          default_city_code?: number | null
          default_city_name?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          cdek_client_id?: string | null
          cdek_client_secret?: string | null
          created_at?: string
          default_city_code?: number | null
          default_city_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          created_at: string
          from_email: string | null
          from_name: string | null
          id: string
          is_enabled: boolean
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_enabled?: boolean
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_enabled?: boolean
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      header_collections: {
        Row: {
          autoplay_enabled: boolean | null
          autoplay_speed: string | null
          collection_id: string | null
          created_at: string
          desktop_display_mode: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          autoplay_enabled?: boolean | null
          autoplay_speed?: string | null
          collection_id?: string | null
          created_at?: string
          desktop_display_mode?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          autoplay_enabled?: boolean | null
          autoplay_speed?: string | null
          collection_id?: string | null
          created_at?: string
          desktop_display_mode?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "header_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      home_page_blocks: {
        Row: {
          block_type: string
          collection_card_style: string | null
          collection_id: string | null
          created_at: string
          display_order: number
          font_size: string | null
          id: string
          is_active: boolean
          items_count: number | null
          show_all_collections: boolean | null
          show_more_button: boolean | null
          show_more_link: string | null
          show_more_text: string | null
          text_content: string | null
          title: string | null
          title_alignment: string
          updated_at: string
        }
        Insert: {
          block_type: string
          collection_card_style?: string | null
          collection_id?: string | null
          created_at?: string
          display_order?: number
          font_size?: string | null
          id?: string
          is_active?: boolean
          items_count?: number | null
          show_all_collections?: boolean | null
          show_more_button?: boolean | null
          show_more_link?: string | null
          show_more_text?: string | null
          text_content?: string | null
          title?: string | null
          title_alignment?: string
          updated_at?: string
        }
        Update: {
          block_type?: string
          collection_card_style?: string | null
          collection_id?: string | null
          created_at?: string
          display_order?: number
          font_size?: string | null
          id?: string
          is_active?: boolean
          items_count?: number | null
          show_all_collections?: boolean | null
          show_more_button?: boolean | null
          show_more_link?: string | null
          show_more_text?: string | null
          text_content?: string | null
          title?: string | null
          title_alignment?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_page_blocks_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      lookbook_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          season: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          season?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          season?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_info: Json | null
          id: string
          items: Json
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_info?: Json | null
          id?: string
          items: Json
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_info?: Json | null
          id?: string
          items?: Json
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content_type: string
          content_value: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          menu_label: string | null
          menu_location: string | null
          page_name: string
          parent_id: string | null
          section_name: string
          updated_at: string
        }
        Insert: {
          content_type: string
          content_value: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          menu_label?: string | null
          menu_location?: string | null
          page_name: string
          parent_id?: string | null
          section_name: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          content_value?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          menu_label?: string | null
          menu_location?: string | null
          page_name?: string
          parent_id?: string | null
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_content_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "page_content"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          page_path: string
          page_title: string | null
          referrer: string | null
          region: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          region?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          region?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_color_images: {
        Row: {
          color_id: string
          created_at: string
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          color_id: string
          created_at?: string
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          color_id?: string
          created_at?: string
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_color_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_color_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          color_id: string
          id: string
          product_id: string
        }
        Insert: {
          color_id: string
          id?: string
          product_id: string
        }
        Update: {
          color_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recommendations: {
        Row: {
          created_at: string
          id: string
          product_id: string
          recommended_for_category_id: string | null
          recommended_for_product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          recommended_for_category_id?: string | null
          recommended_for_product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          recommended_for_category_id?: string | null
          recommended_for_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_recommendations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_recommended_for_category_id_fkey"
            columns: ["recommended_for_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recommendations_recommended_for_product_id_fkey"
            columns: ["recommended_for_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sizes: {
        Row: {
          id: string
          product_id: string
          size_id: string
        }
        Insert: {
          id?: string
          product_id: string
          size_id: string
        }
        Update: {
          id?: string
          product_id?: string
          size_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sizes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sizes_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          collection_id: string | null
          colors: string[] | null
          composition_care_info: string | null
          created_at: string
          delivery_return_info: string | null
          description: string | null
          dimensions: Json | null
          id: string
          images: string[] | null
          is_active: boolean
          is_featured: boolean | null
          is_new: boolean | null
          is_preorder: boolean
          name: string
          price: number
          responsibility_info: string | null
          size_fit_info: string | null
          sizes: string[] | null
          sku: string | null
          stock_quantity: number | null
          subcategory: string | null
          subcategory_id: string | null
          updated_at: string
          video_urls: string[] | null
          weight: number | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          collection_id?: string | null
          colors?: string[] | null
          composition_care_info?: string | null
          created_at?: string
          delivery_return_info?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean | null
          is_new?: boolean | null
          is_preorder?: boolean
          name: string
          price: number
          responsibility_info?: string | null
          size_fit_info?: string | null
          sizes?: string[] | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          subcategory_id?: string | null
          updated_at?: string
          video_urls?: string[] | null
          weight?: number | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          collection_id?: string | null
          colors?: string[] | null
          composition_care_info?: string | null
          created_at?: string
          delivery_return_info?: string | null
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_featured?: boolean | null
          is_new?: boolean | null
          is_preorder?: boolean
          name?: string
          price?: number
          responsibility_info?: string | null
          size_fit_info?: string | null
          sizes?: string[] | null
          sku?: string | null
          stock_quantity?: number | null
          subcategory?: string | null
          subcategory_id?: string | null
          updated_at?: string
          video_urls?: string[] | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          additional_meta_tags: Json | null
          canonical_url: string | null
          created_at: string
          custom_fonts_css: string | null
          facebook_domain_verification: string | null
          font_accent: string | null
          font_body: string | null
          font_headings: string | null
          font_weights: Json | null
          google_analytics_id: string | null
          google_search_console_verification: string | null
          google_tag_manager_id: string | null
          id: string
          is_active: boolean
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_name: string
          robots: string | null
          schema_markup: Json | null
          updated_at: string
          yandex_metrica_id: string | null
          yandex_webmaster_verification: string | null
        }
        Insert: {
          additional_meta_tags?: Json | null
          canonical_url?: string | null
          created_at?: string
          custom_fonts_css?: string | null
          facebook_domain_verification?: string | null
          font_accent?: string | null
          font_body?: string | null
          font_headings?: string | null
          font_weights?: Json | null
          google_analytics_id?: string | null
          google_search_console_verification?: string | null
          google_tag_manager_id?: string | null
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name: string
          robots?: string | null
          schema_markup?: Json | null
          updated_at?: string
          yandex_metrica_id?: string | null
          yandex_webmaster_verification?: string | null
        }
        Update: {
          additional_meta_tags?: Json | null
          canonical_url?: string | null
          created_at?: string
          custom_fonts_css?: string | null
          facebook_domain_verification?: string | null
          font_accent?: string | null
          font_body?: string | null
          font_headings?: string | null
          font_weights?: Json | null
          google_analytics_id?: string | null
          google_search_console_verification?: string | null
          google_tag_manager_id?: string | null
          id?: string
          is_active?: boolean
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_name?: string
          robots?: string | null
          schema_markup?: Json | null
          updated_at?: string
          yandex_metrica_id?: string | null
          yandex_webmaster_verification?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          copyright_text: string | null
          created_at: string
          favicon_url: string | null
          footer_description: string | null
          footer_logo_dark_url: string | null
          footer_logo_url: string | null
          id: string
          logo_dark_url: string | null
          logo_url: string | null
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          copyright_text?: string | null
          created_at?: string
          favicon_url?: string | null
          footer_description?: string | null
          footer_logo_dark_url?: string | null
          footer_logo_url?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          copyright_text?: string | null
          created_at?: string
          favicon_url?: string | null
          footer_description?: string | null
          footer_logo_dark_url?: string | null
          footer_logo_url?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_url?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      sizes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      yandex_payment_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          secret_key: string | null
          shop_id: string | null
          test_mode: boolean
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret_key?: string | null
          shop_id?: string | null
          test_mode?: boolean
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          secret_key?: string | null
          shop_id?: string | null
          test_mode?: boolean
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_analytics_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_email_subscription: {
        Args: { p_email: string; p_user_id?: string }
        Returns: string
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
