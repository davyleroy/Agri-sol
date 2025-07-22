import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../contexts/AuthContext';
import type { MapDataPoint, MapFilters } from '../types/map';

// Transform Supabase data to MapDataPoint format
const transformToMapDataPoints = (
  locationData: any[],
  diseaseData: any[],
  analyticsData: any[],
  filters: MapFilters,
): MapDataPoint[] => {
  if (!locationData || locationData.length === 0) return [];

  return locationData
    .filter((location) => {
      // Apply filters
      if (
        filters.districts.length > 0 &&
        !filters.districts.includes(location.location_name)
      ) {
        return false;
      }

      const healthRate =
        location.scan_count > 0
          ? (location.healthy_count / location.scan_count) * 100
          : 0;

      if (
        healthRate < filters.healthThreshold[0] ||
        healthRate > filters.healthThreshold[1]
      ) {
        return false;
      }

      return true;
    })
    .map((location) => {
      const healthRate =
        location.scan_count > 0
          ? (location.healthy_count / location.scan_count) * 100
          : 0;

      // Get district coordinates (you'll need to add these)
      const districtCoords = getDistrictCoordinates(location.location_name);

      return {
        id: location.location_name,
        location: {
          name: location.location_name,
          latitude: location.latitude || districtCoords?.latitude || -1.9441,
          longitude: location.longitude || districtCoords?.longitude || 30.0619,
          district: location.location_name,
          province: location.province || 'Unknown',
        },
        metrics: {
          totalScans: location.scan_count || 0,
          healthyScans: location.healthy_count || 0,
          diseasedScans: location.disease_count || 0,
          healthRate: healthRate,
          lastScanAt: new Date(), // You'll need to add this to your data
        },
        diseases: getDiseasesForLocation(location.location_name, diseaseData),
        users: {
          activeCount: 1, // Placeholder - you'll need to add user data
          totalCount: 1,
        },
      };
    });
};

// Get district coordinates (you can expand this)
const getDistrictCoordinates = (districtName: string) => {
  const coordinates: Record<string, { latitude: number; longitude: number }> = {
    Kigali: { latitude: -1.9441, longitude: 30.0619 },
    Huye: { latitude: -2.5967, longitude: 29.7389 },
    Musanze: { latitude: -1.4998, longitude: 29.6344 },
    Rubavu: { latitude: -1.6734, longitude: 29.3489 },
    Rusizi: { latitude: -2.4608, longitude: 29.3267 },
    Karongi: { latitude: -2.0744, longitude: 29.3497 },
    Nyagatare: { latitude: -1.2976, longitude: 30.3216 },
    Gatsibo: { latitude: -1.43, longitude: 30.35 },
    Kayonza: { latitude: -1.75, longitude: 30.5 },
    Rwamagana: { latitude: -1.9486, longitude: 30.4347 },
    Bugesera: { latitude: -2.1667, longitude: 30.1667 },
    Kirehe: { latitude: -2.5, longitude: 30.5 },
    Ngoma: { latitude: -2.25, longitude: 30.5 },
    Gisagara: { latitude: -2.5833, longitude: 29.85 },
    Nyanza: { latitude: -2.35, longitude: 29.75 },
    Muhanga: { latitude: -2.0833, longitude: 29.75 },
    Kamonyi: { latitude: -2.0, longitude: 29.9167 },
    Ruhango: { latitude: -2.1667, longitude: 29.8333 },
    Nyamagabe: { latitude: -2.5, longitude: 29.5 },
    Nyaruguru: { latitude: -2.75, longitude: 29.5 },
    Nyamasheke: { latitude: -2.5, longitude: 29.0 },
    Rutsiro: { latitude: -1.75, longitude: 29.25 },
    Nyabihu: { latitude: -1.5833, longitude: 29.5 },
    Ngororero: { latitude: -1.8333, longitude: 29.5 },
  };

  return coordinates[districtName] || coordinates['Kigali'];
};

// Get diseases for a specific location
const getDiseasesForLocation = (locationName: string, diseaseData: any[]) => {
  const locationDiseases =
    diseaseData?.filter((disease) => disease.crop_type === locationName) || [];

  return locationDiseases.map((disease) => ({
    name: disease.disease_name,
    count: disease.disease_count || 0,
    severity: getDiseaseSeverity(disease.disease_count),
  }));
};

// Determine disease severity based on case count
const getDiseaseSeverity = (caseCount: number): 'low' | 'medium' | 'high' => {
  if (caseCount <= 2) return 'low';
  if (caseCount <= 5) return 'medium';
  return 'high';
};

// Fetch map data from Supabase
const fetchMapData = async (filters: MapFilters): Promise<MapDataPoint[]> => {
  try {
    console.log('🗺️ Fetching map data with filters:', filters);

    // Fetch data from your existing Supabase functions
    const [locationData, diseaseData, analyticsData] = await Promise.all([
      supabase.rpc('get_scan_count_by_location'),
      supabase.rpc('get_disease_distribution'),
      supabase.rpc('get_analytics_summary'),
    ]);

    if (locationData.error) {
      throw new Error(`Location data error: ${locationData.error.message}`);
    }

    if (diseaseData.error) {
      console.warn('Disease data error:', diseaseData.error);
    }

    if (analyticsData.error) {
      console.warn('Analytics data error:', analyticsData.error);
    }

    const transformedData = transformToMapDataPoints(
      locationData.data || [],
      diseaseData.data || [],
      analyticsData.data || [],
      filters,
    );

    console.log(`✅ Fetched ${transformedData.length} map data points`);
    return transformedData;
  } catch (error) {
    console.error('❌ Error fetching map data:', error);
    throw error;
  }
};

// Main hook for map data
export const useMapData = (filters: MapFilters) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['mapData', filters],
    queryFn: () => fetchMapData(filters),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchInterval: 60 * 1000, // 1 minute auto-refresh
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => {
    return query.data || [];
  }, [query.data]);

  // Prefetch next page of data
  const prefetchNextData = () => {
    queryClient.prefetchQuery({
      queryKey: ['mapData', { ...filters, page: (filters as any).page + 1 }],
      queryFn: () => fetchMapData(filters),
    });
  };

  return {
    data: memoizedData,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    prefetchNextData,
    // Real-time stats
    lastUpdate: query.dataUpdatedAt,
    isStale: query.isStale,
  };
};

// Hook for analytics data
export const useMapAnalytics = (filters: MapFilters) => {
  const query = useQuery({
    queryKey: ['mapAnalytics', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_analytics_summary');

      if (error) throw error;

      return {
        totalScans: data?.[0]?.total_scans || 0,
        activeUsers: data?.[0]?.unique_users || 0,
        healthRate:
          (data?.[0]?.total_healthy_scans / (data?.[0]?.total_scans || 1)) *
            100 || 0,
        diseaseRate:
          (data?.[0]?.total_diseased_scans / (data?.[0]?.total_scans || 1)) *
            100 || 0,
        topDisease: data?.[0]?.top_disease || 'None',
        mostActiveLocation: data?.[0]?.most_active_location || 'No data',
        recentAlerts: [], // You'll need to implement this
        trends: [], // You'll need to implement this
      };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });

  return {
    analytics: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook for available filter options
export const useMapFilterOptions = () => {
  const query = useQuery({
    queryKey: ['mapFilterOptions'],
    queryFn: async () => {
      // Fetch available diseases, crops, districts from your database
      const { data: locationData } = await supabase.rpc(
        'get_scan_count_by_location',
      );
      const { data: diseaseData } = await supabase.rpc(
        'get_disease_distribution',
      );

      const districts = [
        ...new Set(locationData?.map((loc: any) => loc.location_name) || []),
      ];
      const diseases = [
        ...new Set(
          diseaseData?.map((disease: any) => disease.disease_name) || [],
        ),
      ];
      const crops = ['Tomatoes', 'Beans', 'Maize', 'Potatoes']; // You'll need to get this from your data

      return {
        districts,
        diseases,
        crops,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    options: query.data,
    loading: query.isLoading,
    error: query.error,
  };
};
