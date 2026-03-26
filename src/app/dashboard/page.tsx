import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }

  const userRole = session.user?.role?.toLowerCase();

  if (userRole === 'employer') {
    redirect('/dashboard/employer');
  } else if (userRole === 'worker') {
    redirect('/dashboard/worker');
  } else if (userRole === 'admin' || userRole === 'superadmin') {
    redirect('/admin');
  }

  // Fallback to the unified dashboard
  redirect('/en/dashboard');
}
