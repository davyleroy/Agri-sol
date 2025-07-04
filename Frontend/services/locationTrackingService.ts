import { supabase } from '../contexts/AuthContext';
import { CropType, MLPrediction } from './mlService';

// Types for location data
export interface LocationData {
  country: string;
  province?: string;
  district?: string;
  sector?: string;
  latitude?: number;
  longitude?: number;
}

export interface ScanHistoryData {
  id: string;
  user_id: string;
  crop_type: string;
  predicted_disease: string;
  confidence_score: number;
  severity: string;
  treatment_urgency: string;
  location_string: string;
  country: string;
  province?: string;
  district?: string;
  sector?: string;
  latitude?: number;
  longitude?: number;
  image_path?: string;
  created_at: string;
}

export interface LocationAnalyticsData {
  location_string: string;
  country: string;
  province?: string;
  district?: string;
  total_scans: number;
  total_users: number;
  healthy_scans: number;
  disease_scans: number;
  healthy_percentage: number;
  growth_rate_7_days: number;
  last_scan_at: string;
  most_common_disease?: string;
  most_common_crop?: string;
  scans_last_7_days?: number;
  scans_last_30_days?: number;
  active_users_last_7_days?: number;
  active_users_last_30_days?: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LocationAnalyticsData[];
  total_locations: number;
  sorted_by: string;
  error?: string;
}

export interface ScanHistoryResponse {
  success: boolean;
  data: ScanHistoryData[];
  user_id: string;
  total_scans: number;
  error?: string;
}

class LocationTrackingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl =
      process.env.EXPO_PUBLIC_ML_API_URL || 'http://localhost:5000';
    this.apiKey = process.env.EXPO_PUBLIC_ML_API_KEY || 'agrisol-api-key-2024';

    console.log('🌍 Location Tracking Service initialized');
    console.log('API URL:', this.baseUrl);
  }

  /**
   * Build a standardized location string from components
   */
  buildLocationString(location: LocationData): string {
    const parts: string[] = [];

    if (location.sector) parts.push(location.sector);
    if (location.district) parts.push(location.district);
    if (location.province) parts.push(location.province);
    if (location.country) parts.push(location.country);

    return parts.join(', ');
  }

  /**
   * Parse a location string into components
   */
  parseLocationString(locationString: string): LocationData {
    const parts = locationString.split(',').map((part) => part.trim());

    return {
      country: parts[parts.length - 1] || '',
      province: parts.length >= 2 ? parts[parts.length - 2] : undefined,
      district: parts.length >= 3 ? parts[parts.length - 3] : undefined,
      sector: parts.length >= 4 ? parts[parts.length - 4] : undefined,
    };
  }

  /**
   * Save a scan result with location data
   */
  async saveScanHistory(
    userId: string,
    cropType: CropType,
    prediction: MLPrediction,
    location: LocationData,
    imagePath?: string,
  ): Promise<{ success: boolean; scanId?: string; error?: string }> {
    try {
      console.log('🔄 Saving scan history to backend...');

      const locationString = this.buildLocationString(location);

      const scanData = {
        user_id: userId,
        crop_type: cropType.id,
        predicted_disease: prediction.disease,
        confidence_score: prediction.confidence,
        severity: prediction.severity,
        treatment_urgency: prediction.treatmentUrgency,
        country: location.country,
        province: location.province,
        district: location.district,
        sector: location.sector,
        location_string: locationString,
        latitude: location.latitude,
        longitude: location.longitude,
        image_path: imagePath,
      };

      const response = await fetch(
        `${this.baseUrl}/api/location/scan-history`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(scanData),
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log('✅ Scan history saved successfully:', result.scan_id);
        return {
          success: true,
          scanId: result.scan_id,
        };
      } else {
        console.error('❌ Failed to save scan history:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to save scan history',
        };
      }
    } catch (error) {
      console.error('❌ Error saving scan history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Save or update user's location
   */
  async saveUserLocation(
    userId: string,
    location: LocationData,
    isPrimary: boolean = true,
  ): Promise<{ success: boolean; locationId?: string; error?: string }> {
    try {
      console.log('🔄 Saving user location...');

      const locationString = this.buildLocationString(location);

      const locationData = {
        user_id: userId,
        country: location.country,
        province: location.province,
        district: location.district,
        sector: location.sector,
        location_string: locationString,
        latitude: location.latitude,
        longitude: location.longitude,
        is_primary: isPrimary,
      };

      const response = await fetch(
        `${this.baseUrl}/api/location/user-location`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(locationData),
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log('✅ User location saved successfully:', result.location_id);
        return {
          success: true,
          locationId: result.location_id,
        };
      } else {
        console.error('❌ Failed to save user location:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to save user location',
        };
      }
    } catch (error) {
      console.error('❌ Error saving user location:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get location leaderboard data
   */
  async getLocationLeaderboard(
    sortBy: 'total_scans' | 'total_users' | 'growth_rate' = 'total_scans',
    limit: number = 50,
  ): Promise<LeaderboardResponse> {
    try {
      console.log('🔄 Fetching location leaderboard...');

      const response = await fetch(
        `${this.baseUrl}/api/location/leaderboard?sort_by=${sortBy}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log(
          `✅ Retrieved ${result.data.length} locations for leaderboard`,
        );
        return {
          success: true,
          data: result.data,
          total_locations: result.total_locations,
          sorted_by: result.sorted_by,
        };
      } else {
        console.error('❌ Failed to fetch leaderboard:', result.error);
        return {
          success: false,
          data: [],
          total_locations: 0,
          sorted_by: sortBy,
          error: result.error || 'Failed to fetch leaderboard',
        };
      }
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      return {
        success: false,
        data: [],
        total_locations: 0,
        sorted_by: sortBy,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get user's scan history
   */
  async getUserScanHistory(
    userId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<ScanHistoryResponse> {
    try {
      console.log('🔄 Fetching user scan history...');

      const response = await fetch(
        `${this.baseUrl}/api/location/user-scans/${userId}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Retrieved ${result.data.length} scan records for user`);
        return {
          success: true,
          data: result.data,
          user_id: result.user_id,
          total_scans: result.total_scans,
        };
      } else {
        console.error('❌ Failed to fetch scan history:', result.error);
        return {
          success: false,
          data: [],
          user_id: userId,
          total_scans: 0,
          error: result.error || 'Failed to fetch scan history',
        };
      }
    } catch (error) {
      console.error('❌ Error fetching scan history:', error);
      return {
        success: false,
        data: [],
        user_id: userId,
        total_scans: 0,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get detailed analytics for a specific location
   */
  async getLocationAnalytics(locationString: string): Promise<{
    success: boolean;
    location_data?: LocationAnalyticsData;
    recent_scans?: ScanHistoryData[];
    disease_breakdown?: any[];
    error?: string;
  }> {
    try {
      console.log('🔄 Fetching location analytics...');

      const response = await fetch(
        `${this.baseUrl}/api/location/analytics/${encodeURIComponent(locationString)}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log('✅ Retrieved location analytics');
        return {
          success: true,
          location_data: result.location_data,
          recent_scans: result.recent_scans,
          disease_breakdown: result.disease_breakdown,
        };
      } else {
        console.error('❌ Failed to fetch location analytics:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch location analytics',
        };
      }
    } catch (error) {
      console.error('❌ Error fetching location analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get disease tracking data
   */
  async getDiseaseTracking(
    locationString?: string,
    cropType?: string,
    days: number = 30,
  ): Promise<{
    success: boolean;
    data: any[];
    error?: string;
  }> {
    try {
      console.log('🔄 Fetching disease tracking data...');

      const params = new URLSearchParams();
      if (locationString) params.append('location', locationString);
      if (cropType) params.append('crop_type', cropType);
      params.append('days', days.toString());

      const response = await fetch(
        `${this.baseUrl}/api/location/disease-tracking?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        console.log('✅ Retrieved disease tracking data');
        return {
          success: true,
          data: result.data,
        };
      } else {
        console.error('❌ Failed to fetch disease tracking:', result.error);
        return {
          success: false,
          data: [],
          error: result.error || 'Failed to fetch disease tracking',
        };
      }
    } catch (error) {
      console.error('❌ Error fetching disease tracking:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Get mock data for development/testing
   */
  getMockLeaderboardData(): LocationAnalyticsData[] {
    return [
      {
        location_string: 'Nyagatare, Eastern Province, Rwanda',
        country: 'Rwanda',
        province: 'Eastern Province',
        district: 'Nyagatare',
        total_scans: 45,
        total_users: 12,
        healthy_scans: 30,
        disease_scans: 15,
        healthy_percentage: 66.67,
        growth_rate_7_days: 15.5,
        last_scan_at: new Date().toISOString(),
        most_common_disease: 'Early Blight',
        most_common_crop: 'potatoes',
        scans_last_7_days: 8,
        scans_last_30_days: 25,
        active_users_last_7_days: 6,
        active_users_last_30_days: 10,
      },
      {
        location_string: 'Musanze, Northern Province, Rwanda',
        country: 'Rwanda',
        province: 'Northern Province',
        district: 'Musanze',
        total_scans: 38,
        total_users: 10,
        healthy_scans: 28,
        disease_scans: 10,
        healthy_percentage: 73.68,
        growth_rate_7_days: 12.3,
        last_scan_at: new Date().toISOString(),
        most_common_disease: 'Healthy',
        most_common_crop: 'beans',
        scans_last_7_days: 5,
        scans_last_30_days: 18,
        active_users_last_7_days: 4,
        active_users_last_30_days: 8,
      },
      {
        location_string: 'Huye, Southern Province, Rwanda',
        country: 'Rwanda',
        province: 'Southern Province',
        district: 'Huye',
        total_scans: 32,
        total_users: 8,
        healthy_scans: 20,
        disease_scans: 12,
        healthy_percentage: 62.5,
        growth_rate_7_days: 18.2,
        last_scan_at: new Date().toISOString(),
        most_common_disease: 'Late Blight',
        most_common_crop: 'tomatoes',
        scans_last_7_days: 7,
        scans_last_30_days: 15,
        active_users_last_7_days: 3,
        active_users_last_30_days: 6,
      },
    ];
  }
}

// Export singleton instance
export const locationTrackingService = new LocationTrackingService();
export default locationTrackingService;
