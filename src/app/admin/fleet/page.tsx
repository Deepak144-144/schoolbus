import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { FleetTrackingMap } from "@/components/maps/DynamicFleetTrackingMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bus, Truck, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function getFleetData() {
  const user = await getAuthUser("ADMIN");

  const buses = await prisma.bus.findMany({
    include: {
      driver: { include: { user: true } },
      route: { include: { stops: { orderBy: { stopOrder: "asc" } } } },
      trips: { where: { status: "ACTIVE" }, include: { _count: { select: { attendance: true } } } },
    },
  });

  const emergencyAlerts = await prisma.emergencyAlert.findMany({
    where: { status: "ACTIVE" },
    include: { bus: true, driver: { include: { user: true } } },
  });

  const trips = await prisma.trip.findMany({
    where: { status: "ACTIVE" },
    include: {
      bus: true,
      driver: { include: { user: true } },
      _count: { select: { attendance: true } },
      gpsLocations: { orderBy: { timestamp: "desc" }, take: 1 },
    },
  });

  const fleetBuses = buses.map((bus) => {
    const activeTrip = trips.find((t) => t.busId === bus.id);
    const latestGps = activeTrip?.gpsLocations?.[0];

    return {
      id: bus.id,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      driverName: bus.driver?.user?.name || "Unassigned",
      driverPhone: bus.driver?.user?.phone || "",
      driverStatus: bus.driver?.status || "OFFLINE",
      routeName: bus.route?.routeName || "Unassigned",
      capacity: bus.capacity,
      status: bus.status,
      currentLat: latestGps?.latitude || bus.currentLat,
      currentLng: latestGps?.longitude || bus.currentLng,
      currentSpeed: latestGps?.speed || bus.currentSpeed,
      lastGpsUpdate: latestGps?.timestamp || bus.lastGpsUpdate,
      studentsOnboard: bus.trips.length > 0 ? bus.trips[0]._count.attendance : 0,
      totalStudents: 0,
      isEmergency: false,
      isDemo: process.env.DEMO_MODE === "true",
    };
  });

  return {
    buses: fleetBuses,
    emergencyAlerts: emergencyAlerts.map((a) => ({
      id: a.id,
      busNumber: a.bus.busNumber,
      driverName: a.driver.user.name,
      latitude: a.latitude,
      longitude: a.longitude,
      message: a.message,
      createdAt: a.createdAt,
    })),
  };
}

export default async function AdminFleetPage() {
  const user = await getAuthUser("ADMIN");
  const data = await getFleetData();

  const activeCount = data.buses.filter((b) => b.currentLat).length;
  const stoppedCount = data.buses.filter((b) => b.driverStatus === "ON_ROUTE").length;
  const emergencyCount = data.emergencyAlerts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Live Fleet Tracking</h1>
        <div className="flex gap-2">
          <Badge variant="success" dot>{activeCount} Active</Badge>
          <Badge variant="warning" dot>{stoppedCount} On Route</Badge>
          {emergencyCount > 0 && (
            <Badge variant="danger" dot>{emergencyCount} Emergency</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bus className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.buses.length}</p>
                <p className="text-sm text-secondary">Total Buses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-primary">{activeCount}</p>
                <p className="text-sm text-secondary">With GPS</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-primary">{stoppedCount}</p>
                <p className="text-sm text-secondary">On Route</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-emergency" />
              <div>
                <p className="text-2xl font-bold text-primary">{emergencyCount}</p>
                <p className="text-sm text-secondary">Emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30 h-[500px]">
        <CardHeader>
          <CardTitle>Fleet Map</CardTitle>
          <CardDescription>
            Real-time location of all active buses
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-80px)]">
          <FleetTrackingMap buses={data.buses} schoolId={user.schoolId || ""} />
        </CardContent>
      </Card>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>Fleet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 font-medium text-primary">Bus</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Driver</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Speed</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Last GPS</th>
                  <th className="text-left py-3 px-4 font-medium text-primary">Mode</th>
                </tr>
              </thead>
              <tbody>
                {data.buses.map((bus) => (
                  <tr key={bus.id} className="border-b border-border/20">
                    <td className="py-3 px-4 font-medium text-primary">Bus {bus.busNumber}</td>
                    <td className="py-3 px-4 text-secondary">{bus.driverName}</td>
                    <td className="py-3 px-4 text-secondary">{bus.routeName}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={bus.driverStatus === "ON_ROUTE" ? "success" : "neutral"}
                        dot
                      >
                        {bus.driverStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-secondary">
                      {bus.currentSpeed ? `${bus.currentSpeed} km/h` : "-"}
                    </td>
                    <td className="py-3 px-4 text-secondary">{bus.studentsOnboard}</td>
                    <td className="py-3 px-4 text-secondary">
                      {bus.lastGpsUpdate
                        ? new Date(bus.lastGpsUpdate).toLocaleTimeString()
                        : "No data"}
                    </td>
                    <td className="py-3 px-4">
                      {bus.isDemo && <Badge variant="warning">Demo</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data.emergencyAlerts.length > 0 && (
        <Card className="border border-emergency/30 bg-emergency/5">
          <CardHeader>
            <CardTitle className="text-emergency">Active Emergency Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.emergencyAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-emergency/10 rounded-xl">
                  <div className="font-semibold text-emergency">
                    Bus {alert.busNumber} - {alert.driverName}
                  </div>
                  <p className="text-sm text-secondary mt-1">{alert.message}</p>
                  <p className="text-xs text-secondary mt-2">
                    Location: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
