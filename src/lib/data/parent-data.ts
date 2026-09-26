import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { calculateDistance, calculateEta, formatDistance } from "@/lib/map/utils";

export interface ParentDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
}

export async function getDashboardData(): Promise<ParentDashboardData | null> {
  const user = await getAuthUser("PARENT");

  if (!user) return null;

  const parent = user.parent;
  if (!parent?.id) return null;

  const students = await prisma.student.findMany({
    where: {
      parentId: parent.id,
    },
    include: {
      bus: {
        include: {
          driver: { include: { user: true } },
          route: {
            include: {
              stops: { orderBy: { stopOrder: "asc" } },
            },
          },
        },
      },
      pickupStop: true,
      dropoffStop: true,
    },
  });

  const children = students.map((s) => ({
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
  }));

  let busData = null;
  if (students.length > 0 && students[0].bus) {
    const bus = students[0].bus;
    busData = {
      id: bus.id,
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      driverName: bus.driver?.user?.name || "Unknown",
      driverPhone: bus.driver?.user?.phone || "",
      route: bus.route
        ? {
            id: bus.route.id,
            routeName: bus.route.routeName,
            school: bus.route.school,
            schoolLat: bus.route.schoolLat,
            schoolLng: bus.route.schoolLng,
            stops: bus.route.stops.map((s) => ({
              id: s.id,
              stopName: s.stopName,
              latitude: s.latitude,
              longitude: s.longitude,
              estimatedTime: s.estimatedTime,
              stopOrder: s.stopOrder,
            })),
          }
        : null,
    };
  }

  const childStops = {
    pickup: students[0]?.pickupStop
      ? {
          id: students[0].pickupStop.id,
          stopName: students[0].pickupStop.stopName,
          latitude: students[0].pickupStop.latitude,
          longitude: students[0].pickupStop.longitude,
        }
      : undefined,
    dropoff: students[0]?.dropoffStop
      ? {
          id: students[0].dropoffStop.id,
          stopName: students[0].dropoffStop.stopName,
          latitude: students[0].dropoffStop.latitude,
          longitude: students[0].dropoffStop.longitude,
        }
      : undefined,
  };

  const notifications = students[0]?.busId
    ? await prisma.notification.findMany({
        where: {
          userId: user.id,
          relatedBusId: students[0].busId,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    children,
    bus: busData,
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      readStatus: n.readStatus,
      createdAt: n.createdAt,
    })),
    childStops,
  };
}
