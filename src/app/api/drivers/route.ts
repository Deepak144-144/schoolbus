import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");
    const busId = searchParams.get("busId");
    const includeUser = searchParams.get("includeUser") === "true";
    const includeBus = searchParams.get("includeBus") === "true";

    const include: any = {};
    if (includeUser) include.user = true;
    if (includeBus) include.assignedBus = { include: { route: { include: { stops: true } } } };

    const drivers = driverId
      ? [await prisma.driver.findUnique({ where: { id: driverId }, include })]
      : await prisma.driver.findMany({ include });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error("Drivers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser("ADMIN");
    const body = await req.json();
    const { userId, licenseInfo, assignedBusId, status } = body;

    const driver = await prisma.driver.create({
      data: {
        userId,
        licenseInfo,
        assignedBusId,
        status: (status || "OFFLINE") as any,
      },
    });

    return NextResponse.json({ driver });
  } catch (error) {
    console.error("Driver create error:", error);
    return NextResponse.json({ error: "Failed to create driver" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getAuthUser("ADMIN");
    const body = await req.json();
    const { id, licenseInfo, assignedBusId, status } = body;

    const driver = await prisma.driver.update({
      where: { id },
      data: { licenseInfo, assignedBusId, status },
    });

    return NextResponse.json({ driver });
  } catch (error) {
    console.error("Driver update error:", error);
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 });
  }
}
