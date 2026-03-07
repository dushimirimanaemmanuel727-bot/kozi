import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { UserManagement } from "@/components/admin/user-management";

export default async function UsersPage() {
  const session = await requireAdmin();

  // Fetch users with their profiles
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employerProfile: {
        select: { organization: true }
      },
      workerProfile: {
        select: { 
          category: true, 
          experienceYears: true, 
          rating: true,
          reviewCount: true,
          minMonthlyPay: true
        }
      },
      jobsPosted: {
        select: { id: true },
        take: 1
      },
      applications: {
        select: { id: true },
        take: 1
      }
    }
  });

  // Get user statistics
  const userStats = await prisma.$queryRaw`
    SELECT 
      role,
      COUNT(*) as count,
      AVG(CASE WHEN role = 'WORKER' THEN 
        (SELECT "experienceYears" FROM "WorkerProfile" WHERE "userId" = "User".id) 
      END) as avg_experience
    FROM "User" 
    GROUP BY role
  ` as any[];

  return (
    <UserManagement 
      session={session}
      users={users}
      stats={userStats}
    />
  );
}
