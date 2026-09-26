import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import StudentsClient from "./StudentsClient";
import { createStudent, updateStudent, deleteStudent } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchStudents() {
  return await prisma.student.findMany({
    include: {
      parent: { include: { user: true } },
      bus: true,
      pickupStop: true,
      dropoffStop: true,
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminStudentsPage() {
  await getAuthUser("ADMIN");
  const students = await fetchStudents();
  const buses = await prisma.bus.findMany();
  const parents = await prisma.parent.findMany({ include: { user: true } });
  const allStops = await prisma.busStop.findMany({ include: { route: true } });

  return (
    <StudentsClient
      students={students}
      parents={parents}
      buses={buses}
      stops={allStops}
      createStudent={createStudent}
      updateStudent={updateStudent}
      deleteStudent={deleteStudent}
    />
  );
}
