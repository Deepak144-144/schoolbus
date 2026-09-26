import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import RoutesClient from "./RoutesClient";
import { createRoute, updateRoute, deleteRoute } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminRoutesPage() {
  await getAuthUser("ADMIN");

  const routes = await prisma.route.findMany({
    include: {
      stops: { orderBy: { stopOrder: "asc" } },
      buses: true,
      _count: { select: { stops: true, buses: true } },
    },
    orderBy: { routeName: "asc" },
  });

  return <RoutesClient routes={routes} createRoute={createRoute} updateRoute={updateRoute} deleteRoute={deleteRoute} />;
}
