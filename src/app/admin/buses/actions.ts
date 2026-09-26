"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBus(formData: FormData) {
  await prisma.bus.create({
    data: {
      busNumber: formData.get("busNumber") as string,
      registrationNumber: formData.get("registrationNumber") as string,
      capacity: parseInt(formData.get("capacity") as string) || 40,
      driverId: (formData.get("driverId") as string) || undefined,
      routeId: (formData.get("routeId") as string) || undefined,
      status: ((formData.get("status") as string) || "ACTIVE") as any,
    },
  });
  revalidatePath("/admin/buses");
  revalidatePath("/admin/fleet");
}

export async function updateBus(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.bus.update({
    where: { id },
    data: {
      busNumber: formData.get("busNumber") as string,
      registrationNumber: formData.get("registrationNumber") as string,
      capacity: parseInt(formData.get("capacity") as string) || 40,
      driverId: (formData.get("driverId") as string) || undefined,
      routeId: (formData.get("routeId") as string) || undefined,
      status: ((formData.get("status") as string) || "ACTIVE") as any,
    },
  });
  revalidatePath("/admin/buses");
  revalidatePath("/admin/fleet");
}

export async function deleteBus(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.studentAttendance.deleteMany({ where: { trip: { busId: id } } });
  await prisma.gpsLocation.deleteMany({ where: { OR: [{ busId: id }, { trip: { busId: id } }] } });
  await prisma.emergencyAlert.deleteMany({ where: { OR: [{ busId: id }, { trip: { busId: id } }] } });
  await prisma.trip.deleteMany({ where: { busId: id } });
  await prisma.driver.updateMany({ where: { assignedBusId: id }, data: { assignedBusId: null } });
  await prisma.student.updateMany({ where: { busId: id }, data: { busId: null } });
  
  await prisma.bus.delete({ where: { id } });
  revalidatePath("/admin/buses");
  revalidatePath("/admin/fleet");
}
