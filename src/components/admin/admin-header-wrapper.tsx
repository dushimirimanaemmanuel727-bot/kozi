"use client";

import dynamic from 'next/dynamic';

// Dynamically import AdminHeader to prevent SSR hydration issues
const AdminHeader = dynamic(() => import("@/components/admin/admin-header").then(mod => ({ default: mod.AdminHeader })), {
  ssr: false,
  loading: () => (
    <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <div className="w-64 h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
});

interface AdminHeaderWrapperProps {
  session: any;
}

export function AdminHeaderWrapper({ session }: AdminHeaderWrapperProps) {
  return <AdminHeader session={session} />;
}
