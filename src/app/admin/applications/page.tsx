import { requireAdmin } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";
import { ApplicationManagement } from "@/components/admin/application-management";

export default async function ApplicationsPage() {
  const session = await requireAdmin();

  // Fetch applications with job and worker details
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              employerProfile: {
                select: { organization: true }
              }
            }
          }
        }
      },
      worker: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          workerProfile: {
            select: {
              category: true,
              experienceYears: true,
              rating: true,
              reviewCount: true,
              minMonthlyPay: true
            }
          }
        }
      }
    }
  });

  // Get application statistics
  const [
    pendingCount,
    acceptedCount,
    rejectedCount,
    totalApplications
  ] = await Promise.all([
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.application.count()
  ]);

  return (
    <ApplicationManagement 
      session={session}
      applications={applications}
      stats={{
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        total: totalApplications
      }}
    />
  );
}
