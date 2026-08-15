import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const appointmentSchema = z.object({
  advisorId: z.string(),
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
});

// POST: Create appointment
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { advisorId, serviceId, scheduledAt } = appointmentSchema.parse(body);

    // Get advisor profile
    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    // Get service
    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get fee percentage from category (or default 15%)
    const advisorCategories = await prisma.advisorCategory.findMany({
      where: { advisorId: advisorProfile.id },
      include: { category: true },
    });

    let feePercentage = 15; // Default
    if (advisorCategories.length > 0) {
      feePercentage = advisorCategories[0].category.feePercentage;
    }

    // Calculate prices
    const advisorEarning = service.priceCents;
    const platformFee = Math.round(advisorEarning * (feePercentage / 100));
    const totalCents = advisorEarning + platformFee;

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientId: session.user.id,
        advisorId: advisorProfile.id,
        serviceId: serviceId,
        scheduledAt: new Date(scheduledAt),
        durationMin: service.durationMin,
        status: "CONFIRMED", // In real app, would be PENDING until payment
        totalCents,
        advisorEarning,
        platformFee,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
