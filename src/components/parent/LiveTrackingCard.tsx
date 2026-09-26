"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Bus,
  Clock,
  Navigation,
  Phone,
  User,
  MapPin,
  Activity,
  Route,
} from "lucide-react";
import { cn, formatDistance } from "@/lib/utils";

interface LiveTrackingCardProps {
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
  position: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    status: string;
    timestamp: number;
    busNumber: string;
    isDemo: boolean;
    currentStop?: string;
    nextStop?: string;
    progress?: number;
    eta?: number;
    distanceToNext?: number;
  } | null;
}

export function LiveTrackingCard({ bus, position }: LiveTrackingCardProps) {
  const eta = position?.eta ?? 8;
  const distance = (position?.distanceToNext ?? 2.4) * 1000;
  const speed = position?.speed ?? 0;

  return (
    <Card className="border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Live Bus Tracking</CardTitle>
          {position?.isDemo && (
            <Badge variant="warning" dot>
              DEMO MODE
            </Badge>
          )}
        </div>
        <CardDescription>
          Bus {bus.busNumber} • {bus.route?.routeName || "Route"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex flex-col items-center p-3 bg-background rounded-xl">
            <Badge
              variant={position?.status === "moving" ? "success" : "neutral"}
              dot
              className="mb-1"
            >
              {position?.status === "moving" ? "Moving" : "Stopped"}
            </Badge>
            <span className="text-xs text-secondary">Status</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-background rounded-xl">
            <div className="text-2xl font-bold text-primary">{eta} min</div>
            <span className="text-xs text-secondary">ETA</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-background rounded-xl">
            <div className="text-2xl font-bold text-primary">{formatDistance(distance)}</div>
            <span className="text-xs text-secondary">Distance</span>
          </div>

          <div className="flex flex-col items-center p-3 bg-background rounded-xl">
            <div className="text-2xl font-bold text-primary">{speed} km/h</div>
            <span className="text-xs text-secondary">Speed</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Current Stop</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {position?.currentStop || "School"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Next Stop</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {position?.nextStop || "Destination"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-background rounded-xl">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-secondary" />
              <span className="text-sm text-secondary">Driver</span>
            </div>
            <span className="text-sm font-medium text-primary">
              {bus.driverName}
            </span>
          </div>

          {bus.driverPhone && (
            <div className="flex items-center justify-between p-3 bg-background rounded-xl">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                <span className="text-sm text-secondary">Driver Phone</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {bus.driverPhone}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
