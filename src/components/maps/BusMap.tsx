"use client";

import { useEffect, useState } from "react";
import { MapContainer, MapController } from "@/components/maps/MapContainer";
import {
  BusMarker,
  RoutePolyline,
  SchoolMarker,
  StopMarker,
} from "@/components/maps/BusMarker";
import { useBusTracking } from "@/lib/realtime";
import { MAP_CONFIG, calculateDistance, calculateEta, formatDistance } from "@/lib/map/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Navigation, Maximize2, RefreshCw, WifiOff } from "lucide-react";

export interface TrackingMapProps {
  busId: string;
  userId: string;
  role: string;
  route: {
    id: string;
    routeName: string;
    school: string;
    schoolLat: number;
    schoolLng: number;
    stops: Array<{
      id: string;
      stopName: string;
      latitude: number;
      longitude: number;
      estimatedTime: string | null;
      stopOrder: number;
    }>;
  };
  childStops?: {
    pickup?: { id: string; stopName: string; latitude: number; longitude: number };
    dropoff?: { id: string; stopName: string; latitude: number; longitude: number };
  };
  showControls?: boolean;
  height?: string;
  compact?: boolean;
}

export function BusMap({
  busId,
  userId,
  role,
  route,
  childStops,
  showControls = true,
  height = "h-[400px]",
  compact = false,
}: TrackingMapProps) {
  const [position, setPosition] = useState<any>(null);
  const [connected, setConnected] = useState(false);

  useBusTracking(busId, (data) => {
    setPosition(data);
    setConnected(true);
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    route.schoolLat, route.schoolLng,
  ]);
  const [mapZoom, setMapZoom] = useState(14);

  const busPosition: [number, number] = position
    ? [position.lat, position.lng]
    : [route.schoolLat, route.schoolLng];

  useEffect(() => {
    if (position) {
      setMapCenter([position.lat, position.lng]);
    }
  }, [position]);

  const handleCenterBus = () => {
    if (position) {
      setMapCenter([position.lat, position.lng]);
      setMapZoom(16);
    }
  };

  const handleCenterSchool = () => {
    setMapCenter([route.schoolLat, route.schoolLng]);
    setMapZoom(15);
  };

  const routePositions = route.stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]);
  const fullRoute = [
    [route.schoolLat, route.schoolLng] as [number, number],
    ...routePositions,
  ];

  if (position) {
    const distance = calculateDistance(
      position.lat, position.lng,
      route.schoolLat, route.schoolLng
    );
    const eta = calculateEta(distance, position.speed || 20);
  }

  return (
    <div className={`relative ${height} rounded-[16px] overflow-hidden shadow-xl`}>
      <MapContainer center={mapCenter} zoom={mapZoom}>
        <MapController center={mapCenter} zoom={mapZoom} />

        <RoutePolyline positions={fullRoute} color="#6B8E6E" weight={4} opacity={0.5} />

        {route.stops.map((stop) => {
          const isPickup = childStops?.pickup?.id === stop.id;
          const isDropoff = childStops?.dropoff?.id === stop.id;
          return (
            <StopMarker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              name={stop.stopName}
              isPickup={isPickup}
              isDropoff={isDropoff}
              isChildStop={isPickup || isDropoff}
            />
          );
        })}

        <SchoolMarker position={[route.schoolLat, route.schoolLng]} name={route.school} />

        {position && (
          <BusMarker
            position={[position.lat, position.lng]}
            heading={position.heading}
            popupContent={
              <div className="min-w-[180px]">
                <div className="font-semibold text-sm mb-1">Bus {position.busNumber || "12"}</div>
                <div className="text-xs text-secondary space-y-0.5">
                  <div>Status: {position.status === "moving" ? "🟢 Moving" : "🛑 Stopped"}</div>
                  <div>Speed: {(position.speed || 0)} km/h</div>
                  <div>Last update: {new Date(position.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            }
          />
        )}
      </MapContainer>

      {showControls && (
        <div className="absolute top-3 right-3 z-400 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 bg-card/80 backdrop-blur-sm"
            onClick={handleCenterBus}
            title="Center on bus"
          >
            <Navigation className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 bg-card/80 backdrop-blur-sm"
            onClick={handleCenterSchool}
            title="Center on school"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!connected && (
        <div className="absolute bottom-3 left-3 z-500">
          <Badge variant="warning" dot className="flex items-center gap-1">
            <WifiOff className="h-3 w-3" />
            Connection Lost
          </Badge>
        </div>
      )}
    </div>
  );
}