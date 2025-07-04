import { supabase } from '../contexts/AuthContext';

export const adminService = {
  // User management
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching users:', error);
        // Return mock data for development
        return {
          data: [
            {
              id: '1',
              full_name: 'John Farmer',
              email: 'john@example.com',
              district: 'Kigali',
              province: 'Kigali City',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              full_name: 'Jane Grower',
              email: 'jane@example.com',
              district: 'Musanze',
              province: 'Northern Province',
              created_at: new Date().toISOString(),
            },
            {
              id: '3',
              full_name: 'Bob Cultivator',
              email: 'bob@example.com',
              district: 'Huye',
              province: 'Southern Province',
              created_at: new Date().toISOString(),
            },
          ],
          error: null,
        };
      }

      return { data, error };
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      return { data: [], error: err };
    }
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
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select(
          'crop_type, disease_detected, scan_date, confidence_score, location',
        )
        .order('scan_date', { ascending: false });

      if (error) {
        console.warn('Error fetching scan analytics:', error);
        // Return mock data for development
        return {
          data: [
            {
              crop_type: 'Tomato',
              disease_detected: 'Late Blight',
              scan_date: new Date().toISOString(),
              confidence_score: 0.87,
              location: 'Kigali, Rwanda',
            },
            {
              crop_type: 'Beans',
              disease_detected: 'Healthy',
              scan_date: new Date().toISOString(),
              confidence_score: 0.92,
              location: 'Musanze, Rwanda',
            },
            {
              crop_type: 'Potato',
              disease_detected: 'Early Blight',
              scan_date: new Date().toISOString(),
              confidence_score: 0.78,
              location: 'Huye, Rwanda',
            },
          ],
          error: null,
        };
      }

      return { data, error };
    } catch (err) {
      console.error('Error in getScanAnalytics:', err);
      return { data: [], error: err };
    }
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
