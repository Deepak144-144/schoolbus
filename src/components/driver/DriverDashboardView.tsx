"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmergencyButton } from "@/components/driver/EmergencyButton";
import {
  Bus,
  Play,
  Square,
  Clock,
  Users,
  Route as RouteIcon,
  Map,
  CheckCircle,
  Truck,
  Pause,
} from "lucide-react";
import { useBusTracking, useFleetTracking } from "@/lib/realtime";
import { cn, formatTime } from "@/lib/utils";

interface DriverDashboardViewProps {
  data: {
    driver: {
      id: string;
      userId: string;
      name: string;
      email: string;
      phone: string;
      licenseInfo: string | null;
      status: string;
    };
    bus: {
      id: string;
      busNumber: string;
      registrationNumber: string;
      capacity: number;
      status: string;
    };
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
    students: Array<{
      id: string;
      name: string;
      studentId: string;
      class: string;
      section: string;
      parentName: string;
      parentPhone: string;
      pickupStop: string;
      dropoffStop: string;
      status: string;
    }>;
    activeTrip: {
      id: string;
      startTime: Date | null;
      status: string;
    } | null;
    recentTrips: Array<{
      id: string;
      startTime: Date | null;
      endTime: Date | null;
      status: string;
      createdAt: Date;
    }>;
    schoolId: string;
  };
}

export function DriverDashboardView({ data }: DriverDashboardViewProps) {
  const { driver, bus, route, students, activeTrip: initialTrip, schoolId } = data;
  const [routeActive, setRouteActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [studentsOnboard, setStudentsOnboard] = useState(0);
  const [trip, setTrip] = useState(initialTrip);
  const [showEmergency, setShowEmergency] = useState(false);
  const [studentStatus, setStudentStatus] = useState<Record<string, string>>({});
  const [gpsPermission, setGpsPermission] = useState<"granted" | "denied" | "pending">("pending");
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online");

  useEffect(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsPermission("granted");
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        () => {
          setGpsPermission("denied");
        }
      );
    }
  }, []);

  const handleStartRoute = async () => {
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: bus.id,
          driverId: driver.id,
          routeId: route?.id,
        }),
      });
      const result = await res.json();
      if (result.trip) {
        setTrip({
          id: result.trip.id,
          startTime: result.trip.startTime,
          status: result.trip.status,
        });
        setRouteActive(true);

        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
          const watchId = navigator.geolocation.watchPosition(
            (pos) => {
              const location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                speed: pos.coords.speed ? pos.coords.speed * 3.6 : 0,
                heading: pos.coords.heading || 0,
                accuracy: pos.coords.accuracy,
              };
              setCurrentLocation({ ...location, timestamp: Date.now() });
              setLastGpsUpdate(new Date());

              fetch("/api/gps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  busId: bus.id,
                  tripId: result.trip.id,
                  lat: location.lat,
                  lng: location.lng,
                  speed: location.speed,
                  heading: location.heading,
                }),
              });
            },
            (err) => {
              console.error("GPS error:", err);
              setConnectionStatus("offline");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
          );

          return () => navigator.geolocation.clearWatch(watchId);
        }
      }
    } catch (error) {
      console.error("Start route error:", error);
    }
  };

  const handleEndRoute = async () => {
    if (trip) {
      await fetch("/api/trips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trip.id, status: "COMPLETED", endTime: new Date().toISOString() }),
      });
    }
    setRouteActive(false);
    setTrip(null);
  };

  const handleMarkBoarded = (studentId: string) => {
    setStudentStatus((prev) => ({ ...prev, [studentId]: "BOARDED" }));
    setStudentsOnboard((prev) => prev + 1);
  };

  const handleMarkDropped = (studentId: string) => {
    setStudentStatus((prev) => ({ ...prev, [studentId]: "DROPPED_OFF" }));
    setStudentsOnboard((prev) => Math.max(0, prev - 1));
  };

  const handleNextStop = () => {
    if (route && currentStopIndex < route.stops.length - 1) {
      setCurrentStopIndex((prev) => prev + 1);
    }
  };

  const handleEmergency = async (message: string) => {
    try {
      await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: bus.id,
          message,
          lat: currentLocation?.lat || 0,
          lng: currentLocation?.lng || 0,
        }),
      });
      setShowEmergency(false);
    } catch (error) {
      console.error("Emergency alert error:", error);
    }
  };

  const currentStop = route?.stops[currentStopIndex];
  const nextStop = route?.stops[currentStopIndex + 1];

  useFleetTracking(schoolId, (data) => {
    if (data.busId === bus.id) {
      setCurrentLocation(data);
      setLastGpsUpdate(new Date(data.timestamp));
      setConnectionStatus("online");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Driver Dashboard</h1>
          <p className="text-secondary mt-1">
            Bus {bus.busNumber} • {driver.name}
          </p>
        </div>
        <Badge
          variant={routeActive ? "success" : "neutral"}
          dot
          className="text-sm"
        >
          {routeActive ? "Route Active" : "Route Inactive"}
        </Badge>
      </div>

      {!routeActive && (
        <Card className="border-border/30 text-center">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                <Bus className="h-10 w-10 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-1">
                  Ready to Start Route?
                </h3>
                <p className="text-secondary mb-4">
                  Bus {bus.busNumber} • Route: {route?.routeName || "N/A"}
                </p>
                <p className="text-sm text-secondary mb-6">
                  Students: {students.length} • Capacity: {bus.capacity}
                </p>
              </div>
              <Button
                variant="primary"
                size="xl"
                className="font-bold text-xl py-8 px-10 shadow-xl"
                leftIcon={<Play className="h-6 w-6" />}
                onClick={handleStartRoute}
              >
                START ROUTE
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {routeActive && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <Card className="border-border/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {currentStop?.stopName || "En route"}
                </div>
                <p className="text-xs text-secondary">Current Stop</p>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {nextStop?.stopName || "Destination reached"}
                </div>
                <p className="text-xs text-secondary">Next Stop</p>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {studentsOnboard}/{students.length}
                </div>
                <p className="text-xs text-secondary">Students Onboard</p>
              </CardContent>
            </Card>

            <Card className="border-border/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : "GPS unavailable"}
                </div>
                <p className="text-xs text-secondary">
                  Last update: {lastGpsUpdate ? formatTime(lastGpsUpdate) : "Never"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card className="border-border/30">
                <CardHeader>
                  <CardTitle>Route Progress</CardTitle>
                  <CardDescription>
                    {currentStopIndex + 1} of {route?.stops.length} stops completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {route?.stops.map((stop, index) => {
                      const isCompleted = index < currentStopIndex;
                      const isCurrent = index === currentStopIndex;
                      const isNext = index === currentStopIndex + 1;

                      return (
                        <div
                          key={stop.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all",
                            isCompleted
                              ? "bg-green-50/30"
                              : isCurrent
                              ? "bg-accent/10 border-2 border-accent"
                              : isNext
                              ? "bg-blue-50/30 border border-blue-200"
                              : "bg-background"
                          )}
                        >
                          <div className={cn(
                            "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                              ? "bg-accent text-white"
                              : isNext
                              ? "bg-blue-400 text-white"
                              : "bg-secondary/20 text-secondary"
                          )}>
                            {isCompleted ? <CheckCircle className="h-4 w-4" /> : stop.stopOrder}
                          </div>
                          <div className="flex-1">
                            <p className={cn(
                              "text-sm font-medium",
                              isCompleted ? "text-green-700 line-through" : "text-primary"
                            )}>
                              {stop.stopName}
                            </p>
                            <p className="text-xs text-secondary">{stop.estimatedTime}</p>
                          </div>
                          {isCurrent && (
                            <Badge variant="primary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={handleNextStop}
                      disabled={currentStopIndex >= (route?.stops.length || 0) - 1}
                      leftIcon={<RouteIcon className="h-4 w-4" />}
                    >
                      Next Stop
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={handleEndRoute}
                      leftIcon={<Square className="h-4 w-4" />}
                    >
                      End Route
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/30">
                <CardHeader>
                  <CardTitle>Onboard Students</CardTitle>
                  <CardDescription>
                    {studentsOnboard} of {students.length} students have boarded
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {students.map((student) => {
                      const status = studentStatus[student.id] || student.status;
                      const isBoarded = status.includes("BOARDED");
                      const isDropped = status.includes("DROPPED");

                      return (
                        <div
                          key={student.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all",
                            isDropped ? "bg-green-50/30 border-green-200" :
                            isBoarded ? "bg-accent/5 border-accent" :
                            "border-border/30 bg-background"
                          )}
                        >
                          <div>
                            <p className="font-medium text-primary">{student.name}</p>
                            <p className="text-xs text-secondary">
                              {student.class} • {student.pickupStop}
                            </p>
                            {status === "BOARDED" && (
                              <Badge variant="success" className="text-xs mt-1">
                                Boarded
                              </Badge>
                            )}
                            {status === "DROPPED_OFF" && (
                              <Badge variant="success" className="text-xs mt-1">
                                Dropped Off
                              </Badge>
                            )}
                          </div>
                          {!isBoarded && !isDropped && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkBoarded(student.id)}
                            >
                              Boarded
                            </Button>
                          )}
                          {isBoarded && !isDropped && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkDropped(student.id)}
                            >
                              Drop Off
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/30">
                <CardHeader>
                  <CardTitle>GPS Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                      <span className="text-sm text-secondary">Status</span>
                      <span className="text-sm font-medium text-primary">
                        {gpsPermission === "granted" ? "✓ GPS Active" : "✗ GPS Unavailable"}
                      </span>
                    </div>
                    {currentLocation && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                          <span className="text-sm text-secondary">Latitude</span>
                          <span className="text-sm font-medium text-primary">
                            {currentLocation.lat.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                          <span className="text-sm text-secondary">Longitude</span>
                          <span className="text-sm font-medium text-primary">
                            {currentLocation.lng.toFixed(6)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                          <span className="text-sm text-secondary">Speed</span>
                          <span className="text-sm font-medium text-primary">
                            {currentLocation.speed ? Math.round(currentLocation.speed) + " km/h" : "0 km/h"}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                      <span className="text-sm text-secondary">Last Update</span>
                      <span className="text-sm font-medium text-primary">
                        {lastGpsUpdate ? formatTime(lastGpsUpdate) : "Never"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                      <span className="text-sm text-secondary">Connection</span>
                      <span className={cn(
                        "text-sm font-medium",
                        connectionStatus === "online" ? "text-green-600" : "text-emergency"
                      )}>
                        {connectionStatus === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <EmergencyButton onEmergency={handleEmergency} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}