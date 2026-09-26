"use client";

import { MapContainer as LeafletMapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/styles/leaflet.css";

const DEFAULT_CENTER: LatLngExpression = [40.7580, -73.9855];

export function MapContainer({
  center = DEFAULT_CENTER,
  zoom = 15,
  children,
  className = "h-full w-full rounded-xl",
}: {
  center?: LatLngExpression;
  zoom?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {children}
      </LeafletMapContainer>
    </div>
  );
}

export function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
