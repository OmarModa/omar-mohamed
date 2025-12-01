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
      profiles: {
        Row: {
          id: string
          name: string
          role: 'customer' | 'provider' | 'admin'
          contact_info: string
          region: string
          address: string | null
          verification_video_url: string | null
          specialization_id: number | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          role: 'customer' | 'provider' | 'admin'
          contact_info: string
          region: string
          address?: string | null
          verification_video_url?: string | null
          specialization_id?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'customer' | 'provider' | 'admin'
          contact_info?: string
          region?: string
          address?: string | null
          verification_video_url?: string | null
          specialization_id?: number | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          icon_name: string
          description: string | null
        }
        Insert: {
          id: number
          name: string
          icon_name: string
          description?: string | null
        }
        Update: {
          id?: number
          name?: string
          icon_name?: string
          description?: string | null
        }
      }
      service_requests: {
        Row: {
          id: number
          customer_id: string
          title: string
          description: string
          category_id: number
          region: string
          status: 'open' | 'assigned' | 'completed'
          assigned_provider_id: string | null
          accepted_bid_id: number | null
          before_image_url: string | null
          after_image_url: string | null
          suggested_budget: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          customer_id: string
          title: string
          description: string
          category_id: number
          region: string
          status?: 'open' | 'assigned' | 'completed'
          assigned_provider_id?: string | null
          accepted_bid_id?: number | null
          before_image_url?: string | null
          after_image_url?: string | null
          suggested_budget?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          customer_id?: string
          title?: string
          description?: string
          category_id?: number
          region?: string
          status?: 'open' | 'assigned' | 'completed'
          assigned_provider_id?: string | null
          accepted_bid_id?: number | null
          before_image_url?: string | null
          after_image_url?: string | null
          suggested_budget?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      bids: {
        Row: {
          id: number
          request_id: number
          provider_id: string
          price: number
          message: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          request_id: number
          provider_id: string
          price: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          request_id?: number
          provider_id?: string
          price?: number
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: number
          request_id: number
          provider_id: string
          customer_id: string
          score: number
          created_at: string
        }
        Insert: {
          request_id: number
          provider_id: string
          customer_id: string
          score: number
          created_at?: string
        }
        Update: {
          request_id?: number
          provider_id?: string
          customer_id?: string
          score?: number
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          message: string
          type: 'info' | 'success' | 'alert'
          related_request_id: number | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          message: string
          type: 'info' | 'success' | 'alert'
          related_request_id?: number | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          message?: string
          type?: 'info' | 'success' | 'alert'
          related_request_id?: number | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      create_notification: {
        Args: {
          p_user_id: string
          p_message: string
          p_type: string
          p_related_request_id?: number
        }
        Returns: void
      }
    }
  }
}
