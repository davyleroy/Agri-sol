declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: any) => google.maps.Map;
        Marker: new (options: any) => google.maps.Marker;
        InfoWindow: new (options: any) => google.maps.InfoWindow;
        SymbolPath: {
          CIRCLE: number;
        };
      };
    };
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(event: string, handler: Function): void;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
    }

    interface MapOptions {
      center: LatLng;
      zoom: number;
      styles?: any[];
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: any;
    }

    interface InfoWindowOptions {
      content: string;
    }

    interface LatLng {
      lat: number;
      lng: number;
    }

    const SymbolPath: {
      CIRCLE: number;
    };
  }
}

export {};
