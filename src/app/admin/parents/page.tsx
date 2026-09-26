import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import ParentsClient from "./ParentsClient";
import { deleteParent } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminParentsPage() {
  await getAuthUser("ADMIN");

  const parents = await prisma.parent.findMany({
    include: {
      user: true,
      children: true,
    },
    orderBy: { user: { name: "asc" } },
  });

  return <ParentsClient parents={parents} deleteParent={deleteParent} />;
}
