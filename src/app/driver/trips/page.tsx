import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Clock, Bus, Route, Users, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function getDriverTrips(userId: string) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: { user: true, assignedBus: { include: { route: true } } },
  });

  if (!driver) return null;

  const trips = await prisma.trip.findMany({
    where: { driverId: driver.id },
    include: {
      bus: true,
      route: true,
      gpsLocations: { orderBy: { timestamp: "desc" }, take: 1 },
      _count: { select: { attendance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    driverName: driver.user.name,
    busNumber: driver.assignedBus?.busNumber || "N/A",
    trips: trips.map((t) => ({
      id: t.id,
      busNumber: t.bus.busNumber,
      routeName: t.route?.routeName || "N/A",
      startTime: t.startTime,
      endTime: t.endTime,
      status: t.status,
      studentCount: t._count.attendance,
      lastGps: t.gpsLocations[0]
        ? {
            lat: t.gpsLocations[0].latitude,
            lng: t.gpsLocations[0].longitude,
            time: t.gpsLocations[0].timestamp,
          }
        : null,
    })),
  };
}

export default async function DriverTripsPage() {
  const user = await getAuthUser("DRIVER");
  const data = await getDriverTrips(user.id);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No driver profile found.</p>
      </div>
    );
  }

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="h-4 w-4" />,
    ACTIVE: <Bus className="h-4 w-4 text-green-500" />,
    COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
    CANCELLED: <Clock className="h-4 w-4 text-gray-400" />,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Trip History</h1>

      <div className="flex items-center gap-4 mb-4">
        <Badge variant="primary" dot>
          Bus {data.busNumber}
        </Badge>
        <span className="text-secondary">Driver: {data.driverName}</span>
      </div>

      <div className="space-y-4">
        {data.trips.length === 0 ? (
          <Card className="border-border/30">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-secondary/30 mx-auto mb-3" />
              <p className="text-secondary">No trips recorded yet.</p>
            </CardContent>
          </Card>
        ) : (
          data.trips.map((trip) => (
            <Card key={trip.id} className="border-border/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Bus {trip.busNumber} • {trip.routeName}
                  </CardTitle>
                  <Badge
                    variant={
                      trip.status === "ACTIVE"
                        ? "success"
                        : trip.status === "COMPLETED"
                        ? "neutral"
                        : "warning"
                    }
                    dot
                  >
                    {trip.status}
                  </Badge>
                </div>
                <CardDescription>
                  {trip.startTime
                    ? new Date(trip.startTime).toLocaleString()
                    : "Scheduled"}
                  {trip.endTime
                    ? ` - ${new Date(trip.endTime).toLocaleString()}`
                    : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-secondary" />
                    <span className="text-secondary">Students:</span>
                    <span className="font-medium text-primary">{trip.studentCount}</span>
                  </div>
                  {trip.lastGps && (
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-secondary" />
                      <span className="text-secondary">Last GPS:</span>
                      <span className="font-medium text-primary">
                        {trip.lastGps.lat.toFixed(4)}, {trip.lastGps.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
