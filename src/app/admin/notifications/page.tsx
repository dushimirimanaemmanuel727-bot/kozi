import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { NotificationManagement } from "@/components/admin/notification-management";

export default async function NotificationsPage() {
  const session = await requireAdmin();

  // Fetch notifications with user data
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, phone: true, role: true }
      }
    },
    take: 50
  });

  // Get notification statistics
  const notificationStats = await prisma.$queryRaw<any[]>`
    SELECT 
      type,
      COUNT(*) as count,
      SUM(CASE WHEN "read" = true THEN 1 ELSE 0 END) as read_count,
      SUM(CASE WHEN "read" = false THEN 1 ELSE 0 END) as unread_count
    FROM "Notification" 
    GROUP BY type
  `;

  // Get recent notification activity
  const recentActivity = await prisma.$queryRaw<any[]>`
    SELECT 
      DATE_TRUNC('hour', "createdAt") as hour,
      COUNT(*) as notifications_sent
    FROM "Notification" 
    WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
    GROUP BY DATE_TRUNC('hour', "createdAt")
    ORDER BY hour DESC
  `;

  return (
    <NotificationManagement 
      session={session}
      notifications={notifications}
      stats={notificationStats}
      activityData={recentActivity}
    />
  );
}
