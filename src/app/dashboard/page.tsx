import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  // Redirect to the default locale dashboard
  redirect('/en/dashboard');
}
