import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bus, Users, School, Route, Truck, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function getAdminData() {
  const user = await getAuthUser("ADMIN");

  const [buses, students, drivers, routes, parents] = await Promise.all([
    prisma.bus.findMany({
      include: { driver: { include: { user: true } }, route: true },
    }),
    prisma.student.count(),
    prisma.driver.count(),
    prisma.route.count(),
    prisma.parent.count(),
  ]);

  const trips = await prisma.trip.findMany({
    where: { status: "ACTIVE" },
    include: { bus: true, driver: { include: { user: true } } },
  });

  const emergencyAlerts = await prisma.emergencyAlert.findMany({
    where: { status: "ACTIVE" },
    include: { bus: true, driver: { include: { user: true } } },
  });

  return {
    stats: {
      totalBuses: buses.length,
      activeBuses: buses.filter(b => b.status === "ACTIVE").length,
      totalStudents: students,
      totalDrivers: drivers,
      totalRoutes: routes,
      totalParents: parents,
      activeTrips: trips.length,
      emergencyAlerts: emergencyAlerts.length,
    },
    buses: buses.map(b => ({
      id: b.id,
      busNumber: b.busNumber,
      registrationNumber: b.registrationNumber,
      driverName: b.driver?.user?.name || "Unassigned",
      driverStatus: b.driver?.status || "OFFLINE",
      routeName: b.route?.routeName || "Unassigned",
      capacity: b.capacity,
      status: b.status,
      currentLat: b.currentLat,
      currentLng: b.currentLng,
      currentSpeed: b.currentSpeed,
      lastGpsUpdate: b.lastGpsUpdate,
    })),
    activeTrips: trips.map(t => ({
      id: t.id,
      busNumber: t.bus.busNumber,
      driverName: t.driver.user.name,
      startTime: t.startTime,
      status: t.status,
    })),
    emergencyAlerts: emergencyAlerts.map(a => ({
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

export default async function AdminDashboardPage() {
  const data = await getAdminData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bus className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.totalBuses}</p>
                <p className="text-sm text-secondary">Total Buses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.activeBuses}</p>
                <p className="text-sm text-secondary">Active Buses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.totalStudents}</p>
                <p className="text-sm text-secondary">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <School className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.totalDrivers}</p>
                <p className="text-sm text-secondary">Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.totalRoutes}</p>
                <p className="text-sm text-secondary">Routes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.totalParents}</p>
                <p className="text-sm text-secondary">Parents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.activeTrips}</p>
                <p className="text-sm text-secondary">Active Trips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-emergency" />
              <div>
                <p className="text-2xl font-bold text-primary">{data.stats.emergencyAlerts}</p>
                <p className="text-sm text-secondary">Active Emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30">
        <CardHeader>
          <CardTitle>Active Buses</CardTitle>
          <CardDescription>
            {data.activeTrips.length} trip(s) currently active
          </CardDescription>
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
                  <th className="text-left py-3 px-4 font-medium text-primary">GPS</th>
                </tr>
              </thead>
              <tbody>
                {data.buses.map((bus) => (
                  <tr key={bus.id} className="border-b border-border/20">
                    <td className="py-3 px-4 font-medium text-primary">
                      Bus {bus.busNumber}
                    </td>
                    <td className="py-3 px-4 text-secondary">{bus.driverName}</td>
                    <td className="py-3 px-4 text-secondary">{bus.routeName}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          bus.driverStatus === "ON_ROUTE"
                            ? "success"
                            : bus.driverStatus === "OFFLINE"
                            ? "danger"
                            : "neutral"
                        }
                        dot
                      >
                        {bus.driverStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-secondary">
                      {bus.currentLat && bus.currentLng
                        ? `${bus.currentLat.toFixed(4)}, ${bus.currentLng.toFixed(4)}`
                        : "No data"}
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
            <CardTitle className="text-emergency flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Active Emergency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.emergencyAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-emergency/10 rounded-xl border border-emergency/20">
                  <div className="font-medium text-emergency">
                    Bus {alert.busNumber} - {alert.driverName}
                  </div>
                  <p className="text-sm text-secondary mt-1">
                    {alert.message || "Emergency alert activated"}
                  </p>
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
