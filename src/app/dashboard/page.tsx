import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);
  
  // Redirect admin users to admin dashboard
  if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN') {
    redirect('/admin');
  }
  
  // Redirect regular users to the default locale dashboard
  redirect('/en/dashboard');
}
