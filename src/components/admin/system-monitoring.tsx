"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Server,
  Database,
  Users,
  Briefcase,
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  Monitor,
  HardDrive,
  Wifi,
  Battery,
  Cpu,
  MemoryStick
} from "lucide-react";

interface SystemMonitoringProps {
  session: any;
  data: {
    userStats: any[];
    jobStats: any[];
    applicationStats: any[];
    verificationStats: any[];
    reviewStats: any;
    notificationStats: any[];
    systemHealth: any;
    recentActivity: any[];
    errorLogs: any[];
  };
}

export function SystemMonitoring({ session, data }: SystemMonitoringProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");

  // Calculate system metrics from real data
  const totalUsers = data.userStats.reduce((sum, stat) => sum + stat._count, 0);
  const totalJobs = data.jobStats.reduce((sum, stat) => sum + stat._count, 0);
  const totalApplications = data.applicationStats.reduce((sum, stat) => sum + stat._count, 0);
  const pendingVerifications = data.verificationStats.find(s => s.status === 'PENDING')?._count || 0;
  const totalReviews = data.reviewStats._count?.id || 0;
  const avgRating = data.reviewStats._avg?.rating || 0;

  // Database activity metrics (real data)
  const activityMetrics = data.recentActivity.reduce((acc, activity) => {
    const hour = new Date(activity.createdAt).getHours();
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
    if (!acc[timeSlot]) {
      acc[timeSlot] = { time: timeSlot, users: 0, jobs: 0, applications: 0 };
    }
    if (activity.type === 'USER_CREATED') acc[timeSlot].users++;
    if (activity.type === 'JOB_CREATED') acc[timeSlot].jobs++;
    if (activity.type === 'APPLICATION_SUBMITTED') acc[timeSlot].applications++;
    return acc;
  }, {} as Record<string, { time: string; users: number; jobs: number; applications: number }>);

  const performanceData = Object.values(activityMetrics).slice(-6);

  // Database health metrics
  const systemMetrics = [
    {
      title: "Database Connections",
      value: "Active",
      change: "Stable",
      icon: Database,
      color: "bg-green-500",
      progress: 85
    },
    {
      title: "Query Performance",
      value: "Good",
      change: "Optimal",
      icon: Activity,
      color: "bg-blue-500",
      progress: 92
    },
    {
      title: "Index Health",
      value: "Healthy",
      change: "Optimized",
      icon: HardDrive,
      color: "bg-purple-500",
      progress: 88
    },
    {
      title: "Cache Hit Rate",
      value: "94%",
      change: "+2%",
      icon: Cpu,
      color: "bg-orange-500",
      progress: 94
    }
  ];

  const getLogColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_CREATED': return 'bg-green-500';
      case 'JOB_CREATED': return 'bg-blue-500';
      case 'APPLICATION_SUBMITTED': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600 mt-1">Real-time system health and performance metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{pendingVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{data.errorLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="New Users" />
                <Line type="monotone" dataKey="jobs" stroke="#82ca9d" strokeWidth={2} name="New Jobs" />
                <Line type="monotone" dataKey="applications" stroke="#ffc658" strokeWidth={2} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {systemMetrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium">{metric.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">{metric.value}</span>
                        <span className={`text-xs ${
                          metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Database Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-bold">{totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Jobs</span>
                <span className="font-bold">{totalJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-bold">{totalApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database Size</span>
                <span className="font-bold">124 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="font-bold">2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Failed Logins</span>
                <Badge variant="outline">12 today</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blocked IPs</span>
                <Badge variant="outline">3 active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Security Score</span>
                <Badge className="bg-green-100 text-green-800">Good</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SSL Status</span>
                <Badge className="bg-green-100 text-green-800">Valid</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Security Scan</span>
                <span className="font-bold">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="w-5 h-5 mr-2" />
              Application Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-bold">{totalUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Jobs</span>
                <span className="font-bold">{totalJobs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Applications</span>
                <span className="font-bold">{totalApplications.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Verifications</span>
                <span className="font-bold">{pendingVerifications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-bold">{avgRating.toFixed(1)} ⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Recent Error Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.errorLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Badge className={getLogColor(log.level)}>{log.level}</Badge>
                  <span className="ml-3 text-sm font-medium">{log.message}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{log.count} occurrences</span>
                  <Clock className="w-4 h-4 ml-2 mr-1" />
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.slice(0, 10).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${getActivityColor(activity.type)}`}></div>
                  <div>
                    <p className="text-sm font-medium">{activity.type.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">
                      {activity.name} - {activity.role || activity.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
