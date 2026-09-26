import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/cookies";
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const studentId = searchParams.get("studentId");
    const busId = searchParams.get("busId");

    const students = await prisma.student.findMany({
      where: {
        ...(parentId ? { parentId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(busId ? { busId } : {}),
        ...(user.role === "PARENT" ? { parent: { userId: user.id } } : {}),
      },
      include: {
        parent: { include: { user: true } },
        bus: true,
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Students fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getCurrentUser();
    const body = await req.json();
    const { name, studentId, class: className, section, parentId, busId, pickupStopId, dropoffStopId } = body;

    const student = await prisma.student.create({
      data: {
        name,
        studentId,
        class: className,
        section,
        parentId,
        busId,
        pickupStopId,
        dropoffStopId,
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Student create error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getCurrentUser();
    const body = await req.json();
    const { id, name, studentId, class: className, section, parentId, busId, pickupStopId, dropoffStopId } = body;

    const student = await prisma.student.update({
      where: { id },
      data: { name, studentId, class: className, section, parentId, busId, pickupStopId, dropoffStopId },
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname));
    if (rl) return rl;

    await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
