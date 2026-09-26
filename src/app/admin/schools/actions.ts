"use server";

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export async function createSchool(formData: FormData) {
  const user = await getAuthUser("ADMIN");
  const name = formData.get("name") as string;
  const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
  const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;

  if (!name || name.length < 2) {
    throw new Error("School name must be at least 2 characters");
  }

  const school = await prisma.school.create({
    data: {
      name,
      latitude,
      longitude,
      ownerId: user.admin?.id ?? null,
    },
  });

  if (user.admin) {
    await prisma.admin.update({
      where: { id: user.admin.id },
      data: { schoolId: school.id, school: school.name },
    });
  }

  revalidatePath("/admin/schools");
  revalidatePath("/select-school");
  return school;
}

export async function updateSchool(formData: FormData) {
  const user = await getAuthUser("ADMIN");
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
  const longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;

  if (!id) {
    throw new Error("School ID required");
  }

  const school = await prisma.school.findUnique({ where: { id } });
  if (!school) {
    throw new Error("School not found");
  }

  if (school.ownerId && school.ownerId !== user.admin?.id) {
    throw new Error("Not authorized to update this school");
  }

  const updated = await prisma.school.update({
    where: { id },
    data: { name, latitude, longitude },
  });

  if (user.admin?.schoolId === id) {
    await prisma.admin.update({
      where: { id: user.admin.id },
      data: { school: updated.name },
    });
  }

  revalidatePath("/admin/schools");
  revalidatePath("/select-school");
  return updated;
}

export async function deleteSchool(formData: FormData) {
  const user = await getAuthUser("ADMIN");
  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("School ID required");
  }

  const school = await prisma.school.findUnique({ where: { id } });
  if (!school) {
    throw new Error("School not found");
  }

  if (school.ownerId && school.ownerId !== user.admin?.id) {
    throw new Error("Not authorized to delete this school");
  }

  const routes = await prisma.route.count({ where: { schoolId: id } });
  if (routes > 0) {
    throw new Error(`Cannot delete school with ${routes} associated route(s). Delete routes first.`);
  }

  if (school.ownerId) {
    await prisma.admin.update({
      where: { id: school.ownerId },
      data: { schoolId: null, school: null },
    });
  }

  await prisma.school.delete({ where: { id } });

  revalidatePath("/admin/schools");
  revalidatePath("/select-school");
  return { success: true };
}