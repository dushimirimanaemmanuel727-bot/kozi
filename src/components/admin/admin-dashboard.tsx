"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  FileText,
  Shield,
  TrendingUp,
  Clock,
  Star,
  Building,
  UserCheck,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Bell
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  session: any;
  stats: {
    totalUsers: number;
    totalJobs: number;
    totalApplications: number;
    pendingVerifications: number;
    workers: number;
    employers: number;
    openJobs: number;
    pendingApplications: number;
    totalReviews: number;
    avgRating: number;
  };
  trends: {
    userTrend: string;
    jobTrend: string;
    applicationTrend: string;
    verificationTrend: string;
  };
  recentUsers: any[];
  activeJobs: any[];
}

export function AdminDashboard({
  session,
  stats,
  trends,
  recentUsers,
  activeJobs
}: AdminDashboardProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: trends.userTrend,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/admin/users"
    },
    {
      title: "Active Jobs",
      value: stats.openJobs.toLocaleString(),
      change: trends.jobTrend,
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/admin/jobs"
    },
    {
      title: "Applications",
      value: stats.totalApplications.toLocaleString(),
      change: trends.applicationTrend,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/admin/applications"
    },
    {
      title: "Pending Verifications",
      value: stats.pendingVerifications.toLocaleString(),
      change: trends.verificationTrend,
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/admin/verifications"
    }
  ];

  const userBreakdown = [
    { label: "Workers", value: stats.workers, color: "bg-blue-500" },
    { label: "Employers", value: stats.employers, color: "bg-green-500" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-4 md:p-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Welcome back, {session?.user?.name}. Manage your system overview here.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50">
            <Eye className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100">
            <TrendingUp className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-none shadow-sm ring-1 ring-gray-100 rounded-2xl overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        <div className="flex items-center mt-3">
                          <div className={cn(
                            "flex items-center px-2 py-0.5 rounded-full text-xs font-bold",
                            stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          )}>
                            {stat.change.startsWith('+') ? (
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 mr-1" />
                            )}
                            {stat.change}
                          </div>
                          <span className="text-xs text-gray-400 ml-2 font-medium">vs last month</span>
                        </div>
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl transition-transform group-hover:scale-110",
                        stat.bgColor
                      )}>
                        <Icon className={cn("w-7 h-7", stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Breakdown */}
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-5">
              {userBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3 shadow-sm`}></div>
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-5 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Registered</span>
                  <span className="text-lg font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Pending Apps</span>
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-none font-bold px-3">
                  {stats.pendingApplications}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Reviews</span>
                <Badge variant="outline" className="text-gray-700 border-gray-200 font-bold px-3">
                  {stats.totalReviews}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Avg Rating</span>
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1.5" />
                  <span className="text-sm font-bold text-yellow-700">{stats.avgRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="pt-5 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Service Uptime</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-bold px-3">
                    Healthy
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-none shadow-sm ring-1 ring-gray-100 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg font-bold text-gray-800">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Priority Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Link href="/admin/verifications">
                <Button variant="outline" className="w-full justify-start rounded-xl border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold group transition-all">
                  <UserCheck className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                  Verifications ({stats.pendingVerifications})
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start rounded-xl border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold group transition-all">
                  <Users className="w-4 h-4 mr-3 text-green-500 group-hover:scale-110 transition-transform" />
                  User Management
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full justify-start rounded-xl border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold group transition-all">
                  <Briefcase className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform" />
                  Review Listings
                </Button>
              </Link>
              <Link href="/admin/notifications">
                <Button variant="outline" className="w-full justify-start rounded-xl border-gray-100 hover:bg-gray-50 text-gray-700 font-semibold group transition-all">
                  <Bell className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                  System Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={user.role?.toLowerCase() === 'worker' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.employer.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{job.category}</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.applications.length} applications
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
