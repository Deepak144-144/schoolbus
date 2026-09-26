"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteParent(formData: FormData) {
  const id = formData.get("id") as string;
  const userId = formData.get("userId") as string;

  const students = await prisma.student.findMany({ where: { parentId: id }, select: { id: true } });
  for (const student of students) {
    await prisma.studentAttendance.deleteMany({ where: { studentId: student.id } });
  }
  await prisma.student.deleteMany({ where: { parentId: id } });

  await prisma.parent.delete({ where: { id } });
  await prisma.driver.deleteMany({ where: { userId } });
  await prisma.admin.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/parents");
}
