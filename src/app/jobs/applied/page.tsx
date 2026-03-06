"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useNotification } from "@/contexts/notification-context";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

interface JobApplication {
  id: string;
  job: {
    id: string;
    title: string;
    category: string;
    description: string;
    budget: number | null;
    district: string | null;
    status: string;
    createdAt: string;
    employer: {
      name: string;
      phone: string;
    };
  };
  status: string;
  createdAt: string;
}

export default function AppliedJobs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notification = useNotification();
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  const showNotification = (message: string, type: "success" | "error") => {
    if (notification) {
      notification.addNotification(message, type);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session?.user?.role !== "WORKER") {
      router.push("/dashboard");
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/jobs/applied");
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to load applications");
        }
      } catch (error) {
        console.error("Applications fetch error:", error);
        setError("An error occurred while loading applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [session, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending Review";
      case "ACCEPTED":
        return "Accepted";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    const confirmed = await confirm({
      title: "Withdraw Application",
      message: "Are you sure you want to withdraw this application? This action cannot be undone.",
      confirmText: "Withdraw",
      cancelText: "Keep Application",
      type: "danger"
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}/withdraw`, {
        method: "POST",
      });

      if (response.ok) {
        showNotification("Application withdrawn successfully", "success");
        // Remove the application from the list
        setApplications(applications.filter(app => app.id !== applicationId));
      } else {
        const errorData = await response.json();
        showNotification(errorData.error || "Failed to withdraw application", "error");
      }
    } catch (err) {
      console.error("Withdraw error:", err);
      showNotification("Network error. Please try again.", "error");
    }
  };

  if (!session || session.user.role !== "WORKER") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Applied Jobs</h1>
            <p className="text-gray-600">Track the status of your job applications</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't applied to any jobs yet. Start browsing available jobs and submit your applications!
              </p>
              <button
                onClick={() => router.push("/jobs")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {application.job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {application.job.category}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {application.job.district || "Rwanda"}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-3">
                        {application.job.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Employer:</p>
                          <p>{application.job.employer.name}</p>
                          <a href={`tel:${application.job.employer.phone}`} className="text-blue-600 hover:text-blue-800">
                            {application.job.employer.phone}
                          </a>
                        </div>
                        <div>
                          <p className="font-medium">Applied:</p>
                          <p>{formatDate(application.createdAt)}</p>
                        </div>
                        {application.job.budget && (
                          <div>
                            <p className="font-medium">Budget:</p>
                            <p>RWF {application.job.budget.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons based on status */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    {application.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => router.push(`/jobs/${application.job.id}`)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          View Job Details
                        </button>
                        <button
                          onClick={() => handleWithdrawApplication(application.id)}
                          className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Withdraw Application
                        </button>
                      </>
                    )}
                    {application.status === "ACCEPTED" && (
                      <>
                        <button
                          onClick={() => router.push(`/jobs/${application.job.id}`)}
                          className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Contact Employer
                        </button>
                        <button
                          onClick={() => router.push(`/jobs/${application.job.id}`)}
                          className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View Job Details
                        </button>
                      </>
                    )}
                    {application.status === "REJECTED" && (
                      <>
                        <button
                          onClick={() => router.push(`/jobs/${application.job.id}`)}
                          className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View Job Details
                        </button>
                        <button
                          onClick={() => router.push("/jobs")}
                          className="flex-1 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          Find Similar Jobs
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirm Dialog */}
      <ConfirmDialogComponent />
    </DashboardLayout>
  );
}
