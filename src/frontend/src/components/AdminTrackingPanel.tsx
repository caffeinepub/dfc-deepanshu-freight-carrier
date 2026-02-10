import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, MapPin } from 'lucide-react';
import { useGetAllShipmentsForMap } from '@/hooks/useQueries';

declare global {
  interface Window {
    google?: any;
    initMap?: () => void;
  }
}

export function AdminTrackingPanel() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const { data: shipments, isLoading, error } = useGetAllShipmentsForMap();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || apiKey.trim() === '') {
      setMapError(null);
      setMapLoaded(false);
      return;
    }

    // If Google Maps is already loaded, mark as ready
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setMapError(null);
      return;
    }

    // Prevent duplicate script insertion
    if (scriptLoadedRef.current) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      scriptLoadedRef.current = true;
      // Wait for the existing script to load
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        setMapError(null);
      }
      return;
    }

    scriptLoadedRef.current = true;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setMapLoaded(true);
      setMapError(null);
    };

    script.onerror = () => {
      setMapError('Failed to load Google Maps. Please check your API key.');
      scriptLoadedRef.current = false;
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: only remove if we added it and it's still in DOM
      if (script.parentNode) {
        script.parentNode.removeChild(script);
        scriptLoadedRef.current = false;
      }
      if (window.initMap) {
        window.initMap = undefined;
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) {
      return;
    }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#242f3e' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
        ],
      });
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for shipments with coordinates
    if (shipments && shipments.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoordinates = false;

      shipments.forEach((shipment) => {
        if (shipment.coordinates) {
          const position = {
            lat: shipment.coordinates.latitude,
            lng: shipment.coordinates.longitude,
          };

          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: `${shipment.trackingID} - ${shipment.status}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#D4AF37',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px;">
                <strong>${shipment.trackingID}</strong><br/>
                Status: ${shipment.status}<br/>
                Location: ${shipment.location}
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend(position);
          hasValidCoordinates = true;
        }
      });

      if (hasValidCoordinates) {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [mapLoaded, shipments]);

  if (!apiKey || apiKey.trim() === '') {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking
          </CardTitle>
          <CardDescription className="text-white/70">
            Real-time shipment location tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-neutral-800 border-neutral-700">
            <AlertCircle className="h-4 w-4 text-gold" />
            <AlertDescription className="text-white/70">
              Google Maps API key is not configured. Please add your API key to the environment
              configuration to enable live tracking.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (mapError) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !mapLoaded) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking
          </CardTitle>
          <CardDescription className="text-white/70">
            Real-time shipment location tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[500px] bg-neutral-800" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-gold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load shipment data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const shipmentsWithCoordinates = shipments?.filter((s) => s.coordinates) || [];

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-gold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Tracking
        </CardTitle>
        <CardDescription className="text-white/70">
          Real-time shipment location tracking ({shipmentsWithCoordinates.length} active shipments)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shipmentsWithCoordinates.length === 0 ? (
          <Alert className="bg-neutral-800 border-neutral-700">
            <AlertCircle className="h-4 w-4 text-gold" />
            <AlertDescription className="text-white/70">
              No shipments with location data available. Shipments will appear here once they have
              coordinates assigned.
            </AlertDescription>
          </Alert>
        ) : (
          <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
        )}
      </CardContent>
    </Card>
  );
}
