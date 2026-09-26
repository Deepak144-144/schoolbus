"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoute(formData: FormData) {
  const routeName = formData.get("routeName") as string;
  const school = formData.get("school") as string;
  const schoolLat = parseFloat(formData.get("schoolLat") as string) || 0;
  const schoolLng = parseFloat(formData.get("schoolLng") as string) || 0;

  await prisma.route.create({
    data: {
      routeName,
      school,
      schoolLat,
      schoolLng,
    },
  });
  revalidatePath("/admin/routes");
  revalidatePath("/admin/fleet");
  revalidatePath("/admin/buses");
}

export async function updateRoute(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.route.update({
    where: { id },
    data: {
      routeName: formData.get("routeName") as string,
      school: formData.get("school") as string,
      schoolLat: parseFloat(formData.get("schoolLat") as string) || 0,
      schoolLng: parseFloat(formData.get("schoolLng") as string) || 0,
    },
  });
  revalidatePath("/admin/routes");
  revalidatePath("/admin/fleet");
  revalidatePath("/admin/buses");
}

export async function deleteRoute(formData: FormData) {
  const id = formData.get("id") as string;
  
  const buses = await prisma.bus.findMany({ where: { routeId: id }, select: { id: true } });
  const busIds = buses.map((b) => b.id);
  if (busIds.length > 0) {
    await prisma.studentAttendance.deleteMany({ where: { trip: { busId: { in: busIds } } } });
    await prisma.gpsLocation.deleteMany({ where: { OR: [{ busId: { in: busIds } }, { trip: { busId: { in: busIds } } }] } });
    await prisma.emergencyAlert.deleteMany({ where: { OR: [{ busId: { in: busIds } }, { trip: { busId: { in: busIds } } }] } });
    await prisma.trip.deleteMany({ where: { busId: { in: busIds } } });
  }
  await prisma.studentAttendance.deleteMany({ where: { trip: { routeId: id } } });
  await prisma.gpsLocation.deleteMany({ where: { trip: { routeId: id } } });
  await prisma.emergencyAlert.deleteMany({ where: { trip: { routeId: id } } });
  await prisma.trip.deleteMany({ where: { routeId: id } });
  await prisma.bus.updateMany({ where: { routeId: id }, data: { routeId: null } });
  await prisma.busStop.deleteMany({ where: { routeId: id } });
  
  await prisma.route.delete({ where: { id } });
  revalidatePath("/admin/routes");
  revalidatePath("/admin/fleet");
  revalidatePath("/admin/buses");
}
