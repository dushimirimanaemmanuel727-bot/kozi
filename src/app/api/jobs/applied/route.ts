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

    // Get the user by phone to get the correct user ID and role
    const user = await prisma.user.findUnique({
      where: { phone: session.user?.phone },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "WORKER") {
      return NextResponse.json({ error: "Only workers can view applied jobs" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: {
        workerId: user.id
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(applications);

  } catch (error) {
    console.error("Applied jobs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
