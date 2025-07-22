# 🗺️ Google Maps Web Integration Setup

## Overview

This guide shows you how to implement a real interactive map for the web version of your admin dashboard using Google Maps JavaScript API.

## 🚀 **Option 1: Google Maps JavaScript API (Recommended)**

### **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Maps JavaScript API**
   - Go to "APIs & Services" > "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

4. **Restrict API Key (Recommended)**
   - Click on your API key
   - Under "Application restrictions" select "HTTP referrers"
   - Add your domain: `localhost:8082/*`
   - Under "API restrictions" select "Maps JavaScript API"

### **Step 2: Update the Code**

Replace `YOUR_GOOGLE_MAPS_API_KEY` in `AdminMapDashboardWeb.tsx`:

```typescript
// Line 33: Replace with your actual API key
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry`;
```

### **Step 3: Test the Implementation**

1. **Start your development server:**

   ```bash
   cd Frontend
   npx expo start
   ```

2. **Navigate to:** `http://localhost:8082/admin-map-test`

3. **You should see:**
   - ✅ Interactive Google Maps
   - ✅ Color-coded markers (Green/Yellow/Red)
   - ✅ Clickable markers with info windows
   - ✅ Rwanda-focused map view

## 🗺️ **Option 2: Leaflet (Free Alternative)**

If you prefer a free alternative, here's how to implement Leaflet:

### **Step 1: Install Leaflet**

```bash
npm install leaflet react-leaflet
```

### **Step 2: Create Leaflet Map Component**

```typescript
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const LeafletMap = ({ data, onMarkerClick }) => {
  return (
    <MapContainer
      center={[-1.9441, 30.0619]}
      zoom={8}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {data.map(point => (
        <Marker
          key={point.id}
          position={[point.location.latitude, point.location.longitude]}
          eventHandlers={{
            click: () => onMarkerClick(point),
          }}
        >
          <Popup>
            <div>
              <h3>{point.location.name}</h3>
              <p>Health Rate: {point.metrics.healthRate.toFixed(1)}%</p>
              <p>Total Scans: {point.metrics.totalScans}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

## 🎯 **Option 3: Mapbox (Professional)**

For a more professional look with custom styling:

### **Step 1: Get Mapbox Token**

1. Sign up at: https://www.mapbox.com/
2. Get your access token

### **Step 2: Install Mapbox**

```bash
npm install mapbox-gl react-map-gl
```

### **Step 3: Implementation**

```typescript
import Map, { Marker, Popup } from 'react-map-gl';

const MapboxMap = ({ data, onMarkerClick }) => {
  return (
    <Map
      mapboxAccessToken="YOUR_MAPBOX_TOKEN"
      initialViewState={{
        longitude: 30.0619,
        latitude: -1.9441,
        zoom: 8
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {data.map(point => (
        <Marker
          key={point.id}
          longitude={point.location.longitude}
          latitude={point.location.latitude}
          onClick={() => onMarkerClick(point)}
        >
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: getHealthColor(point.metrics.healthRate),
            border: '2px solid white',
            cursor: 'pointer'
          }} />
        </Marker>
      ))}
    </Map>
  );
};
```

## 🔧 **Current Implementation Features**

The current Google Maps implementation includes:

### ✅ **Interactive Features**

- **Real-time markers** with health status colors
- **Clickable markers** with detailed info windows
- **Dynamic marker sizing** based on scan count
- **Rwanda-focused** map view

### ✅ **Visual Elements**

- **Green markers**: Healthy crops (≥80%)
- **Yellow markers**: Moderate health (60-79%)
- **Red markers**: Diseased crops (<60%)
- **Custom styling** with clean, professional look

### ✅ **Performance Optimizations**

- **Lazy loading** of Google Maps API
- **Efficient marker management**
- **Memory cleanup** on component unmount

## 🚀 **Next Steps**

1. **Get your Google Maps API key**
2. **Replace the placeholder API key** in the code
3. **Test the interactive map**
4. **Customize styling** as needed
5. **Add clustering** for better performance with many markers

## 💡 **Pro Tips**

- **Free tier**: Google Maps offers $200/month free credit
- **Caching**: Consider caching map data for better performance
- **Clustering**: For 100+ markers, implement marker clustering
- **Custom styling**: Use Google Maps styling to match your brand

The Google Maps implementation is now ready! Just add your API key and you'll have a fully functional interactive map dashboard. 🎉
