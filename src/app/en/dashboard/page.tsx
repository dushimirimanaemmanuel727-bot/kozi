"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ChartContainer from "@/components/dashboard/chart-container";
import AvailableWorkers from "@/components/dashboard/available-workers";
import ActivityFeed from "@/components/dashboard/activity-feed";
import Link from "next/link";

interface DashboardStats {
  activeJobs?: number;
  pendingApplications?: number;
  workersHired?: number;
  totalApplications?: number;
  acceptedApplications?: number;
  rejectedApplications?: number;
  profileCompletion?: number;
}

interface AnalyticsData {
  jobPostingsTrend: Array<{ createdAt: string; _count: { id: number } }>;
  applicationsTrend: Array<{ createdAt: string; _count: { id: number } }>;
  categoryDistribution: Array<{ category: string; _count: { id: number } }>;
  recentApplications: Array<{
    id: string;
    status: string;
    createdAt: string;
    job: {
      title: string;
      category: string;
    };
    worker: {
      name: string;
      workerProfile: {
        photoUrl?: string;
      };
    };
  }>;
  popularCategories: Array<{
    category: string;
    _count: {
      applications: number;
    };
  }>;
}

interface WorkerAnalyticsData {
  applicationStatusDistribution: Array<{ status: string; _count: { id: number } }>;
  applicationsTrend: Array<{ month: string; count: number }>;
  recommendedJobs: Array<{
    id: string;
    title: string;
    category: string;
    budget?: number;
    district: string;
    employer: {
      name: string;
    };
    _count: {
      applications: number;
    };
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    createdAt: string;
    job: {
      title: string;
      employer: {
        name: string;
      };
    };
  }>;
  stats: {
    totalApplications: number;
    acceptedApplications: number;
    successRate: number;
  };
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | WorkerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN') {
      router.push('/admin');
      return;
    }
  }, [session, router]);

  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      try {
        setLoading(true);
        
        // Fetch basic stats
        let statsData = null;
        if (session.user.role === "EMPLOYER") {
          const statsResponse = await fetch("/api/dashboard/employer/stats");
          console.log("Employer stats response status:", statsResponse.status);
          if (!statsResponse.ok) {
            throw new Error("Failed to fetch dashboard stats");
          }
          statsData = await statsResponse.json();
        } else if (session.user.role === "WORKER") {
          const statsResponse = await fetch("/api/dashboard/worker/stats");
          console.log("Worker stats response status:", statsResponse.status);
          if (!statsResponse.ok) {
            const errorData = await statsResponse.json();
            console.error("Worker stats error:", errorData);
            throw new Error(errorData.error || "Failed to fetch dashboard stats");
          }
          statsData = await statsResponse.json();
          console.log("Worker stats data:", statsData);
        }
        setStats(statsData);

        // Fetch analytics data
        const analyticsEndpoint = session.user.role === "EMPLOYER" 
          ? "/api/dashboard/employer/analytics"
          : "/api/dashboard/worker/analytics";
        
        const analyticsResponse = await fetch(analyticsEndpoint);
        console.log("Analytics response status:", analyticsResponse.status);
        if (!analyticsResponse.ok) {
          const errorData = await analyticsResponse.json();
          console.error("Analytics error:", errorData);
          throw new Error(errorData.error || "Failed to fetch analytics data");
        }
        const analyticsData = await analyticsResponse.json();
        console.log("Analytics data:", analyticsData);
        setAnalytics(analyticsData);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const formatChartData = (data: Array<{ createdAt: string; _count: { id: number } } | { month: string; count: number }>) => {
    if (data.length === 0) return [];
  
    // Handle new trend data structure
    if ('month' in data[0]) {
      return data.map((item: any) => ({
        label: item.month,
        value: item.count
      }));
    }
  
    // Handle old data structure
    return data.map(item => ({
      label: new Date((item as any).createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: (item as any)._count.id
    }));
  };

  const formatCategoryData = (data: Array<{ category?: string; status?: string; _count: { id: number } }>) => {
    return data.map(item => ({
      label: item.category || item.status || 'Unknown',
      value: item._count.id
    }));
  };

  const getActivityItems = () => {
    if (!analytics) return [];
    
    if (session?.user?.role === "EMPLOYER") {
      const employerAnalytics = analytics as AnalyticsData;
      return employerAnalytics.recentApplications.map(app => ({
        id: app.id,
        type: "application" as const,
        title: `New application for ${app.job.title}`,
        description: `${app.worker.name} applied for the ${app.job.category} position`,
        timestamp: new Date(app.createdAt),
        status: app.status,
        actionUrl: `/applications`,
        actionText: "View Application"
      }));
    } else {
      const workerAnalytics = analytics as WorkerAnalyticsData;
      return workerAnalytics.recentApplications.map(app => ({
        id: app.id,
        type: "application" as const,
        title: `Application for ${app.job.title}`,
        description: `Applied to ${app.job.employer.name}`,
        timestamp: new Date(app.createdAt),
        status: app.status,
        actionUrl: `/jobs/applied`,
        actionText: "View Status"
      }));
    }
  };

  const getAvailableWorkers = () => {
    // Sample worker data - in a real app, this would come from an API
    return [
      {
        id: "1",
        name: "John Doe",
        skills: ["Plumbing", "Construction", "Electrical"],
        experience: "5 years",
        location: "Kigali",
        expectedSalary: 500,
        availability: "IMMEDIATE",
        profileCompletion: 90,
        photoUrl: undefined,
        rating: 4.5,
        jobApplications: 12
      },
      {
        id: "2", 
        name: "Jane Smith",
        skills: ["Cleaning", "Cooking", "Childcare"],
        experience: "3 years",
        location: "Nyarugenge",
        expectedSalary: 350,
        availability: "WEEK",
        profileCompletion: 85,
        photoUrl: undefined,
        rating: 4.8,
        jobApplications: 8
      },
      {
        id: "3",
        name: "Robert Mugisha",
        skills: ["Driving", "Logistics", "Delivery"],
        experience: "7 years", 
        location: "Kicukiro",
        expectedSalary: 450,
        availability: "IMMEDIATE",
        profileCompletion: 95,
        photoUrl: undefined,
        rating: 4.2,
        jobApplications: 15
      },
      {
        id: "4",
        name: "Grace Uwimana",
        skills: ["Gardening", "Landscaping", "Farming"],
        experience: "4 years",
        location: "Gasabo",
        expectedSalary: 300,
        availability: "TWO_WEEKS",
        profileCompletion: 80,
        photoUrl: undefined,
        rating: 4.6,
        jobApplications: 6
      }
    ];
  };

  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your {session?.user?.role === "EMPLOYER" ? "business" : "job search"} today.
          </p>
        </div>

        
        {/* Stats Cards */}
        {session?.user?.role === "EMPLOYER" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Jobs"
              value={stats.activeJobs ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Pending Applications"
              value={stats.pendingApplications ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              color="yellow"
            />
            <StatsCard
              title="Workers Hired"
              value={stats.workersHired ?? 0}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Total Applications"
              value={(stats.pendingApplications ?? 0) + (stats.workersHired ?? 0)}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="purple"
            />
          </div>
        )}

        {session?.user?.role === "WORKER" && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Applications"
              value={(analytics as WorkerAnalyticsData).stats.totalApplications}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Accepted Applications"
              value={(analytics as WorkerAnalyticsData).stats.acceptedApplications}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Success Rate"
              value={`${(analytics as WorkerAnalyticsData).stats.successRate}%`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="purple"
            />
            <StatsCard
              title="Recommended Jobs"
              value={(analytics as WorkerAnalyticsData).recommendedJobs.length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                </svg>
              }
              color="orange"
            />
          </div>
        )}

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
            {analytics && (
              <>
                {session?.user?.role === "EMPLOYER" && (
                  <ChartContainer
                    title="Available Workers"
                    subtitle="Workers currently available for hire"
                    actions={
                      <Link
                        href="/workers"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View All Workers →
                      </Link>
                    }
                  >
                    <AvailableWorkers 
                      workers={getAvailableWorkers()} 
                      loading={loading}
                    />
                  </ChartContainer>
                )}

                {session?.user?.role === "WORKER" && (
                  <>
                    <ChartContainer
                      title="Application Status"
                      subtitle="Your applications by status"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats?.pendingApplications || 0}</div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats?.acceptedApplications || 0}</div>
                          <div className="text-sm text-gray-600">Accepted</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{stats?.rejectedApplications || 0}</div>
                          <div className="text-sm text-gray-600">Rejected</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{stats?.totalApplications || 0}</div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>
                      </div>
                    </ChartContainer>

                    <ChartContainer
                      title="Profile Completion"
                      subtitle="Complete your profile to get better job matches"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Profile Strength</span>
                          <span className="text-sm text-gray-500">{stats?.profileCompletion || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${stats?.profileCompletion || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stats?.profileCompletion && stats.profileCompletion >= 90 
                            ? "Excellent! Your profile is complete."
                            : stats?.profileCompletion && stats.profileCompletion >= 70
                            ? "Good! Add more details to improve your profile."
                            : "Complete your profile to get better job matches."
                          }
                        </div>
                      </div>
                    </ChartContainer>
                  </>
                )}
              </>
            )}
          </div>

          {/* Activity Feed */}
          <div className="space-y-8">
            <ChartContainer
              title="Recent Activity"
              subtitle="Latest updates and notifications"
            >
              <ActivityFeed activities={getActivityItems()} />
            </ChartContainer>
          </div>
        </div>

        {/* Recommended Jobs for Workers */}
        {session?.user?.role === "WORKER" && analytics && (
          <div className="mt-8">
            <ChartContainer
              title="Recommended Jobs"
              subtitle="Jobs matching your profile and preferences"
              actions={
                <Link
                  href="/jobs"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Jobs →
                </Link>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(analytics as WorkerAnalyticsData).recommendedJobs.slice(0, 6).map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{job.employer.name}</p>
                    <p className="text-sm text-gray-600 mb-1">{job.category}</p>
                    <p className="text-sm text-gray-600 mb-1">{job.district}</p>
                    <p className="text-sm font-medium text-green-600">
                      {job.budget ? `RWF ${job.budget.toLocaleString()}/month` : 'Salary not specified'}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">{job._count.applications} applications</span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
