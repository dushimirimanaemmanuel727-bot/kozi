"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ChartContainer from "@/components/dashboard/chart-container";
import SimpleBarChart from "@/components/dashboard/simple-bar-chart";
import ActivityFeed from "@/components/dashboard/activity-feed";
import QuickActions from "@/components/dashboard/quick-actions";
import Link from "next/link";

interface DashboardStats {
  activeJobs: number;
  pendingApplications: number;
  workersHired: number;
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
  applicationsTrend: Array<{ createdAt: string; _count: { id: number } }>;
  recommendedJobs: Array<{
    id: string;
    title: string;
    category: string;
    salary: number;
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | WorkerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      try {
        setLoading(true);
        
        // Fetch basic stats
        const statsResponse = await fetch("/api/dashboard/employer/stats");
        if (!statsResponse.ok && session.user.role === "EMPLOYER") {
          throw new Error("Failed to fetch dashboard stats");
        }
        if (session.user.role === "EMPLOYER") {
          const statsData: DashboardStats = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch analytics data
        const analyticsEndpoint = session.user.role === "EMPLOYER" 
          ? "/api/dashboard/employer/analytics"
          : "/api/dashboard/worker/analytics";
        
        const analyticsResponse = await fetch(analyticsEndpoint);
        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const formatChartData = (data: Array<{ createdAt: string; _count: { id: number } }>) => {
    return data.map(item => ({
      label: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: item._count.id
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

  const getQuickActions = () => {
    if (session?.user?.role === "EMPLOYER") {
      return [
        {
          id: "post-job",
          title: "Post New Job",
          description: "Create a new job posting",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ),
          href: "/jobs/new",
          color: "green" as const
        },
        {
          id: "view-applications",
          title: "Review Applications",
          description: "Check pending applications",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          href: "/applications",
          color: "blue" as const
        },
        {
          id: "browse-workers",
          title: "Browse Workers",
          description: "Find qualified workers",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          href: "/workers",
          color: "purple" as const
        },
        {
          id: "my-jobs",
          title: "My Jobs",
          description: "Manage your job postings",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          href: "/jobs/my-jobs",
          color: "orange" as const
        }
      ];
    } else {
      return [
        {
          id: "browse-jobs",
          title: "Browse Jobs",
          description: "Find new opportunities",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
            </svg>
          ),
          href: "/jobs",
          color: "blue" as const
        },
        {
          id: "edit-profile",
          title: "Edit Profile",
          description: "Update your information",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          href: "/profile/worker/edit",
          color: "green" as const
        },
        {
          id: "view-applications",
          title: "My Applications",
          description: "Track your applications",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
          href: "/jobs/applied",
          color: "purple" as const
        },
        {
          id: "reviews",
          title: "Reviews",
          description: "View your reviews",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.69.69l4.338.632c.925.134 1.294 1.27.624 1.921l-3.138 3.058a1 1 0 00-.286.894l.739 4.322c.165.962-.868 1.696-1.757 1.242l-3.881-2.041a1 1 0 00-.928 0l-3.881 2.041c-.889.454-1.922-.28-1.757-1.242l.739-4.322a1 1 0 00-.286-.894l-3.138-3.058c-.67-.651-.301-1.787.624-1.921l4.338-.632a1 1 0 00.69-.69l1.519-4.674z" />
            </svg>
          ),
          href: "/reviews",
          color: "orange" as const
        }
      ];
    }
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

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions actions={getQuickActions()} role={session?.user?.role as "EMPLOYER" | "WORKER"} />
        </div>

        {/* Stats Cards */}
        {session?.user?.role === "EMPLOYER" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Jobs"
              value={stats.activeJobs}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Pending Applications"
              value={stats.pendingApplications}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              }
              color="yellow"
            />
            <StatsCard
              title="Workers Hired"
              value={stats.workersHired}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Total Applications"
              value={stats.pendingApplications + stats.workersHired}
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
                  <>
                    <ChartContainer
                      title="Job Postings Trend"
                      subtitle="Number of jobs posted over the last 6 months"
                    >
                      <SimpleBarChart
                        data={formatChartData((analytics as AnalyticsData).jobPostingsTrend)}
                        height={200}
                      />
                    </ChartContainer>

                    <ChartContainer
                      title="Applications Trend"
                      subtitle="Number of applications received over the last 6 months"
                    >
                      <SimpleBarChart
                        data={formatChartData((analytics as AnalyticsData).applicationsTrend)}
                        height={200}
                      />
                    </ChartContainer>

                    <ChartContainer
                      title="Job Categories"
                      subtitle="Distribution of jobs by category"
                    >
                      <SimpleBarChart
                        data={formatCategoryData((analytics as AnalyticsData).categoryDistribution)}
                        height={200}
                      />
                    </ChartContainer>
                  </>
                )}

                {session?.user?.role === "WORKER" && (
                  <>
                    <ChartContainer
                      title="Application Status"
                      subtitle="Your applications by status"
                    >
                      <SimpleBarChart
                        data={formatCategoryData((analytics as WorkerAnalyticsData).applicationStatusDistribution)}
                        height={200}
                      />
                    </ChartContainer>

                    <ChartContainer
                      title="Applications Trend"
                      subtitle="Your application activity over the last 6 months"
                    >
                      <SimpleBarChart
                        data={formatChartData((analytics as WorkerAnalyticsData).applicationsTrend)}
                        height={200}
                      />
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
                    <p className="text-sm font-medium text-green-600">RWF {job.salary.toLocaleString()}/month</p>
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
