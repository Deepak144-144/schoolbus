import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import BusesClient from "./BusesClient";
import { createBus, updateBus, deleteBus } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminBusesPage() {
  await getAuthUser("ADMIN");

  const buses = await prisma.bus.findMany({
    include: {
      driver: { include: { user: true } },
      route: true,
      _count: { select: { students: true } },
    },
    orderBy: { busNumber: "asc" },
  });

  const drivers = await prisma.driver.findMany({ include: { user: true } });
  const routes = await prisma.route.findMany();

  const serialized = buses.map((bus) => ({
    id: bus.id,
    busNumber: bus.busNumber,
    registrationNumber: bus.registrationNumber,
    capacity: bus.capacity,
    status: bus.status,
    driver: bus.driver ? { id: bus.driver.id, userId: bus.driver.userId, user: { name: bus.driver.user.name } } : null,
    route: bus.route ? { id: bus.route.id, routeName: bus.route.routeName } : null,
    lastGpsUpdate: bus.lastGpsUpdate,
    currentLat: bus.currentLat,
    currentLng: bus.currentLng,
    _count: { students: bus._count.students },
  }));

  const serializedDrivers = drivers.map((d) => ({
    id: d.id,
    userId: d.userId,
    user: { name: d.user.name },
  }));

  const serializedRoutes = routes.map((r) => ({
    id: r.id,
    routeName: r.routeName,
  }));

  return (
    <BusesClient
      buses={serialized}
      drivers={serializedDrivers}
      routes={serializedRoutes}
      createBus={createBus}
      updateBus={updateBus}
      deleteBus={deleteBus}
    />
  );
}
