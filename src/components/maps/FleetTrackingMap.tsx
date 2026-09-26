"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { useFleetTracking, useEmergencyAlerts } from "@/lib/realtime";
import { MAP_CONFIG } from "@/lib/map/utils";
import { Bus as BusIcon, AlertCircle, MapPin } from "lucide-react";

const fleetBusIcon = (status: string, isEmergency: boolean = false) => divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;
                background:${isEmergency ? "#C85C5C" : "#6B8E6E"};border-radius:50%;
                box-shadow:0 0 8px rgba(0,0,0,0.3);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M10 17h4v-1a4 4 0 0 1 4-4V7a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v5a4 4 0 0 1 4 4z"/>
        <path d="M5 17h14v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>
      </svg>
    </div>
  `,
  className: "fleet-bus-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const emergencyIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;
                background:#C85C5C;border-radius:50%;box-shadow:0 0 12px #C85C5C;
                border:2px solid #fff;animation:pulse 1s infinite;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h17a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `,
  className: "emergency-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface FleetBus {
  id: string;
  busNumber: string;
  driverName: string;
  driverPhone: string;
  driverStatus: string;
  routeName: string;
  capacity: number;
  status: string;
  currentLat: number | null;
  currentLng: number | null;
  currentSpeed: number | null;
  lastGpsUpdate: Date | string | null;
  studentsOnboard: number;
  isEmergency: boolean;
  isDemo: boolean;
}

interface FleetTrackingMapProps {
  buses: FleetBus[];
  schoolId: string;
}

const getStatusColor = (status: string, isEmergency: boolean) => {
  if (isEmergency) return "#C85C5C";
  if (status === "ON_ROUTE") return "#6B8E6E";
  if (status === "OFFLINE") return "#9CA3AF";
  return "#F59E0B";
};

export function FleetTrackingMap({ buses, schoolId }: FleetTrackingMapProps) {
  const [livePositions, setLivePositions] = useState<Record<string, any>>({});
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    MAP_CONFIG.DEFAULT_CENTER.lat,
    MAP_CONFIG.DEFAULT_CENTER.lng,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  useFleetTracking(schoolId, (data) => {
    setLivePositions((prev) => ({
      ...prev,
      [data.busId]: data,
    }));
  });

  useEffect(() => {
    const emergencyCleanup = useEmergencyAlerts((data) => {
      setLivePositions((prev) => ({
        ...prev,
        [data.busId]: { ...data, isEmergency: true },
      }));
    });

    return emergencyCleanup;
  }, []);

  const busesWithPosition = buses
    .filter((b) => b.currentLat && b.currentLng)
    .map((bus) => {
      const live = livePositions[bus.id];
      return {
        ...bus,
        lat: live?.lat ?? bus.currentLat!,
        lng: live?.lng ?? bus.currentLng!,
        speed: live?.speed ?? bus.currentSpeed,
        isEmergency: live?.isEmergency ?? bus.isEmergency,
      };
    });

  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {busesWithPosition.map((bus) => (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lng]}
            icon={bus.isEmergency ? emergencyIcon : fleetBusIcon(bus.driverStatus, bus.isEmergency)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-semibold text-sm mb-1">
                  Bus {bus.busNumber}
                  {bus.isDemo && <span className="text-xs text-amber-500"> (Demo)</span>}
                </div>
                <div className="text-xs text-secondary space-y-0.5">
                  <div>Driver: {bus.driverName}</div>
                  <div>Route: {bus.routeName}</div>
                  <div>Speed: {Math.round(bus.speed || 0)} km/h</div>
                  <div>Students: {bus.studentsOnboard}</div>
                  {bus.lastGpsUpdate && (
                    <div>
                      Last GPS:{" "}
                      {new Date(bus.lastGpsUpdate).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {busesWithPosition.length > 1 && (
          <Polyline
            positions={busesWithPosition.map((b) => [b.lat, b.lng] as [number, number])}
            pathOptions={{ color: "#6B8E6E", weight: 2, opacity: 0.4, dashArray: "5, 5" }}
          />
        )}
      </MapContainer>
    </div>
  );
}