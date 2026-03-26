"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StatsCard from "@/components/dashboard/stats-card";
import ChartContainer from "@/components/dashboard/chart-container";
import ActivityFeed from "@/components/dashboard/activity-feed";
import Link from "next/link";

interface DashboardStats {
  totalApplications?: number;
  acceptedApplications?: number;
  rejectedApplications?: number;
  pendingApplications?: number;
  profileCompletion?: number;
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

export default function WorkerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<WorkerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      try {
        setLoading(true);
        
        // Fetch worker stats
        const statsResponse = await fetch("/api/dashboard/worker/stats");
        if (!statsResponse.ok) throw new Error("Failed to fetch dashboard stats");
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch worker analytics
        const analyticsResponse = await fetch("/api/dashboard/worker/analytics");
        if (!analyticsResponse.ok) throw new Error("Failed to fetch analytics data");
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

  const getActivityItems = () => {
    if (!analytics) return [];
    return analytics.recentApplications.map(app => ({
      id: app.id,
      type: "application" as const,
      title: `Application for ${app.job.title}`,
      description: `Applied to ${app.job.employer.name}`,
      timestamp: new Date(app.createdAt),
      status: app.status,
      actionUrl: `/jobs/applied`,
      actionText: "View Status"
    }));
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
          <h1 className="text-2xl font-bold mb-6">Worker Dashboard</h1>
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
            Worker Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name}! Track your applications and find new opportunities.
          </p>
        </div>

        {/* Profile Completion Alert */}
        {stats && stats.profileCompletion !== undefined && stats.profileCompletion < 100 && (
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-2xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-1">
                      Complete Your Profile! 🚀
                    </h3>
                    <p className="text-blue-700">
                      Your profile is only <span className="font-bold">{stats.profileCompletion}%</span> complete. 
                    </p>
                  </div>
                  <Link
                    href="/profile/worker/edit"
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
                  >
                    Finish Setup
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Applications"
              value={analytics.stats.totalApplications}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              color="blue"
            />
            <StatsCard
              title="Accepted"
              value={analytics.stats.acceptedApplications}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="green"
            />
            <StatsCard
              title="Success Rate"
              value={`${analytics.stats.successRate}%`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="purple"
            />
            <StatsCard
              title="Recommended Jobs"
              value={analytics.recommendedJobs.length}
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
          <div className="lg:col-span-2 space-y-8">
            <ChartContainer
              title="Recommended Jobs"
              subtitle="Jobs matching your profile"
              actions={
                <Link
                  href="/jobs"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Jobs →
                </Link>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics?.recommendedJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{job.employer.name}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-sm font-medium text-green-600">
                        {job.budget ? `RWF ${job.budget.toLocaleString()}` : 'Negotiable'}
                      </span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>

          <div className="space-y-8">
            <ChartContainer
              title="Recent Activity"
              subtitle="Your application updates"
            >
              <ActivityFeed activities={getActivityItems()} />
            </ChartContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
