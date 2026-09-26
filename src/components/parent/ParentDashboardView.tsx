"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LiveTrackingCard } from "@/components/parent/LiveTrackingCard";
import { ChildInfoCard } from "@/components/parent/ChildInfoCard";
import { ChildSafetyStatusCard } from "@/components/parent/ChildSafetyStatus";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { BusMap } from "@/components/maps/BusMap";
import { ChildSafetyStatus } from "@/lib/types";
import { useBusTracking, useNotifications } from "@/lib/realtime";
import { NotificationData } from "@/lib/types";
import {
  Bus,
  Bell,
  Map as MapIcon,
  Clock,
  Route,
  RefreshCw,
} from "lucide-react";

interface ParentDashboardViewProps {
  data: {
    user: { id: string; name: string; email: string; phone?: string };
    children: Array<{
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
      busId: string | null;
    }>;
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
    } | null;
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      readStatus: boolean;
      createdAt: Date;
    }>;
    childStops: {
      pickup?: { id: string; stopName: string; latitude: number; longitude: number };
      dropoff?: { id: string; stopName: string; latitude: number; longitude: number };
    };
  };
}

export function ParentDashboardView({ data }: ParentDashboardViewProps) {
  const { user, children, bus, notifications: initialNotifications, childStops } = data;
  const child = children[0];

  const [position, setPosition] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>(
    initialNotifications.map((n) => ({
      ...n,
      read: n.readStatus,
      timestamp: n.createdAt,
      type: n.type,
    }))
  );

  const [safetyStatus, setSafetyStatus] = useState<ChildSafetyStatus>("waiting");

  useBusTracking(bus?.id || '', (data) => {
    setPosition(data);
    setConnected(true);
    if (data.status === "moving") {
      setSafetyStatus("approaching");
    }
  });

  useNotifications(user.id, (notification) => {
    if (notification.type === "BOARDED") {
      setSafetyStatus("boarded");
    }
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {!connected && (
        <div className="fixed top-4 right-4 z-50">
          <Badge variant="danger" dot>
            Connection Lost
          </Badge>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Good Morning, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-secondary mt-1">
            Here's your child's bus tracking information.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={connected ? "success" : "danger"} dot>
            {connected ? "Connected" : "Connecting..."}
          </Badge>
          {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" && (
            <Badge variant="warning" dot>
              DEMO MODE
            </Badge>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <Card className="border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl">Your Child's Bus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary">
                  Bus {bus?.busNumber || "12"}
                </h3>
                <Badge variant="success" dot>
                  On Route
                </Badge>
              </div>
            </div>

            {position && (
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{position.eta || 8} min</p>
                  <p className="text-xs text-secondary">ETA</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{(position.distanceToNext * 1000).toFixed(1)} km</p>
                  <p className="text-xs text-secondary">Distance</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{position.speed || 28} km/h</p>
                  <p className="text-xs text-secondary">Speed</p>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = "/parent/live-map")}
              leftIcon={<MapIcon className="h-5 w-5" />}
            >
              Track Live Bus
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-border/30">
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bus?.route && child && (
                <div className="h-[320px] rounded-b-[16px] overflow-hidden">
                  <BusMap
                    busId={bus.id}
                    userId={user.id}
                    role="PARENT"
                    route={bus.route}
                    childStops={childStops}
                    showControls={true}
                    height="h-[320px]"
                    compact={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <LiveTrackingCard
            bus={bus!}
            position={position}
          />
        </div>

        <div className="space-y-6">
          {child && (
            <>
              <ChildInfoCard child={child} />
              <ChildSafetyStatusCard status={safetyStatus} childName={child.name} />
            </>
          )}

          <Card className="border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Next Stop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-secondary">Current Stop</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {position?.currentStop || "En route to " + child?.pickupStop}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-secondary">ETA at pickup</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {position?.eta || 8} min
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-secondary">Your stop</span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {child?.pickupStop}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today's Route</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {bus?.route?.stops.map((stop) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/5 transition-colors"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-xs text-secondary">{stop.stopOrder}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{stop.stopName}</p>
                      <p className="text-xs text-secondary">{stop.estimatedTime}</p>
                    </div>
                    {stop.stopName === child?.pickupStop && (
                      <Badge variant="primary" className="text-xs">
                        Your stop
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card className="border-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
            </CardHeader>
            <CardContent>
              <NotificationCenter
                notifications={notifications}
                maxVisible={5}
                onMarkRead={handleMarkRead}
              />
            </CardContent>
          </Card>
</div>
      </div>
  );
}