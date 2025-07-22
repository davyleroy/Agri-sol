// 🗺️ Admin Map Dashboard Types

export interface MapDataPoint {
  id: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
    district: string;
    province: string;
  };
  metrics: {
    totalScans: number;
    healthyScans: number;
    diseasedScans: number;
    healthRate: number;
    lastScanAt: Date;
  };
  diseases: {
    name: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  users: {
    activeCount: number;
    totalCount: number;
  };
}

export interface MapFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  diseases: string[];
  crops: string[];
  healthThreshold: [number, number];
  districts: string[];
  userTypes: string[];
}

export interface MapVisualizationMode {
  type: 'markers' | 'heatmap' | 'choropleth' | 'clusters';
  metric: 'scanCount' | 'healthRate' | 'diseaseRate' | 'userActivity';
  style: 'default' | 'satellite' | 'terrain';
}

export interface MapAnalytics {
  totalScans: number;
  activeUsers: number;
  healthRate: number;
  diseaseRate: number;
  topDisease: string;
  mostActiveLocation: string;
  recentAlerts: Alert[];
  trends: TrendData[];
}

export interface Alert {
  id: string;
  type: 'disease_outbreak' | 'low_health' | 'high_activity';
  severity: 'low' | 'medium' | 'high';
  message: string;
  location: string;
  timestamp: Date;
}

export interface TrendData {
  date: Date;
  scans: number;
  healthRate: number;
  diseaseRate: number;
}

export interface MapExportOptions {
  format: 'csv' | 'pdf';
  includeMap: boolean;
  includeAnalytics: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ClusterPoint {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  pointCount: number;
  properties: MapDataPoint[];
}

export interface MapState {
  filters: MapFilters;
  visualizationMode: MapVisualizationMode;
  selectedMarker: MapDataPoint | null;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MapActions {
  updateFilters: (filters: Partial<MapFilters>) => void;
  setVisualizationMode: (mode: MapVisualizationMode) => void;
  selectMarker: (marker: MapDataPoint | null) => void;
  toggleFullscreen: () => void;
  resetFilters: () => void;
  exportData: (options: MapExportOptions) => Promise<void>;
}

export interface MapContextType {
  state: MapState;
  actions: MapActions;
}

// Utility types for performance optimization
export interface MemoizedMarkerProps {
  data: MapDataPoint;
  onPress: (data: MapDataPoint) => void;
  isSelected: boolean;
  visualizationMode: MapVisualizationMode;
}

export interface FilterPanelProps {
  filters: MapFilters;
  onFilterChange: (filters: Partial<MapFilters>) => void;
  onReset: () => void;
  availableDiseases: string[];
  availableCrops: string[];
  availableDistricts: string[];
}

export interface AnalyticsPanelProps {
  analytics: MapAnalytics;
  filters: MapFilters;
  onExport: (options: MapExportOptions) => Promise<void>;
  isLoading: boolean;
}

export interface MapLegendProps {
  visualizationMode: MapVisualizationMode;
  dataRange: {
    min: number;
    max: number;
  };
  metric: string;
}
