import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LIVEKIT_CONFIG, generateRoomName } from "@/lib/livekit";

// Config de almacenamiento S3 para grabaciones (opcional)
function getS3Config() {
  const bucket = process.env.LIVEKIT_EGRESS_S3_BUCKET;
  if (!bucket) return null;
  return {
    bucket,
    key: process.env.LIVEKIT_EGRESS_S3_KEY || "",
    secret: process.env.LIVEKIT_EGRESS_S3_SECRET || "",
    region: process.env.LIVEKIT_EGRESS_S3_REGION || "us-east-1",
    endpoint: process.env.LIVEKIT_EGRESS_S3_ENDPOINT || undefined,
  };
}

// POST: Iniciar grabación de la sala de la cita
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { appointmentId } = await request.json();
    if (!appointmentId) return NextResponse.json({ error: "appointmentId requerido" }, { status: 400 });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { advisor: { select: { userId: true } } },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant =
      appointment.clientId === session.user.id ||
      appointment.advisor.userId === session.user.id;
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const s3 = getS3Config();
    if (!s3) {
      return NextResponse.json(
        { error: "La grabación no está configurada. Contacta al administrador." },
        { status: 501 }
      );
    }

    // Si ya hay un egress activo, no duplicar
    if (appointment.recordingEgressId) {
      return NextResponse.json({ ok: true, alreadyRecording: true, egressId: appointment.recordingEgressId });
    }

    const roomName = appointment.liveKitRoomId || generateRoomName(appointment.id);
    const { EgressClient, EncodedFileType } = await import("livekit-server-sdk");
    type EncodedOutputs = import("livekit-server-sdk").EncodedOutputs;
    const egressClient = new EgressClient(
      LIVEKIT_CONFIG.url.replace("wss://", "https://"),
      LIVEKIT_CONFIG.apiKey,
      LIVEKIT_CONFIG.apiSecret
    );

    const output = {
      file: {
        fileType: EncodedFileType.MP4,
        filepath: `meti-recordings/${appointment.id}-${Date.now()}.mp4`,
        output: {
          case: "s3",
          value: {
            accessKey: s3.key,
            secret: s3.secret,
            bucket: s3.bucket,
            region: s3.region,
            endpoint: s3.endpoint || "",
            forcePathStyle: !!s3.endpoint,
          },
        },
      },
    } as EncodedOutputs;

    const egress = await egressClient.startRoomCompositeEgress(roomName, output);

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        recordingEgressId: egress.egressId || null,
        liveKitRoomId: roomName,
      },
    });

    return NextResponse.json({ ok: true, egressId: egress.egressId });
  } catch (error) {
    console.error("Error starting recording:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar la grabación. Verifica la configuración de LiveKit." },
      { status: 500 }
    );
  }
}

// POST /stop: Detener grabación
export async function DELETE(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { appointmentId } = await request.json();
    if (!appointmentId) return NextResponse.json({ error: "appointmentId requerido" }, { status: 400 });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { advisor: { select: { userId: true } } },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant =
      appointment.clientId === session.user.id ||
      appointment.advisor.userId === session.user.id;
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!appointment.recordingEgressId) {
      return NextResponse.json({ ok: true, notRecording: true });
    }

    const { EgressClient } = await import("livekit-server-sdk");
    const egressClient = new EgressClient(
      LIVEKIT_CONFIG.url.replace("wss://", "https://"),
      LIVEKIT_CONFIG.apiKey,
      LIVEKIT_CONFIG.apiSecret
    );
    await egressClient.stopEgress(appointment.recordingEgressId);

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { recordingEgressId: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error stopping recording:", error);
    return NextResponse.json({ error: "No se pudo detener la grabación" }, { status: 500 });
  }
}
