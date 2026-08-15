import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!advisorId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: advisorId, serviceId, date" },
      { status: 400 }
    );
  }

  try {
    // Get advisor schedule for the requested date
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    const schedule = await prisma.advisorSchedule.findUnique({
      where: {
        advisorId_dayOfWeek: {
          advisorId,
          dayOfWeek,
        },
      },
    });

    if (!schedule || !schedule.isActive) {
      return NextResponse.json({ slots: [] });
    }

    // Get service duration
    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Get existing appointments for that date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        advisorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS", "PENDING"],
        },
      },
      select: {
        scheduledAt: true,
        durationMin: true,
      },
    });

    // Convert to format needed for slot generation
    const appointments = existingAppointments.map((apt: { scheduledAt: Date; durationMin: number }) => ({
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
    }));

    // Generate available slots
    const scheduleData = {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lunchStart: schedule.lunchStart,
      lunchEnd: schedule.lunchEnd,
      gapMinutes: schedule.gapMinutes,
    };

    const slots = generateAvailableSlots(scheduleData, service.durationMin, appointments);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
