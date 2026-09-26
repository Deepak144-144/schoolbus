import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";

export async function POST(req: NextRequest) {
  try {
    const existing = await prisma.user.count();
    if (existing > 0) {
      return NextResponse.json({ message: "Database already seeded" });
    }

    const adminPassword = await hashPassword("admin123");
    const adminUser = await prisma.user.create({
      data: {
        name: "Sarah Johnson",
        email: "admin@saferide.edu",
        password: adminPassword,
        role: "ADMIN",
        phone: "+1 (555) 123-4567",
        admin: {
          create: { school: "Greenwood Elementary School" },
        },
      },
      include: { admin: true },
    });

    // Create school record
    const school = await prisma.school.create({
      data: {
        name: "Greenwood Elementary School",
        latitude: 40.7580,
        longitude: -73.9855,
        ownerId: adminUser.admin?.id ?? undefined,
      },
    });

    // Update admin with schoolId
    await prisma.admin.update({
      where: { userId: adminUser.id },
      data: { schoolId: school.id },
    });

    const driverPassword = await hashPassword("driver123");
    const driverUser = await prisma.user.create({
      data: {
        name: "Rajesh Kumar",
        email: "driver@saferide.edu",
        password: driverPassword,
        role: "DRIVER",
        phone: "+1 (555) 123-4568",
      },
    });

    const route = await prisma.route.create({
      data: {
        routeName: "Route 1 - Morning",
        school: "Greenwood Elementary School",
        schoolLat: 40.7580,
        schoolLng: -73.9855,
        schoolId: school.id,
        stops: {
          create: [
            { stopName: "124 Maple Street", latitude: 40.7505, longitude: -73.9934, estimatedTime: "14:03", stopOrder: 1 },
            { stopName: "89 Oak Avenue", latitude: 40.7484, longitude: -73.9857, estimatedTime: "14:06", stopOrder: 2 },
            { stopName: "45 Pine Road", latitude: 40.7549, longitude: -73.9788, estimatedTime: "14:09", stopOrder: 3 },
            { stopName: "200 Cedar Lane", latitude: 40.7505, longitude: -73.9834, estimatedTime: "14:12", stopOrder: 4 },
            { stopName: "77 Birch Drive", latitude: 40.7484, longitude: -73.9907, estimatedTime: "14:15", stopOrder: 5 },
            { stopName: "School", latitude: 40.7580, longitude: -73.9855, estimatedTime: "14:18", stopOrder: 6 },
          ],
        },
      },
      include: { stops: true },
    });

    const driverRecord = await prisma.driver.create({
      data: {
        userId: driverUser.id,
        licenseInfo: "DL-12345678",
        status: "AVAILABLE",
      },
    });

    const bus = await prisma.bus.create({
      data: {
        busNumber: "12",
        registrationNumber: "ABC-1234",
        driverId: driverRecord.id,
        routeId: route.id,
        capacity: 40,
        status: "ACTIVE",
      },
    });

    const parent1Password = await hashPassword("parent123");
    const parent1User = await prisma.user.create({
      data: {
        name: "Maria Garcia",
        email: "parent1@saferide.edu",
        password: parent1Password,
        role: "PARENT",
        phone: "+1 (555) 123-4569",
        parent: {
          create: {},
        },
      },
      include: { parent: true },
    });

    const parent2Password = await hashPassword("parent123");
    const parent2User = await prisma.user.create({
      data: {
        name: "David Thompson",
        email: "parent2@saferide.edu",
        password: parent2Password,
        role: "PARENT",
        phone: "+1 (555) 123-4570",
        parent: {
          create: {},
        },
      },
      include: { parent: true },
    });

    const stops = await prisma.busStop.findMany({
      where: { routeId: route.id },
      orderBy: { stopOrder: "asc" },
    });

    await prisma.student.createMany({
      data: [
        {
          name: "Emma Garcia",
          studentId: "STU-001",
          class: "4th Grade",
          section: "A",
          parentId: parent1User.parent!.id,
          busId: bus.id,
          pickupStopId: stops[0].id,
          dropoffStopId: stops[5].id,
        },
        {
          name: "Noah Garcia",
          studentId: "STU-002",
          class: "2nd Grade",
          section: "B",
          parentId: parent1User.parent!.id,
          busId: bus.id,
          pickupStopId: stops[0].id,
          dropoffStopId: stops[5].id,
        },
        {
          name: "Olivia Thompson",
          studentId: "STU-003",
          class: "5th Grade",
          section: "C",
          parentId: parent2User.parent!.id,
          busId: bus.id,
          pickupStopId: stops[2].id,
          dropoffStopId: stops[5].id,
        },
      ],
    });

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        admin: adminUser.email,
        driver: driverUser.email,
        parents: [parent1User.email, parent2User.email],
        busNumber: bus.busNumber,
        route: route.routeName,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
