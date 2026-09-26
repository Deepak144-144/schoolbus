"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStudent(formData: FormData) {
  await prisma.student.create({
    data: {
      name: formData.get("name") as string,
      studentId: formData.get("studentId") as string,
      class: formData.get("class") as string,
      section: formData.get("section") as string,
      parentId: formData.get("parentId") as string,
      busId: formData.get("busId") as string,
      pickupStopId: formData.get("pickupStopId") as string,
      dropoffStopId: formData.get("dropoffStopId") as string,
    },
  });
  revalidatePath("/admin/students");
  revalidatePath("/parent");
}

export async function updateStudent(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.student.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      studentId: formData.get("studentId") as string,
      class: formData.get("class") as string,
      section: formData.get("section") as string,
      parentId: formData.get("parentId") as string,
      busId: formData.get("busId") as string,
      pickupStopId: formData.get("pickupStopId") as string,
      dropoffStopId: formData.get("dropoffStopId") as string,
    },
  });
  revalidatePath("/admin/students");
  revalidatePath("/parent");
}

export async function deleteStudent(formData: FormData) {
  const id = formData.get("id") as string;
  
  await prisma.studentAttendance.deleteMany({ where: { studentId: id } });
  await prisma.student.delete({ where: { id } });
  revalidatePath("/admin/students");
  revalidatePath("/parent");
}
