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
      return NextResponse.json({ error: "Only workers can view reviews" }, { status: 403 });
    }

    // Get reviews where user is either reviewer or reviewee
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { reviewerId: session.user.id },
          { revieweeId: session.user.id }
        ]
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(reviews);

  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
