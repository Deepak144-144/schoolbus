import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { ChildInfoCard } from "@/components/parent/ChildInfoCard";
import { ChildSafetyStatusCard } from "@/components/parent/ChildSafetyStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bus, GraduationCap, Clock, MapPin, School } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function getChildData(parentUserId: string) {
  const parent = await prisma.parent.findUnique({
    where: { userId: parentUserId },
    include: {
      children: {
        include: {
          bus: {
            include: {
              driver: { include: { user: true } },
              route: { include: { stops: { orderBy: { stopOrder: "asc" } } } },
            },
          },
          pickupStop: true,
          dropoffStop: true,
        },
      },
    },
  });

  if (!parent) return null;

  const children = parent.children.map((s) => ({
    id: s.id,
    name: s.name,
    studentId: s.studentId,
    class: s.class,
    section: s.section,
    busNumber: s.bus?.busNumber || "N/A",
    pickupStop: s.pickupStop?.stopName || "N/A",
    dropoffStop: s.dropoffStop?.stopName || "N/A",
    pickupTime: s.pickupStop?.estimatedTime || "N/A",
    expectedArrival: s.dropoffStop?.estimatedTime || "N/A",
    pickupStopId: s.pickupStopId,
    dropoffStopId: s.dropoffStopId,
    busId: s.busId,
    bus: s.bus
      ? {
          id: s.bus.id,
          busNumber: s.bus.busNumber,
          registrationNumber: s.bus.registrationNumber,
          driverName: s.bus.driver?.user?.name || "Unknown",
          driverPhone: s.bus.driver?.user?.phone || "",
          route: s.bus.route
            ? {
                id: s.bus.route.id,
                routeName: s.bus.route.routeName,
                school: s.bus.route.school,
                schoolLat: s.bus.route.schoolLat,
                schoolLng: s.bus.route.schoolLng,
                stops: s.bus.route.stops.map((s) => ({
                  id: s.id,
                  stopName: s.stopName,
                  latitude: s.latitude,
                  longitude: s.longitude,
                  estimatedTime: s.estimatedTime,
                  stopOrder: s.stopOrder,
                })),
              }
            : null,
        }
      : null,
  }));

  return {
    id: parent.id,
    children,
  };
}

export default async function ParentChildPage() {
  const user = await getAuthUser("PARENT");
  const data = await getChildData(user.id);

  if (!data || data.children.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No children found for this account.</p>
      </div>
    );
  }

  const child = data.children[0];
  const pickupTime = child.pickupTime;
  const expectedArrival = child.expectedArrival;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">{child.name}'s Profile</h1>
          <p className="text-secondary mt-1">
            {child.class} • Section {child.section} • ID: {child.studentId}
          </p>
        </div>
        <Link href="/parent">
          <Badge variant="primary" className="cursor-pointer">
            Back to Dashboard
          </Badge>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChildInfoCard child={child} />

        <Card className="border-border/30">
          <CardHeader>
            <CardTitle>Transportation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <Bus className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-secondary">Assigned Bus</p>
                  <p className="font-semibold text-primary">Bus {child.busNumber}</p>
                  {child.bus && <>
                    <p className="text-xs text-secondary mt-0.5">
                      Registration: {child.bus.registrationNumber}
                    </p>
                  </>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <School className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-secondary">School</p>
                  <p className="font-semibold text-primary">
                    {child.bus?.route?.school || "Greenwood Elementary"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-secondary">Pickup Stop</p>
                    <p className="font-semibold text-primary">{child.pickupStop}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-secondary">Drop-off Stop</p>
                    <p className="font-semibold text-primary">{child.dropoffStop}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-secondary">Pickup Time</p>
                    <p className="font-semibold text-primary">{pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-secondary">Expected Arrival</p>
                    <p className="font-semibold text-primary">{expectedArrival}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {child.bus && child.bus.route && (
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle>Daily Route Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {child.bus.route.stops.map((stop) => {
                const isPickup = stop.id === child.pickupStopId;
                const isDropoff = stop.id === child.dropoffStopId;
                return (
                  <div
                    key={stop.id}
                    className="flex items-center gap-4 p-3 bg-background rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-accent">
                        {stop.stopOrder}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">{stop.stopName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{stop.estimatedTime}</p>
                      {(isPickup || isDropoff) && (
                        <Badge variant="primary" className="text-xs mt-1">
                          {isPickup ? "Pickup" : "Drop-off"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
