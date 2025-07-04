// TypeScript interfaces matching Supabase RPC return types

export interface LocationLeaderboardEntry {
  rank: number;
  location_name: string;
  location_hierarchy: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  total_scans: number;
  healthy_scans: number;
  diseased_scans: number;
  unique_users: number;
  last_scan_date: string | null;
  disease_rate: number;
}

export interface AnalyticsSummary {
  total_scans: number;
  total_healthy_scans: number;
  total_diseased_scans: number;
  unique_users: number;
  active_locations: number;
  top_disease: string;
  disease_count: number;
  most_active_location: string;
  location_scan_count: number;
}

export interface DiseaseTrackingEntry {
  location_name: string;
  location_hierarchy: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  disease_name: string;
  occurrence_count: number;
  first_detected: string;
  last_detected: string;
}

export interface UserScanHistoryEntry {
  scan_id: string;
  crop_type: string;
  disease_detected: string;
  confidence_score: number;
  location_name: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  latitude: number | null;
  longitude: number | null;
  scan_date: string;
  image_url: string | null;
  severity: string | null;
  treatment_urgency: string | null;
}

export interface RecentScanEntry {
  scan_id: string;
  user_id: string;
  crop_type: string;
  disease_detected: string;
  confidence_score: number;
  location_name: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  scan_date: string;
  days_ago: number;
  severity: string | null;
}

export interface ScanCountByLocation {
  location_name: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  scan_count: number;
  disease_count: number;
  healthy_count: number;
  latest_scan: string | null;
}

export interface LocationSearchResult {
  location_name: string;
  location_hierarchy: string;
  province: string | null;
  district: string | null;
  sector: string | null;
  total_scans: number;
  match_type: string;
}
