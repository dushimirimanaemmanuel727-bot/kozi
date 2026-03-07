import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Get notifications for the user using Prisma client queries
    const whereClause: any = {
      userId: user.id
    };

    if (unreadOnly) {
      whereClause.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false
      }
    });

    return NextResponse.json({
      notifications,
      unreadCount
    });

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
    const { notificationId, markAllAsRead } = body;

    // Get user ID from session phone
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let result;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      result = await prisma.notification.updateMany({
        where: {
          userId: user.id,
          read: false
        },
        data: {
          read: true
        }
      });
    } else {
      // Mark specific notification as read
      if (!notificationId) {
        return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
      }

      result = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId: user.id
        },
        data: {
          read: true
        }
      });
    }

    return NextResponse.json({ success: true, updated: true });

  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
