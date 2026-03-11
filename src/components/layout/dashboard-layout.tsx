"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NotificationProvider, NotificationContainer } from "@/contexts/notification-context";
import NotificationBell from "@/components/notifications/notification-bell";
import ModernSidebar from "@/components/layout/modern-sidebar";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  role?: string;
  [key: string]: unknown;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile?: UserProfile;
}

export default function DashboardLayout({ children, userProfile }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const userRole = session?.user?.role?.toLowerCase();
      const endpoint = userRole === "worker" 
        ? "/api/profile/worker/current" 
        : "/api/profile/employer/current";
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json() as UserProfile;
        setUserProfileData(data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  }, [session?.user?.role]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

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
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
            <div className="flex items-center justify-between px-8 py-5">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden border border-gray-200 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-6 ml-auto">
                <NotificationBell />
                <div className="flex items-center space-x-4 pl-6 border-l border-gray-100">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{session?.user?.name}</p>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-0.5">{session?.user?.role}</p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-gray-50 flex items-center justify-center shadow-sm">
                    {userProfileData?.photoUrl ? (
                      <img 
                        src={userProfileData.photoUrl} 
                        alt={session?.user?.name || "Profile"} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </div>
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
