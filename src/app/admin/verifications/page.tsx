import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { VerificationManagement } from "@/components/admin/verification-management";

export default async function VerificationsPage() {
  const session = await requireAdmin();

  // Fetch verifications with user details
  const verifications = await prisma.verification.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          workerProfile: {
            select: {
              nationalId: true,
              passportNumber: true,
              passportUrl: true,
              category: true
            }
          }
        }
      }
    }
  });

  // Get verification statistics
  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    totalVerifications
  ] = await Promise.all([
    prisma.verification.count({ where: { status: "PENDING" } }),
    prisma.verification.count({ where: { status: "APPROVED" } }),
    prisma.verification.count({ where: { status: "REJECTED" } }),
    prisma.verification.count()
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
