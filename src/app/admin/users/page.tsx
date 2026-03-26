import { requireAdmin } from "@/lib/admin-middleware";
import { UserManagement } from "@/components/admin/user-management";
import { query } from "@/lib/db";
import { User } from "@/lib/user-service";

// Type for the database query result with joined profile data
type UserWithProfiles = User & {
  employerProfile_companyName?: string;
  workerProfile_category?: string;
  workerProfile_experienceYears?: number;
  workerProfile_rating?: number;
  workerProfile_reviewCount?: number;
  workerProfile_minMonthlyPay?: number;
  jobsPosted_count: number;
  applications_count: number;
};

export default async function UsersPage() {
  const session = await requireAdmin();

  // Fetch users with their profiles
  const usersResult = await query(`
    SELECT 
      u.*,
      ep.companyname as "employerProfile_companyName",
      wp.category as "workerProfile_category",
      wp.experienceyears as "workerProfile_experienceYears", 
      wp.rating as "workerProfile_rating",
      wp.reviewcount as "workerProfile_reviewCount",
      wp.minmonthlypay as "workerProfile_minMonthlyPay",
      (SELECT COUNT(*) FROM "Job" WHERE employerid = u.id LIMIT 1) as "jobsPosted_count",
      (SELECT COUNT(*) FROM "Application" WHERE workerid = u.id LIMIT 1) as "applications_count"
    FROM "User" u
    LEFT JOIN "EmployerProfile" ep ON u.id = ep.userid
    LEFT JOIN "WorkerProfile" wp ON u.id = wp.userid
    ORDER BY u.createdat DESC
  `);

  // Convert Decimal objects to plain numbers for serialization
  const serializedUsers = usersResult.rows.map((user: UserWithProfiles) => ({
    ...user,
    employerProfile: user.employerProfile_companyName ? { companyName: user.employerProfile_companyName } : null,
    workerProfile: user.workerProfile_category ? {
      category: user.workerProfile_category,
      experienceYears: user.workerProfile_experienceYears,
      rating: user.workerProfile_rating,
      reviewCount: user.workerProfile_reviewCount,
      minMonthlyPay: user.workerProfile_minMonthlyPay ? Number(user.workerProfile_minMonthlyPay) : null
    } : null,
    jobsPosted: user.jobsPosted_count > 0 ? [{ id: 1 }] : [],
    applications: user.applications_count > 0 ? [{ id: 1 }] : []
  }));

  // Get user statistics
  const userStatsResult = await query(`
    SELECT 
      role,
      COUNT(*) as count,
      AVG(CASE WHEN role = 'worker' THEN 
        (SELECT experienceyears FROM "WorkerProfile" WHERE userid = "User".id) 
      END) as avg_experience
    FROM "User" 
    GROUP BY role
  `);

  // Convert Decimal objects to plain numbers
  const serializedStats = userStatsResult.rows.map((stat: any) => ({
    ...stat,
    avg_experience: stat.avg_experience ? Number(stat.avg_experience) : null
  }));

  return (
    <UserManagement 
      session={session}
      users={serializedUsers}
      stats={serializedStats}
    />
  );
}
