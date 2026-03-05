import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "WORKER") {
      return NextResponse.json({ error: "Not a worker" }, { status: 403 });
    }

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        nationalId: true,
        passportNumber: true,
        photoUrl: true,
        passportUrl: true,
      }
    });

    // Check if required fields are completed
    const completed = !!(
      workerProfile?.nationalId &&
      workerProfile?.passportNumber &&
      workerProfile?.photoUrl &&
      workerProfile?.passportUrl
    );

    return NextResponse.json({ completed });

  } catch (error) {
    console.error("Profile check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
