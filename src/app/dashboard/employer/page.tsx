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
}

export default function EmployerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      try {
        setLoading(true);
        
        // Fetch employer stats
        const statsResponse = await fetch("/api/dashboard/employer/stats");
        if (!statsResponse.ok) throw new Error("Failed to fetch dashboard stats");
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch employer analytics
        const analyticsResponse = await fetch("/api/dashboard/employer/analytics");
        if (!analyticsResponse.ok) throw new Error("Failed to fetch analytics data");
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
        
        // Fetch available workers
        const workersResponse = await fetch("/api/workers");
        if (workersResponse.ok) {
          const workersData = await workersResponse.json();
          console.log('Workers API response:', workersData);
          setAvailableWorkers(workersData || []);
        } else {
          console.error('Workers API failed:', workersResponse.status);
        }
        
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
      title: `New application for ${app.job.title}`,
      description: `${app.worker.name} applied for the ${app.job.category} position`,
      timestamp: new Date(app.createdAt),
      status: app.status,
      actionUrl: `/applications`,
      actionText: "View Application"
    }));
  };

  const getAvailableWorkers = () => {
    return availableWorkers.slice(0, 4).map((worker: any) => ({
      id: worker.id,
      name: worker.user?.name || worker.name || 'Unknown',
      skills: worker.skills ? worker.skills.split(',').slice(0, 3) : [],
      experience: `${worker.experienceYears}+ years`,
      location: worker.user?.district || worker.district || 'Kigali',
      expectedSalary: worker.minMonthlyPay,
      availability: worker.availability?.replace('_', ' ') || worker.availability,
      profileCompletion: 85,
      photoUrl: worker.photoUrl,
      rating: worker.rating,
      jobApplications: 0
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
          <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>
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
            Employer Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name}! Manage your job postings and find the best workers.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
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

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-8">
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
          </div>

          {/* Activity Feed */}
          <div className="space-y-8">
            <ChartContainer
              title="Recent Activity"
              subtitle="Latest updates on your job postings"
            >
              <ActivityFeed activities={getActivityItems()} />
            </ChartContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
