"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/auth/sign-out-button";
import NotificationBell from "@/components/notifications/notification-bell";

interface ModernSidebarProps {
  onClose?: () => void;
}

export default function ModernSidebar({ onClose }: ModernSidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const workerNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: "blue"
    },
    {
      href: "/profile/worker/edit",
      label: "My Profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "green"
    }
  ];

  const employerNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: "blue"
    },
    {
      href: "/jobs/new",
      label: "Post Job",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: "green"
    },
    {
      href: "/jobs/my-jobs",
      label: "My Jobs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "purple"
    },
    {
      href: "/applications",
      label: "Applications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      color: "orange"
    },
    {
      href: "/workers",
      label: "Browse Workers",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "pink"
    },
    {
      href: "/favorites",
      label: "Favorites",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "red"
    }
  ];

  const quickActions = session?.user?.role === "WORKER" ? [
    {
      href: "/jobs",
      label: "Browse Jobs",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
        </svg>
      ),
      bgGradient: "from-slate-50 to-slate-100",
      textGradient: "text-slate-700",
      hoverGradient: "hover:from-slate-100 hover:to-slate-200"
    },
    {
      href: "/jobs/applied",
      label: "Applications",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      bgGradient: "from-indigo-50 to-indigo-100",
      textGradient: "text-indigo-700",
      hoverGradient: "hover:from-indigo-100 hover:to-indigo-200"
    },
    {
      href: "/reviews",
      label: "Reviews",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.69.69l4.338.632c.925.134 1.294 1.27.624 1.921l-3.138 3.058a1 1 0 00-.286.894l.739 4.322c.165.962-.868 1.696-1.757 1.242l-3.881-2.041a1 1 0 00-.928 0l-3.881 2.041c-.889.454-1.922-.28-1.757-1.242l.739-4.322a1 1 0 00-.286-.894l-3.138-3.058c-.67-.651-.301-1.787.624-1.921l4.338-.632a1 1 0 00.69-.69l1.519-4.674z" />
        </svg>
      ),
      bgGradient: "from-amber-50 to-amber-100",
      textGradient: "text-amber-700",
      hoverGradient: "hover:from-amber-100 hover:to-amber-200"
    }
  ] : [
    {
      href: "/jobs/new",
      label: "Post Job",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      bgGradient: "from-emerald-50 to-emerald-100",
      textGradient: "text-emerald-700",
      hoverGradient: "hover:from-emerald-100 hover:to-emerald-200"
    },
    {
      href: "/applications",
      label: "Review Apps",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      bgGradient: "from-blue-50 to-blue-100",
      textGradient: "text-blue-700",
      hoverGradient: "hover:from-blue-100 hover:to-blue-200"
    },
    {
      href: "/workers",
      label: "Find Workers",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgGradient: "from-violet-50 to-violet-100",
      textGradient: "text-violet-700",
      hoverGradient: "hover:from-violet-100 hover:to-violet-200"
    }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors: { [key: string]: { active: string; inactive: string } } = {
      blue: {
        active: "bg-blue-600 text-white shadow-blue-600/50",
        inactive: "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
      },
      green: {
        active: "bg-green-600 text-white shadow-green-600/50",
        inactive: "text-gray-600 hover:text-green-600 hover:bg-green-50"
      },
      purple: {
        active: "bg-purple-600 text-white shadow-purple-600/50",
        inactive: "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
      },
      orange: {
        active: "bg-orange-600 text-white shadow-orange-600/50",
        inactive: "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
      },
      pink: {
        active: "bg-pink-600 text-white shadow-pink-600/50",
        inactive: "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
      },
      red: {
        active: "bg-red-600 text-white shadow-red-600/50",
        inactive: "text-gray-600 hover:text-red-600 hover:bg-red-50"
      }
    };
    
    return isActive ? colors[color]?.active || colors.blue.active : colors[color]?.inactive || colors.blue.inactive;
  };

  const navItems = session?.user?.role === "WORKER" ? workerNavItems : employerNavItems;

  return (
    <div className="w-72 h-full bg-white border-r border-gray-100 flex flex-col shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">KaziHome</h1>
            <p className="text-xs text-gray-500 capitalize">{session?.user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Main Menu</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const colorClasses = getColorClasses(item.color, isActive);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ease-out ${
                    isActive 
                      ? `${colorClasses} shadow-lg scale-[1.02]` 
                      : `${colorClasses} hover:scale-[1.01]`
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                    isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                  } transition-colors duration-200`}>
                    <div className={isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={`ml-3 font-semibold ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Actions */}
        <div className="px-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={onClose}
                className={`group flex items-center px-4 py-3 bg-gradient-to-r ${action.bgGradient} ${action.textGradient} rounded-2xl ${action.hoverGradient} transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-xl bg-white/60 group-hover:bg-white transition-colors duration-200`}>
                  <div className={action.textGradient}>
                    {action.icon}
                  </div>
                </div>
                <span className="ml-3 font-medium text-sm">
                  {action.label}
                </span>
                <svg 
                  className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {session?.user?.role}
              </p>
            </div>
          </div>
          <NotificationBell />
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
