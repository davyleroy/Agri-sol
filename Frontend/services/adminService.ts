import { supabase } from '../contexts/AuthContext';
import {
  locationTrackingService,
  LocationAnalyticsData,
  LeaderboardResponse,
  ScanHistoryData,
} from './locationTrackingService';

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

  // Location Analytics
  async getLocationLeaderboard(
    sortBy: 'total_scans' | 'total_users' | 'growth_rate' = 'total_scans',
    limit: number = 50,
  ): Promise<LeaderboardResponse> {
    try {
      console.log('🔄 Admin: Fetching location leaderboard...');

      const result = await locationTrackingService.getLocationLeaderboard(
        sortBy,
        limit,
      );

      if (!result.success) {
        console.warn(
          '⚠️ Location leaderboard fetch failed, returning mock data',
        );
        return {
          success: true,
          data: locationTrackingService.getMockLeaderboardData(),
          total_locations: 3,
          sorted_by: sortBy,
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching location leaderboard:', error);
      return {
        success: false,
        data: [],
        total_locations: 0,
        sorted_by: sortBy,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getLocationAnalytics(locationString: string) {
    try {
      console.log('🔄 Admin: Fetching location analytics for:', locationString);

      const result =
        await locationTrackingService.getLocationAnalytics(locationString);

      if (!result.success) {
        console.warn('⚠️ Location analytics fetch failed');
        return {
          success: false,
          error: result.error || 'Failed to fetch location analytics',
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching location analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getDiseaseTracking(
    locationString?: string,
    cropType?: string,
    days: number = 30,
  ) {
    try {
      console.log('🔄 Admin: Fetching disease tracking data...');

      const result = await locationTrackingService.getDiseaseTracking(
        locationString,
        cropType,
        days,
      );

      if (!result.success) {
        console.warn('⚠️ Disease tracking fetch failed');
        return {
          success: false,
          data: [],
          error: result.error || 'Failed to fetch disease tracking data',
        };
      }

      return result;
    } catch (error) {
      console.error('❌ Error fetching disease tracking:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getLocationSummary() {
    try {
      console.log('🔄 Admin: Fetching location summary...');

      const leaderboard = await this.getLocationLeaderboard('total_scans', 100);

      if (!leaderboard.success) {
        return {
          success: false,
          error: 'Failed to fetch location summary',
        };
      }

      // Calculate summary statistics
      const totalLocations = leaderboard.data.length;
      const totalScans = leaderboard.data.reduce(
        (sum, loc) => sum + loc.total_scans,
        0,
      );
      const totalUsers = leaderboard.data.reduce(
        (sum, loc) => sum + loc.total_users,
        0,
      );
      const averageHealthy =
        leaderboard.data.reduce((sum, loc) => sum + loc.healthy_percentage, 0) /
        totalLocations;
      const averageGrowth =
        leaderboard.data.reduce((sum, loc) => sum + loc.growth_rate_7_days, 0) /
        totalLocations;

      // Find top performing location
      const topLocation = leaderboard.data[0];

      // Find most common diseases
      const diseaseCount: { [key: string]: number } = {};
      leaderboard.data.forEach((loc) => {
        if (loc.most_common_disease) {
          diseaseCount[loc.most_common_disease] =
            (diseaseCount[loc.most_common_disease] || 0) + 1;
        }
      });

      const mostCommonDisease = Object.keys(diseaseCount).reduce((a, b) =>
        diseaseCount[a] > diseaseCount[b] ? a : b,
      );

      return {
        success: true,
        summary: {
          totalLocations,
          totalScans,
          totalUsers,
          averageHealthyPercentage: Math.round(averageHealthy * 100) / 100,
          averageGrowthRate: Math.round(averageGrowth * 100) / 100,
          topLocation: topLocation
            ? {
                name: topLocation.location_string,
                scans: topLocation.total_scans,
                users: topLocation.total_users,
                healthyPercentage: topLocation.healthy_percentage,
              }
            : null,
          mostCommonDisease,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Error fetching location summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async getRecentScans(limit: number = 50) {
    try {
      console.log('🔄 Admin: Fetching recent scans...');

      const { data, error } = await supabase
        .from('scan_history')
        .select(
          `
          id,
          crop_type,
          predicted_disease,
          confidence_score,
          severity,
          location_string,
          country,
          province,
          district,
          created_at,
          profiles!inner(full_name, email)
        `,
        )
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('⚠️ Recent scans fetch failed:', error);
        return {
          success: false,
          data: [],
          error: error.message,
        };
      }

      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      console.error('❌ Error fetching recent scans:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
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
