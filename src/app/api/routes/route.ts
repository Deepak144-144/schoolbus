import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const routeId = searchParams.get("routeId");
    const includeStops = searchParams.get("includeStops") === "true";
    const includeBuses = searchParams.get("includeBuses") === "true";

    const include: any = {};
    if (includeStops) include.stops = { orderBy: { stopOrder: "asc" } };
    if (includeBuses) include.buses = true;

    const routes = routeId
      ? [await prisma.route.findUnique({ where: { id: routeId }, include })]
      : await prisma.route.findMany({ include });

    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Routes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser("ADMIN");
    const body = await req.json();
    const { routeName, school, schoolLat, schoolLng, stops } = body;

    const route = await prisma.route.create({
      data: {
        routeName,
        school,
        schoolLat: parseFloat(schoolLat),
        schoolLng: parseFloat(schoolLng),
        stops: {
          create: stops?.map((s: any, idx: number) => ({
            stopName: s.stopName,
            latitude: parseFloat(s.latitude),
            longitude: parseFloat(s.longitude),
            estimatedTime: s.estimatedTime,
            stopOrder: s.stopOrder ?? idx,
          })),
        },
      },
      include: { stops: true },
    });

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Route create error:", error);
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser("ADMIN");
    const body = await req.json();
    const { id, routeName, school, schoolLat, schoolLng, stops } = body;

    const route = await prisma.route.update({
      where: { id },
      data: {
        routeName,
        school,
        schoolLat: typeof schoolLat === "number" ? schoolLat : parseFloat(schoolLat),
        schoolLng: typeof schoolLng === "number" ? schoolLng : parseFloat(schoolLng),
        stops: stops ? {
          deleteMany: {},
          create: stops.map((s: any, idx: number) => ({
            stopName: s.stopName,
            latitude: typeof s.latitude === "number" ? s.latitude : parseFloat(s.latitude),
            longitude: typeof s.longitude === "number" ? s.longitude : parseFloat(s.longitude),
            estimatedTime: s.estimatedTime,
            stopOrder: s.stopOrder ?? idx,
          })),
        } : undefined,
      },
      include: { stops: true },
    });

    return NextResponse.json({ route });
  } catch (error) {
    console.error("Route update error:", error);
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 });
  }
}
