import { supabase } from './supabase';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
type Bid = Database['public']['Tables']['bids']['Row'];
type Rating = Database['public']['Tables']['ratings']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

export const api = {
  auth: {
    async signUp(email: string, password: string, metadata: {
      name: string;
      role: 'customer' | 'provider' | 'admin';
      contact_info: string;
      region: string;
      address?: string;
      specialization_id?: number;
    }) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...metadata,
        });

      if (profileError) throw profileError;

      return authData;
    },

    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },

    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },

    async getUserById(userId: string) {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
      if (error) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id === userId) {
          return data.user;
        }
        return null;
      }
      return user;
    },

    onAuthStateChange(callback: (user: any) => void) {
      return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user || null);
      });
    },
  },

  profiles: {
    async getAll() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },

    async getByIdSilent(id: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      return data as Profile | null;
    },

    async update(id: string, updates: Partial<Profile>) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
  },

  categories: {
    async getAll() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id');

      if (error) throw error;
      return data;
    },
  },

  requests: {
    async getAll(filters?: { status?: string; category_id?: number; region?: string }) {
      let query = supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ServiceRequest[];
    },

    async getById(id: number) {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as ServiceRequest | null;
    },

    async create(request: Database['public']['Tables']['service_requests']['Insert']) {
      const { data, error } = await supabase
        .from('service_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },

    async update(id: number, updates: Database['public']['Tables']['service_requests']['Update']) {
      const { data, error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },

    async acceptBid(requestId: number, bidId: number, providerId: string) {
      const { error: requestError } = await supabase
        .from('service_requests')
        .update({
          status: 'assigned',
          assigned_provider_id: providerId,
          accepted_bid_id: bidId,
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      const { error: bidUpdateError } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      if (bidUpdateError) throw bidUpdateError;

      const { error: rejectError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('request_id', requestId)
        .neq('id', bidId);

      if (rejectError) throw rejectError;
    },

    async getProviderContactInfo(requestId: number, customerId: string) {
      const { data, error } = await supabase
        .rpc('get_provider_contact_info', {
          p_request_id: requestId,
          p_customer_id: customerId,
        });

      if (error) throw error;
      return data?.[0] || null;
    },

    async complete(id: number) {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },
  },

  bids: {
    async getAll() {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bid[];
    },

    async getByRequestId(requestId: number) {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bid[];
    },

    async create(bid: Database['public']['Tables']['bids']['Insert']) {
      const { data, error } = await supabase
        .from('bids')
        .insert(bid)
        .select()
        .single();

      if (error) throw error;
      return data as Bid;
    },

    async createAcceptance(requestId: number, providerId: string, message?: string) {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          request_id: requestId,
          provider_id: providerId,
          price: null,
          message: message || 'موافق على تنفيذ الطلب بالميزانية المحددة',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Bid;
    },

    async getByProviderId(providerId: string) {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Bid[];
    },
  },

  ratings: {
    async getAll() {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Rating[];
    },

    async create(rating: Database['public']['Tables']['ratings']['Insert']) {
      const { data, error } = await supabase
        .from('ratings')
        .insert(rating)
        .select()
        .single();

      if (error) throw error;
      return data as Rating;
    },

    async getByProviderId(providerId: string) {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Rating[];
    },

    async getByRequestId(requestId: number) {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('request_id', requestId)
        .maybeSingle();

      if (error) throw error;
      return data as Rating | null;
    },
  },

  notifications: {
    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },

    async markAsRead(id: number) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    },

    subscribe(userId: string, callback: (notification: Notification) => void) {
      return supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new as Notification);
          }
        )
        .subscribe();
    },
  },
};
