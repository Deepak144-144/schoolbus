"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BusMap } from "@/components/maps/BusMap";
import { ChildSafetyStatusCard } from "@/components/parent/ChildSafetyStatus";
import { ChildInfoCard } from "@/components/parent/ChildInfoCard";
import {
  Navigation,
  Clock,
  Phone,
  Locate,
} from "lucide-react";
import { useBusTracking, useNotifications } from "@/lib/realtime";
import { formatDistance } from "@/lib/utils";
import { ChildSafetyStatus } from "@/lib/types";

interface LiveMapPageProps {
  bus: {
    id: string;
    busNumber: string;
    registrationNumber: string;
    driverName: string;
    driverPhone: string;
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
    } | null;
  };
  child: {
    id: string;
    name: string;
    studentId: string;
    class: string;
    section: string;
    busNumber: string;
    pickupStop: string;
    dropoffStop: string;
    pickupTime: string;
    expectedArrival: string;
    pickupStopId: string;
    dropoffStopId: string;
  };
  childStops: {
    pickup?: { id: string; stopName: string; latitude: number; longitude: number };
    dropoff?: { id: string; stopName: string; latitude: number; longitude: number };
  };
  userId: string;
}

export function LiveMapPage({ bus, child, childStops, userId }: LiveMapPageProps) {
  const [position, setPosition] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [safetyStatus, setSafetyStatus] = useState<ChildSafetyStatus>("waiting");

  useBusTracking(bus.id, (data) => {
    setPosition(data);
    setConnected(true);
    if (data.status === "moving") {
      setSafetyStatus("approaching");
    }
  });

  useNotifications(userId, (notification) => {
    if (notification.type === "BOARDED") {
      setSafetyStatus("boarded");
    }
  });

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col xl:flex-row gap-4">
      <div className="xl:w-[380px] xl:max-w-[380px] space-y-4 overflow-y-auto">
        <Card className="border-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Bus {bus.busNumber}</CardTitle>
              <Badge variant={connected ? "success" : "danger"} dot>
                {connected ? "Live" : "Offline"}
              </Badge>
            </div>
            <CardDescription>{bus.route?.routeName || "Route"}</CardDescription>
          </CardHeader>
          <CardContent>
            {position && (
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="p-2 bg-background rounded-xl">
                  <p className="text-xl font-bold text-primary">{position.eta || 8}</p>
                  <p className="text-xs text-secondary">ETA (min)</p>
                </div>
                <div className="p-2 bg-background rounded-xl">
                  <p className="text-xl font-bold text-primary">{formatDistance((position.distanceToNext || 2.4) * 1000)}</p>
                  <p className="text-xs text-secondary">Distance</p>
                </div>
                <div className="p-2 bg-background rounded-xl">
                  <p className="text-xl font-bold text-primary">{position.speed || 0}</p>
                  <p className="text-xs text-secondary">km/h</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-secondary">Current Stop</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {position?.currentStop || "En route"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-secondary">Next Stop</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {position?.nextStop || child.pickupStop}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-sm text-secondary">Driver</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {bus.driverName}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ChildInfoCard child={child} index={0} />
        <ChildSafetyStatusCard status={safetyStatus} childName={child.name} />

        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="text-lg">Route Stops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {bus.route?.stops.map((stop) => {
                const isChildPickup = stop.id === child.pickupStopId;
                const isChildDropoff = stop.id === child.dropoffStopId;
                return (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">{stop.stopOrder}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{stop.stopName}</p>
                      <p className="text-xs text-secondary">{stop.estimatedTime}</p>
                    </div>
                    {(isChildPickup || isChildDropoff) && (
                      <Badge variant="primary" className="text-xs">
                        {isChildPickup ? "Pickup" : "Drop-off"}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 h-[500px] xl:h-auto relative">
        {bus.route && (
          <BusMap
            busId={bus.id}
            userId={userId}
            role="PARENT"
            route={{
              id: bus.route.id,
              routeName: bus.route.routeName,
              school: bus.route.school,
              schoolLat: bus.route.schoolLat,
              schoolLng: bus.route.schoolLng,
              stops: bus.route.stops,
            }}
            childStops={childStops}
            showControls={true}
          height="h-full"
        />
        )}

        <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0 bg-card/80 backdrop-blur-sm"
            title="Center on bus"
          >
            <Locate className="h-4 w-4" />
          </Button>
        </div>

        {!connected && (
          <div className="absolute bottom-3 left-3 z-[500]">
            <Badge variant="warning" dot>
              Showing last known location
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}