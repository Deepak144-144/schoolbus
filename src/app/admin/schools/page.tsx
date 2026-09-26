import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import SchoolsClient from "./SchoolsClient";
import { createSchool, updateSchool, deleteSchool } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminSchoolsPage() {
  const user = await getAuthUser("ADMIN");

  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    include: {
      owner: { include: { user: true } },
      routes: { select: { id: true, routeName: true } },
    },
  });

  const serialized = schools.map((s) => ({
    id: s.id,
    name: s.name,
    latitude: s.latitude,
    longitude: s.longitude,
    owner: s.owner ? { id: s.owner.id, user: { name: s.owner.user.name, email: s.owner.user.email } } : null,
    routes: s.routes.map((r) => ({ id: r.id, routeName: r.routeName })),
    _count: { routes: s.routes.length },
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return (
    <SchoolsClient
      schools={serialized}
      currentAdminId={user.admin?.id ?? null}
      createSchool={createSchool}
      updateSchool={updateSchool}
      deleteSchool={deleteSchool}
    />
  );
}