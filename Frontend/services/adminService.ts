import { supabase } from '../contexts/AuthContext';

export const adminService = {
  // User management
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getUserAnalytics() {
    const { data, error } = await supabase
      .from('profiles')
      .select('country, farmer_type, created_at')
      .eq('is_active', true);

    return { data, error };
  },

  // Crop management
  async getAllCrops() {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async addCrop(cropData: {
    name: string;
    scientific_name?: string;
    category: string;
    description?: string;
    growing_season?: string;
    common_diseases?: string[];
    care_instructions?: string;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from('crops')
      .insert([cropData])
      .select();

    return { data, error };
  },

  async updateCrop(id: string, updates: any) {
    const { data, error } = await supabase
      .from('crops')
      .update(updates)
      .eq('id', id)
      .select();

    return { data, error };
  },

  async deleteCrop(id: string) {
    const { data, error } = await supabase
      .from('crops')
      .update({ is_active: false })
      .eq('id', id);

    return { data, error };
  },

  // Analytics
  async getScanAnalytics() {
    const { data, error } = await supabase
      .from('scan_history')
      .select('crop_type, disease_detected, scan_date, confidence_score')
      .order('scan_date', { ascending: false });

    return { data, error };
  },

  // Admin user management
  async getAllAdmins() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async addAdmin(adminData: {
    email: string;
    role?: 'super_admin' | 'admin' | 'moderator';
    permissions?: any;
  }) {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([adminData])
      .select();

    return { data, error };
  },

  async updateAdmin(id: string, updates: any) {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select();

    return { data, error };
  },

  async deactivateAdmin(id: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id);

    return { data, error };
  },
};
