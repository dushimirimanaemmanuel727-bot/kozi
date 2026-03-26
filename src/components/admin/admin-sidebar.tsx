"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Briefcase,
  FileText,
  Settings,
  Shield,
  Home,
  TrendingUp,
  UserCheck,
  Building,
  MessageSquare,
  Calendar,
  Database
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/verifications", label: "Verifications", icon: Shield },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/organizations", label: "Organizations", icon: Building },
  { href: "/admin/system", label: "System", icon: Settings },
  { href: "/admin/system", label: "Logs", icon: Database },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">System Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {adminNavItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                         (item.href !== "/admin" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
