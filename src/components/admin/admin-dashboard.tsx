"use client";

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
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session?.user?.name}. Here's what's happening in your system.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button>
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
            <Link key={index} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        {stat.change.startsWith('+') ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change} from last month
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-bold">{stats.totalUsers.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Applications</span>
                <Badge variant="secondary">{stats.pendingApplications}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <Badge variant="outline">{stats.totalReviews}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average Rating</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-medium">{stats.avgRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/admin/verifications">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Review Verifications ({stats.pendingVerifications})
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Review Jobs
                </Button>
              </Link>
              <Link href="/admin/notifications">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Send Notifications
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
                    <Badge variant={user.role === 'WORKER' ? 'secondary' : 'outline'}>
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
    </div>
  );
}
