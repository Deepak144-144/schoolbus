import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { DriverDashboardView } from "@/components/driver/DriverDashboardView";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function getDriverData(userId: string) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      user: true,
      assignedBus: {
        include: {
          route: {
            include: {
              stops: { orderBy: { stopOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!driver || !driver.assignedBus) {
    return null;
  }

  const bus = driver.assignedBus;
  const route = bus.route;

  const students = await prisma.student.findMany({
    where: {
      busId: bus.id,
    },
    include: {
      parent: { include: { user: true } },
      pickupStop: true,
      dropoffStop: true,
    },
  });

  const activeTrip = await prisma.trip.findFirst({
    where: { busId: bus.id, status: "ACTIVE" },
  });

  const recentTrips = await prisma.trip.findMany({
    where: { busId: bus.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    driver: {
      id: driver.id,
      userId: driver.userId,
      name: driver.user.name,
      email: driver.user.email,
      phone: driver.user.phone || "",
      licenseInfo: driver.licenseInfo || "",
      status: driver.status as string,
    },
    bus: {
      id: bus.id,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      capacity: bus.capacity,
      status: bus.status as string,
    },
    route: route
      ? {
          id: route.id,
          routeName: route.routeName,
          school: route.school,
          schoolLat: route.schoolLat,
          schoolLng: route.schoolLng,
          stops: route.stops.map((s) => ({
            id: s.id,
            stopName: s.stopName,
            latitude: s.latitude,
            longitude: s.longitude,
            estimatedTime: s.estimatedTime,
            stopOrder: s.stopOrder,
          })),
        }
      : null,
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      studentId: s.studentId,
      class: s.class,
      section: s.section,
      parentName: s.parent?.user?.name || "",
      parentPhone: s.parent?.user?.phone || "",
      pickupStop: s.pickupStop?.stopName || "",
      dropoffStop: s.dropoffStop?.stopName || "",
      status: "WAITING",
    })),
    activeTrip: activeTrip
      ? {
          id: activeTrip.id,
          startTime: activeTrip.startTime,
          status: activeTrip.status,
        }
      : null,
    recentTrips: recentTrips.map((t) => ({
      id: t.id,
      startTime: t.startTime,
      endTime: t.endTime,
      status: t.status,
      createdAt: t.createdAt,
    })),
    schoolId: route?.schoolId || "",
  };
}

export default async function DriverDashboardPage() {
  const user = await getAuthUser("DRIVER");
  const data = await getDriverData(user.id);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary">No bus assigned to this driver.</p>
      </div>
    );
  }

  return <DriverDashboardView data={data} />;
}
