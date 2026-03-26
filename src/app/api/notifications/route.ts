import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session phone
    const userResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    // Get notifications using raw SQL
    let sql = 'SELECT id, title, message, type, read, "createdAt" FROM "Notification" WHERE "userId" = $1';
    const params = [user.id];
    
    if (unreadOnly) {
      sql += ' AND read = false';
    }
    
    sql += ' ORDER BY "createdAt" DESC LIMIT 50';

    const [notificationsResult, unreadCountResult] = await Promise.all([
      query(sql, params),
      query('SELECT COUNT(*) as count FROM "Notification" WHERE "userId" = $1 AND read = false', [user.id])
    ]);

    return NextResponse.json({
      notifications: notificationsResult.rows,
      unreadCount: parseInt(unreadCountResult.rows[0].count)
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
    const userResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (markAllAsRead) {
      await query('UPDATE "Notification" SET read = true WHERE "userId" = $1 AND read = false', [user.id]);
    } else if (notificationId) {
      await query('UPDATE "Notification" SET read = true WHERE id = $1 AND "userId" = $2', [notificationId, user.id]);
    } else {
      return NextResponse.json({ error: "Either notificationId or markAllAsRead is required" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Mark notification read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
