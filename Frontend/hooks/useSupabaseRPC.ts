import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../contexts/AuthContext';
import type {
  LocationLeaderboardEntry,
  AnalyticsSummary,
  DiseaseTrackingEntry,
  UserScanHistoryEntry,
  RecentScanEntry,
  ScanCountByLocation,
  LocationSearchResult,
} from '../types/supabase';

// Generic hook for calling Supabase RPC functions
export function useSupabaseRPC<T>(
  functionName: string,
  params: Record<string, any> = {},
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error: rpcError } = await supabase.rpc(
        functionName,
        params,
      );
      if (rpcError) throw rpcError;
      setData(result as T);
    } catch (err: any) {
      console.error(`RPC ${functionName} failed`, err);
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [functionName, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks ---------------------------------------------
export const useLocationLeaderboard = (limit = 10) =>
  useSupabaseRPC<LocationLeaderboardEntry[]>(
    'get_location_leaderboard',
    { limit_count: limit },
    [limit],
  );

export const useAnalyticsSummary = () =>
  useSupabaseRPC<AnalyticsSummary[]>('get_analytics_summary', {}, []);

export const useDiseaseTracking = (filter: string | null = null) =>
  useSupabaseRPC<DiseaseTrackingEntry[]>(
    'get_disease_tracking_by_location',
    filter ? { location_filter: filter } : {},
    [filter],
  );

export const useUserScanHistory = (userUuid: string, limit = 20) =>
  useSupabaseRPC<UserScanHistoryEntry[]>(
    'get_user_scan_history',
    { user_uuid: userUuid, limit_count: limit },
    [userUuid, limit],
  );

export const useRecentScans = (limit = 50) =>
  useSupabaseRPC<RecentScanEntry[]>(
    'get_recent_scans',
    { limit_count: limit },
    [limit],
  );

export const useScanCountByLocation = () =>
  useSupabaseRPC<ScanCountByLocation[]>('get_scan_count_by_location', {}, []);

export const useLocationSearch = (searchTerm: string) =>
  useSupabaseRPC<LocationSearchResult[]>(
    'search_locations',
    { search_term: searchTerm },
    [searchTerm],
  );
