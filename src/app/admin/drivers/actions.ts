"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDriver(formData: FormData) {
  await prisma.driver.create({
    data: {
      userId: formData.get("userId") as string,
      licenseInfo: formData.get("licenseInfo") as string,
      assignedBusId: (formData.get("assignedBusId") as string) || undefined,
      status: ((formData.get("status") as string) || "OFFLINE") as any,
    },
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/admin/fleet");
}

export async function updateDriver(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.driver.update({
    where: { id },
    data: {
      userId: formData.get("userId") as string,
      licenseInfo: formData.get("licenseInfo") as string,
      assignedBusId: (formData.get("assignedBusId") as string) || undefined,
      status: ((formData.get("status") as string) || "OFFLINE") as any,
    },
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/admin/fleet");
}

export async function deleteDriver(formData: FormData) {
  const id = formData.get("id") as string;
  
  const bus = await prisma.bus.findFirst({ where: { driverId: id } });
  if (bus) {
    await prisma.studentAttendance.deleteMany({ where: { trip: { busId: bus.id } } });
    await prisma.gpsLocation.deleteMany({ where: { OR: [{ busId: bus.id }, { trip: { busId: bus.id } }] } });
    await prisma.emergencyAlert.deleteMany({ where: { OR: [{ busId: bus.id }, { trip: { busId: bus.id } }] } });
    await prisma.trip.deleteMany({ where: { busId: bus.id } });
  }
  await prisma.studentAttendance.deleteMany({ where: { trip: { driverId: id } } });
  await prisma.gpsLocation.deleteMany({ where: { trip: { driverId: id } } });
  await prisma.emergencyAlert.deleteMany({ where: { OR: [{ driverId: id }, { trip: { driverId: id } }] } });
  await prisma.trip.deleteMany({ where: { driverId: id } });
  await prisma.bus.updateMany({ where: { driverId: id }, data: { driverId: null } });
  
  await prisma.driver.delete({ where: { id } });
  revalidatePath("/admin/drivers");
  revalidatePath("/admin/fleet");
}
