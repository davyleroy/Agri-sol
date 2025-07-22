import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Platform,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import type { MapDataPoint } from '../../types/map';

interface LeafletMapProps {
  data: MapDataPoint[];
  onMarkerClick: (point: MapDataPoint) => void;
  selectedMarker: MapDataPoint | null;
  heatZoneIntensity?: number; // 0-100, controls heat zone intensity
  showHeatZones?: boolean;
  fullWidth?: boolean; // New prop for full-width mode
}

const LeafletMapWeb = ({
  data,
  onMarkerClick,
  selectedMarker,
  heatZoneIntensity = 50,
  showHeatZones = true,
  fullWidth = false,
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const heatLayers = useRef<any[]>([]);
  const { width, height } = Dimensions.get('window');
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.L) return;

      // Initialize map centered on Rwanda with responsive settings
      const mapOptions = {
        center: [-1.9441, 30.0619] as [number, number],
        zoom: fullWidth ? 9 : 8,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        attributionControl: false, // Remove attribution for cleaner look
        // Mobile-specific options
        tap: true,
        tapTolerance: 15,
        bounceAtZoomLimits: false,
      };

      mapInstance.current = window.L.map(mapRef.current, mapOptions);

      // Add tile layer with better styling
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 6,
      }).addTo(mapInstance.current);

      addMarkers();
      if (showHeatZones) {
        addHeatZones();
      }

      // Fit map to data bounds if available
      if (data.length > 0) {
        const bounds = window.L.latLngBounds(
          data.map((point) => [
            point.location.latitude,
            point.location.longitude,
          ]),
        );
        mapInstance.current.fitBounds(bounds, {
          padding: fullWidth ? [50, 50] : [20, 20],
          maxZoom: fullWidth ? 12 : 10,
        });
      }

      // Force map refresh after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      }, 100);
    };

    const addMarkers = () => {
      if (!mapInstance.current || !window.L) return;

      // Clear existing markers
      markers.current.forEach((marker) =>
        mapInstance.current.removeLayer(marker),
      );
      markers.current = [];

      data.forEach((point) => {
        const healthRate = point.metrics.healthRate;
        const scanCount = point.metrics.totalScans;

        // Create custom icon with size based on scan count and device
        const baseSize = isMobile ? 20 : 24;
        const maxSize = isMobile ? 36 : 48;
        const iconSize = Math.max(
          baseSize,
          Math.min(maxSize, baseSize + scanCount * 2),
        );
        const iconColor = getMarkerColor(healthRate);

        const customIcon = window.L.divIcon({
          html: `
            <div style="
              width: ${iconSize}px;
              height: ${iconSize}px;
              background-color: ${iconColor};
              border: ${isMobile ? '2px' : '4px'} solid white;
              border-radius: 50%;
              box-shadow: 0 ${isMobile ? '2px' : '4px'} ${isMobile ? '4px' : '8px'} rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: white;
              font-size: ${Math.max(isMobile ? 8 : 12, iconSize * 0.35)}px;
              cursor: pointer;
              transition: all 0.2s ease;
            ">
              ${scanCount}
            </div>
          `,
          className: 'custom-marker',
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        });

        const marker = window.L.marker(
          [point.location.latitude, point.location.longitude],
          {
            icon: customIcon,
            title: point.location.name,
          },
        ).addTo(mapInstance.current);

        // Add enhanced popup with responsive design
        const popupContent = `
          <div style="min-width: ${isMobile ? '200px' : '250px'}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="margin: 0 0 ${isMobile ? '8px' : '12px'} 0; color: #1f2937; font-size: ${isMobile ? '14px' : '16px'}; font-weight: 600;">
              ${point.location.name}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${isMobile ? '6px' : '8px'}; margin-bottom: ${isMobile ? '8px' : '12px'};">
              <div style="background: #f3f4f6; padding: ${isMobile ? '6px' : '8px'}; border-radius: 6px;">
                <div style="font-size: ${isMobile ? '10px' : '12px'}; color: #6b7280; margin-bottom: 2px;">Total Scans</div>
                <div style="font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600; color: #1f2937;">${point.metrics.totalScans}</div>
              </div>
              <div style="background: #f3f4f6; padding: ${isMobile ? '6px' : '8px'}; border-radius: 6px;">
                <div style="font-size: ${isMobile ? '10px' : '12px'}; color: #6b7280; margin-bottom: 2px;">Health Rate</div>
                <div style="font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600; color: ${getMarkerColor(point.metrics.healthRate)};">${point.metrics.healthRate.toFixed(1)}%</div>
              </div>
            </div>
            <div style="background: #f3f4f6; padding: ${isMobile ? '6px' : '8px'}; border-radius: 6px; margin-bottom: ${isMobile ? '6px' : '8px'};">
              <div style="font-size: ${isMobile ? '10px' : '12px'}; color: #6b7280; margin-bottom: 2px;">Diseased Scans</div>
              <div style="font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600; color: #ef4444;">${point.metrics.diseasedScans}</div>
            </div>
            ${
              point.diseases.length > 0
                ? `
              <div style="border-top: 1px solid #e5e7eb; padding-top: ${isMobile ? '6px' : '8px'};">
                <div style="font-size: ${isMobile ? '10px' : '12px'}; color: #6b7280; margin-bottom: 4px;">Top Disease</div>
                <div style="font-size: ${isMobile ? '12px' : '14px'}; font-weight: 600; color: #1f2937;">${point.diseases[0]?.name || 'None'}</div>
              </div>
            `
                : ''
            }
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: isMobile ? 250 : 300,
          className: 'custom-popup',
        });

        // Add click handler
        marker.on('click', () => {
          onMarkerClick(point);
        });

        // Highlight selected marker
        if (selectedMarker?.id === point.id) {
          marker.setZIndexOffset(1000);
        }

        markers.current.push(marker);
      });
    };

    const addHeatZones = () => {
      if (!mapInstance.current || !window.L) return;

      // Clear existing heat layers
      heatLayers.current.forEach((layer) =>
        mapInstance.current.removeLayer(layer),
      );
      heatLayers.current = [];

      data.forEach((point) => {
        const healthRate = point.metrics.healthRate;
        const scanCount = point.metrics.totalScans;

        // Calculate heat zone radius based on scan count, intensity, and device
        const baseRadius = isMobile ? 30000 : 40000; // Smaller radius for mobile
        const scanMultiplier = Math.max(0.3, Math.min(2.5, scanCount / 8));
        const intensityMultiplier = heatZoneIntensity / 50; // Normalize to 0-2 range
        const radius = baseRadius * scanMultiplier * intensityMultiplier;

        // Create heat zone with enhanced styling
        const heatZone = window.L.circle(
          [point.location.latitude, point.location.longitude],
          {
            radius: radius,
            fillColor: getHeatZoneColor(healthRate),
            color: getHeatZoneColor(healthRate),
            weight: isMobile ? 2 : 3,
            opacity: 0.7,
            fillOpacity: 0.25,
          },
        ).addTo(mapInstance.current);

        // Add central marker for heat zone
        const centerMarker = window.L.circleMarker(
          [point.location.latitude, point.location.longitude],
          {
            radius: isMobile ? 6 : 10,
            fillColor: getHeatZoneColor(healthRate),
            color: 'white',
            weight: isMobile ? 2 : 3,
            opacity: 1,
            fillOpacity: 0.9,
          },
        ).addTo(mapInstance.current);

        heatLayers.current.push(heatZone, centerMarker);
      });
    };

    const getMarkerColor = (healthRate: number) => {
      if (healthRate >= 80) return '#22c55e'; // Green
      if (healthRate >= 60) return '#f59e0b'; // Orange
      return '#ef4444'; // Red
    };

    const getHeatZoneColor = (healthRate: number) => {
      if (healthRate >= 80) return '#22c55e'; // Green
      if (healthRate >= 60) return '#f59e0b'; // Orange
      return '#ef4444'; // Red
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, [
    data,
    onMarkerClick,
    selectedMarker,
    heatZoneIntensity,
    showHeatZones,
    fullWidth,
    width,
    height,
  ]);

  return (
    <div
      ref={mapRef}
      style={{
        width: fullWidth ? '100vw' : '100%',
        height: fullWidth ? '100vh' : '100%',
        borderRadius: fullWidth ? 0 : 8,
        overflow: 'hidden',
        position: fullWidth ? 'fixed' : 'relative',
        top: fullWidth ? 0 : 'auto',
        left: fullWidth ? 0 : 'auto',
        zIndex: fullWidth ? 9999 : 'auto',
      }}
    />
  );
};

const LeafletMapMobile = () => {
  return (
    <View style={styles.mobilePlaceholder}>
      <Text style={styles.mobileText}>Map view requires web platform</Text>
    </View>
  );
};

export default function LeafletMap({
  data,
  onMarkerClick,
  selectedMarker,
  heatZoneIntensity = 50,
  showHeatZones = true,
  fullWidth = false,
}: LeafletMapProps) {
  if (Platform.OS === 'web') {
    return (
      <LeafletMapWeb
        data={data}
        onMarkerClick={onMarkerClick}
        selectedMarker={selectedMarker}
        heatZoneIntensity={heatZoneIntensity}
        showHeatZones={showHeatZones}
        fullWidth={fullWidth}
      />
    );
  }
  return <LeafletMapMobile />;
}

const styles = StyleSheet.create({
  mobilePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  mobileText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
