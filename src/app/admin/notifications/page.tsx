import { requireAdmin } from "@/lib/admin-middleware";
import { NotificationManagement } from "@/components/admin/notification-management";
import { query } from "@/lib/db";

export default async function NotificationsPage() {
  const session = await requireAdmin();

  // Fetch notifications with user data
  const notifications = await query(`
    SELECT 
      n.*,
      u.name, u.phone, u.role
    FROM "Notification" n
    LEFT JOIN "User" u ON n."userId" = u.id
    ORDER BY n."createdAt" DESC
    LIMIT 50
  `);

  // Get notification statistics
  const notificationStats = await query(`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(CASE WHEN "read" = true THEN 1 ELSE 0 END) as read_count,
      SUM(CASE WHEN "read" = false THEN 1 ELSE 0 END) as unread_count
    FROM "Notification" 
    GROUP BY type
  `);

  // Get recent notification activity
  const recentActivity = await query(`
    SELECT 
      DATE_TRUNC('hour', "createdAt") as hour,
      COUNT(*) as notifications_sent
    FROM "Notification" 
    WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', "createdAt")
    ORDER BY hour DESC
  `);

  return (
    <NotificationManagement 
      session={session}
      notifications={notifications.rows}
      stats={notificationStats.rows}
      activityData={recentActivity.rows}
    />
  );
}
