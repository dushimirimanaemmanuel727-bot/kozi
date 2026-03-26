import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";
import { JobManagement } from "@/components/admin/job-management";

export default async function JobsPage() {
  const session = await requireAdmin();

  // Fetch jobs with employer and application data
  const jobs = await query(`
    SELECT 
      j.*,
      e.name as employer_name,
      e.phone as employer_phone,
      e.email as employer_email,
      COUNT(a.id) as application_count
    FROM "Job" j
    LEFT JOIN "User" e ON j.employerid = e.id
    LEFT JOIN "Application" a ON j.id = a.jobid
    GROUP BY j.id, e.name, e.phone, e.email
    ORDER BY j.createdat DESC
  `);

  // Get job statistics
  const jobStats = await query(`
    SELECT 
      status,
      COUNT(*) as count,
      COALESCE(AVG(payamount), 0) as avg_budget
    FROM "Job" 
    GROUP BY status
  `);

  // Get category distribution
  const categoryStats = await query(`
    SELECT 
      category,
      COUNT(*) as count
    FROM "Job"
    GROUP BY category
    ORDER BY count DESC
  `);

  // Get recent activity
  const recentActivity = await query(`
    SELECT 
      'JOB_POSTED' as type,
      j.title,
      j.createdat as timestamp,
      e.name as user_name
    FROM "Job" j
    JOIN "User" e ON j.employerid = e.id
    WHERE j.createdat >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    SELECT 
      'APPLICATION_SUBMITTED' as type,
      j.title,
      a.appliedat as timestamp,
      w.name as user_name
    FROM "Application" a
    JOIN "Job" j ON a.jobid = j.id
    JOIN "User" w ON a.workerid = w.id
    WHERE a.appliedat >= NOW() - INTERVAL '7 days'
    
    ORDER BY timestamp DESC
    LIMIT 10
  `);

  return (
    <JobManagement 
      session={session}
      jobs={jobs.rows}
      stats={jobStats.rows}
      categoryStats={categoryStats.rows}
      recentActivity={recentActivity.rows}
    />
  );
}
