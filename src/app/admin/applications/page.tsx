import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { ApplicationManagement } from "@/components/admin/application-management";

export default async function ApplicationsPage() {
  const session = await requireAdmin();

  // Fetch applications with job and worker details
  const applications = await query(`
    SELECT 
      a.*,
      j.title as job_title,
      j.category as job_category,
      j.budget as job_budget,
      j.district as job_location,
      e.name as employer_name,
      e.phone as employer_phone,
      e.email as employer_email,
      w.name as worker_name,
      w.phone as worker_phone,
      w.email as worker_email,
      wp.category as worker_category,
      wp."experienceYears" as worker_experience,
      wp.rating as worker_rating,
      wp."reviewCount" as worker_reviews,
      wp."minMonthlyPay" as worker_min_pay
    FROM "Application" a
    LEFT JOIN "Job" j ON a."jobId" = j.id
    LEFT JOIN "User" e ON j."employerId" = e.id
    LEFT JOIN "EmployerProfile" ep ON e.id = ep."userId"
    LEFT JOIN "User" w ON a."workerId" = w.id
    LEFT JOIN "WorkerProfile" wp ON w.id = wp."userId"
    ORDER BY a."createdAt" DESC
  `);

  // Get application statistics
  const [
    pendingCount,
    acceptedCount,
    rejectedCount,
    totalApplications
  ] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM "Application" WHERE status = 'PENDING'`).then(result => result.rows[0]?.count || 0),
    query(`SELECT COUNT(*) as count FROM "Application" WHERE status = 'ACCEPTED'`).then(result => result.rows[0]?.count || 0),
    query(`SELECT COUNT(*) as count FROM "Application" WHERE status = 'REJECTED'`).then(result => result.rows[0]?.count || 0),
    query(`SELECT COUNT(*) as count FROM "Application"`).then(result => result.rows[0]?.count || 0)
  ]);

  return (
    <ApplicationManagement 
      session={session}
      applications={applications.rows}
      stats={{
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        total: totalApplications
      }}
    />
  );
}
