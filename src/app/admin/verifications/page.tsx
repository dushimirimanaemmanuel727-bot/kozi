import { requireAdmin } from "@/lib/admin-middleware";
import { VerificationManagement } from "@/components/admin/verification-management";

interface Verification {
  id: string;
  userId: string;
  type: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    workerProfile?: {
      nationalId: string;
      passportNumber: string;
      passportUrl: string;
      category: string;
    } | null;
  };
}

export default async function VerificationsPage() {
  const session = await requireAdmin();

  // Since Verification table doesn't exist, return empty data
  const verifications: Verification[] = [];
  const stats = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  };

  return (
    <VerificationManagement 
      session={session}
      verifications={verifications}
      stats={stats}
    />
  );
}
