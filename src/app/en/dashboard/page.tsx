"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function DashboardRedirect() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) return;
    
    const role = session.user?.role?.toLowerCase();
    
    if (role === 'employer') {
      router.push('/dashboard/employer');
    } else if (role === 'worker') {
      router.push('/dashboard/worker');
    } else if (role === 'admin' || role === 'superadmin') {
      router.push('/admin');
    }
  }, [session, router]);

  return (
    <DashboardLayout>
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
