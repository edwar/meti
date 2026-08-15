import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET: Get MercadoPago credentials
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        mpPublicKey: true,
        mpAccessToken: true,
      },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      publicKey: advisorProfile.mpPublicKey || null,
      accessToken: advisorProfile.mpAccessToken ? "••••••••••••••••" : null,
      isConnected: !!(advisorProfile.mpPublicKey && advisorProfile.mpAccessToken),
    });
  } catch (error) {
    console.error("Error fetching MP credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save MercadoPago credentials
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    const { publicKey, accessToken } = await request.json();

    if (!publicKey || !accessToken) {
      return NextResponse.json(
        { error: "Public Key and Access Token are required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!publicKey.startsWith("APP_USR-")) {
      return NextResponse.json(
        { error: "Public Key inválido. Debe comenzar con APP_USR-" },
        { status: 400 }
      );
    }

    if (!accessToken.startsWith("APP_USR-")) {
      return NextResponse.json(
        { error: "Access Token inválido. Debe comenzar con APP_USR-" },
        { status: 400 }
      );
    }

    await prisma.advisorProfile.update({
      where: { id: advisorProfile.id },
      data: {
        mpPublicKey: publicKey,
        mpAccessToken: accessToken,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving MP credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
