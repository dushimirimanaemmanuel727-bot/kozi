import { requireAdmin } from "@/lib/admin-middleware";
import { VerificationManagement } from "@/components/admin/verification-management";
import { query } from "@/lib/db";

export default async function VerificationsPage() {
  const session = await requireAdmin();

  // Fetch verifications with user details
  const verificationsResult = await query(`
    SELECT 
      v.*,
      u.id as user_id,
      u.name as user_name,
      u.phone as user_phone,
      u.email as user_email,
      u.role as user_role,
      wp."nationalId" as worker_national_id,
      wp."passportNumber" as worker_passport_number,
      wp."passportUrl" as worker_passport_url,
      wp.category as worker_category
    FROM "Verification" v
    JOIN "User" u ON v."userId" = u.id
    LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
    ORDER BY v."issuedAt" DESC
  `);

  // Format the response to match the expected structure
  const verifications = verificationsResult.rows.map((row: any) => ({
    id: row.id,
    userId: row["userId"],
    type: row.type,
    status: row.status,
    issuedAt: row["issuedAt"],
    reviewedAt: row["reviewedAt"],
    documentUrl: row["documentUrl"],
    reviewNotes: row["reviewNotes"],
    reviewedBy: row["reviewedBy"],
    user: {
      id: row.user_id,
      name: row.user_name,
      phone: row.user_phone,
      email: row.user_email,
      role: row.user_role,
      workerProfile: row.worker_national_id ? {
        nationalId: row.worker_national_id,
        passportNumber: row.worker_passport_number,
        passportUrl: row.worker_passport_url,
        category: row.worker_category
      } : null
    }
  }));

  // Get verification statistics
  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    totalVerifications
  ] = await Promise.all([
    query(`SELECT COUNT(*) as count FROM "Verification" WHERE status = 'PENDING'`).then(r => parseInt(r.rows[0]?.count || '0')),
    query(`SELECT COUNT(*) as count FROM "Verification" WHERE status = 'APPROVED'`).then(r => parseInt(r.rows[0]?.count || '0')),
    query(`SELECT COUNT(*) as count FROM "Verification" WHERE status = 'REJECTED'`).then(r => parseInt(r.rows[0]?.count || '0')),
    query(`SELECT COUNT(*) as count FROM "Verification"`).then(r => parseInt(r.rows[0]?.count || '0'))
  ]);

  return (
    <VerificationManagement 
      session={session}
      verifications={verifications}
      stats={{
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalVerifications
      }}
    />
  );
}
