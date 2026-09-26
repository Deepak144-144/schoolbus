import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/api-auth";
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const busId = searchParams.get("busId");
    const includeRoute = searchParams.get("includeRoute") === "true";
    const includeDriver = searchParams.get("includeDriver") === "true";

    const include: any = {};
    if (includeRoute) include.route = { include: { stops: true } };
    if (includeDriver) include.driver = { include: { user: true } };

    const buses = busId
      ? [await prisma.bus.findUnique({ where: { id: busId }, include })]
      : await prisma.bus.findMany({ include });

    return NextResponse.json({ buses });
  } catch (error) {
    console.error("Buses fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser(req, "ADMIN");
    const body = await req.json();
    const { busNumber, registrationNumber, driverId, routeId, capacity, status } = body;

    const bus = await prisma.bus.create({
      data: {
        busNumber,
        registrationNumber,
        driverId,
        routeId,
        capacity: capacity || 40,
        status: (status || "ACTIVE") as any,
      },
    });

    return NextResponse.json({ bus });
  } catch (error) {
    console.error("Bus create error:", error);
    return NextResponse.json({ error: "Failed to create bus" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser(req, "ADMIN");
    const body = await req.json();
    const { id, busNumber, registrationNumber, driverId, routeId, capacity, status } = body;

    const bus = await prisma.bus.update({
      where: { id },
      data: { busNumber, registrationNumber, driverId, routeId, capacity, status },
    });

    return NextResponse.json({ bus });
  } catch (error) {
    console.error("Bus update error:", error);
    return NextResponse.json({ error: "Failed to update bus" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser(req, "ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.bus.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bus delete error:", error);
    return NextResponse.json({ error: "Failed to delete bus" }, { status: 500 });
  }
}