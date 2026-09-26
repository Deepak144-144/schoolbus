import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import DriversClient from "./DriversClient";
import { createDriver, updateDriver, deleteDriver } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminDriversPage() {
  await getAuthUser("ADMIN");

  const drivers = await prisma.driver.findMany({
    include: {
      user: true,
      assignedBus: true,
    },
    orderBy: { user: { name: "asc" } },
  });

  const allUsers = await prisma.user.findMany({
    where: {
      OR: [{ role: "DRIVER" }, { role: "PARENT" }],
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const allBuses = await prisma.bus.findMany({
    select: { id: true, busNumber: true },
    orderBy: { busNumber: "asc" },
  });

  const serializedDrivers = drivers.map((d) => ({
    id: d.id,
    userId: d.userId,
    licenseInfo: d.licenseInfo,
    assignedBusId: d.assignedBusId,
    status: d.status,
    user: { name: d.user.name, email: d.user.email, phone: d.user.phone },
    assignedBus: d.assignedBus ? { id: d.assignedBus.id, busNumber: d.assignedBus.busNumber } : null,
  }));

  return (
    <DriversClient
      drivers={serializedDrivers}
      allUsers={allUsers}
      allBuses={allBuses}
      createDriver={createDriver}
      updateDriver={updateDriver}
      deleteDriver={deleteDriver}
    />
  );
}
