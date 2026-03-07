"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import { NotificationProvider, NotificationContainer } from "@/contexts/notification-context";
import NotificationBell from "@/components/notifications/notification-bell";
import ModernSidebar from "@/components/layout/modern-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile?: any;
}

export default function DashboardLayout({ children, userProfile }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState<any>(null);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const endpoint = session?.user?.role === "WORKER" 
        ? "/api/profile/worker/current" 
        : "/api/profile/employer/current";
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setUserProfileData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Modern Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ModernSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {userProfileData?.photoUrl ? (
                    <img 
                      src={userProfileData.photoUrl} 
                      alt={session?.user?.name || "Profile"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
        
        {/* Notification Container */}
        <NotificationContainer />
      </div>
    </NotificationProvider>
  );
}
