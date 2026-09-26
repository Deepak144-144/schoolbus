"use client";

import dynamic from "next/dynamic";

const FleetTrackingMap = dynamic(
  () => import("@/components/maps/FleetTrackingMap").then((mod) => mod.FleetTrackingMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-accent/5 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
          <p className="text-sm text-secondary">Loading map...</p>
        </div>
      </div>
    ),
  }
);

export { FleetTrackingMap };
