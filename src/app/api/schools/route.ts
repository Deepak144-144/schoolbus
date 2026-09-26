import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/server";
import { Role } from "@prisma/client";
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");
    const includeRoutes = searchParams.get("includeRoutes") === "true";

    const include: any = {
      owner: { include: { user: true } },
    };
    if (includeRoutes) include.routes = { include: { stops: true } };

    const schools = schoolId
      ? [await prisma.school.findUnique({ where: { id: schoolId }, include })]
      : await prisma.school.findMany({ include, orderBy: { name: "asc" } });

    return NextResponse.json({ schools });
  } catch (error) {
    console.error("Schools fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const user = await getAuthUser("ADMIN");
    const body = await req.json();
    const { name, latitude, longitude } = body;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "School name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const school = await prisma.school.create({
      data: {
        name,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ownerId: user.admin?.id ?? null,
      },
    });

    if (user.admin) {
      await prisma.admin.update({
        where: { id: user.admin.id },
        data: { schoolId: school.id, school: school.name },
      });
    }

    return NextResponse.json({ school });
  } catch (error) {
    console.error("School create error:", error);
    return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const user = await getAuthUser("ADMIN");
    const body = await req.json();
    const { id, name, latitude, longitude } = body;

    if (!id) {
      return NextResponse.json({ error: "School ID required" }, { status: 400 });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    if (school.ownerId && school.ownerId !== user.admin?.id) {
      return NextResponse.json({ error: "Not authorized to update this school" }, { status: 403 });
    }

    const updated = await prisma.school.update({
      where: { id },
      data: {
        name,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    if (user.admin && user.admin.schoolId === id) {
      await prisma.admin.update({
        where: { id: user.admin.id },
        data: { school: updated.name },
      });
    }

    return NextResponse.json({ school: updated });
  } catch (error) {
    console.error("School update error:", error);
    return NextResponse.json({ error: "Failed to update school" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const user = await getAuthUser("ADMIN");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "School ID required" }, { status: 400 });
    }

    const school = await prisma.school.findUnique({ where: { id } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    if (school.ownerId && school.ownerId !== user.admin?.id) {
      return NextResponse.json({ error: "Not authorized to delete this school" }, { status: 403 });
    }

    const routes = await prisma.route.count({ where: { schoolId: id } });
    if (routes > 0) {
      return NextResponse.json(
        { error: `Cannot delete school with ${routes} associated route(s). Delete routes first.` },
        { status: 409 }
      );
    }

    if (school.ownerId) {
      await prisma.admin.update({
        where: { id: school.ownerId },
        data: { schoolId: null, school: null },
      });
    }

    await prisma.school.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("School delete error:", error);
    return NextResponse.json({ error: "Failed to delete school" }, { status: 500 });
  }
}