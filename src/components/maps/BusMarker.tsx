"use client";

import { divIcon, LatLngExpression } from "leaflet";
import type { DivIcon } from "leaflet";
import { Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export const busIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#6B8E6E;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M10 17h4v-1a4 4 0 0 1 4-4V7a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v5a4 4 0 0 1 4 4z"/><path d="M5 17h14v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/></svg>
    </div>
  `,
  className: "bus-icon",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

export const schoolIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#3B3028;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    </div>
  `,
  className: "school-icon",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

export const stopIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#75685C;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  className: "stop-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export const pickupIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#6B8E6E;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  className: "pickup-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export const dropoffIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#10B981;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
  `,
  className: "dropoff-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export const parentIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#6B8E6E;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.12);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="7" r="4"/><path d="M5.5 20a7.5 7.5 0 0 1 13 0"/></svg>
    </div>
  `,
  className: "parent-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export const emergencyIcon: DivIcon = divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:#C85C5C;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid #fff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h17a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div>
  `,
  className: "emergency-icon",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

export function getBusHeadingIcon(heading: number): DivIcon {
  return divIcon({
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;background:#6B8E6E;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid #fff;transform:rotate(${heading}deg);">
        <div style="transform:rotate(-${heading}deg);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 18V5l10 7-10 7z"/></svg>
        </div>
      </div>
    `,
    className: "bus-heading-icon",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });
}

export interface BusMarkerProps {
  position: LatLngExpression;
  heading?: number;
  popupContent?: React.ReactNode;
  onClick?: () => void;
}

export function BusMarker({ position, heading = 0, popupContent, onClick }: BusMarkerProps) {
  const icon = heading > 0 ? getBusHeadingIcon(heading) : busIcon;
  return (
    <Marker position={position} icon={icon} eventHandlers={onClick ? { click: onClick } : undefined}>
      {popupContent && <Popup>{popupContent}</Popup>}
    </Marker>
  );
}

export function RoutePolyline({
  positions,
  color = "#6B8E6E",
  weight = 4,
  opacity = 0.6,
  dashArray,
}: {
  positions: LatLngExpression[];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}) {
  return <Polyline positions={positions} pathOptions={{ color, weight, opacity, dashArray }} />;
}

export function SchoolMarker({
  position,
  name,
}: {
  position: LatLngExpression;
  name: string;
}) {
  return (
    <Marker position={position} icon={schoolIcon}>
      <Popup>
        <div className="text-center">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-secondary">School</div>
        </div>
      </Popup>
    </Marker>
  );
}

export function StopMarker({
  position,
  name,
  isPickup = false,
  isDropoff = false,
  isChildStop = false,
}: {
  position: LatLngExpression;
  name: string;
  isPickup?: boolean;
  isDropoff?: boolean;
  isChildStop?: boolean;
}) {
  const icon = isChildStop ? (isPickup ? pickupIcon : dropoffIcon) : stopIcon;
  const iconType = isChildStop ? (isPickup ? "Pickup" : "Dropoff") : "Bus Stop";
  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="text-center min-w-[120px]">
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-secondary">{iconType}</div>
        </div>
      </Popup>
    </Marker>
  );
}
