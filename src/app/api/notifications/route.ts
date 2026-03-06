import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session phone
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get notifications for the user using raw SQL (workaround for Prisma client not being updated)
    const notifications = await prisma.$queryRaw`
      SELECT id, title, message, type, "read", "createdAt"
      FROM "Notification"
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `;

    return NextResponse.json(notifications);

  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    // Mark notification as read using raw SQL (workaround for Prisma client not being updated)
    const result = await prisma.$executeRaw`
      UPDATE "Notification"
      SET "read" = true
      WHERE id = ${notificationId}
    `;

    return NextResponse.json({ success: true, updated: true });

  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
