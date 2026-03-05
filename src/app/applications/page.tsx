"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    category: string;
    description: string;
    budget: number | null;
    district: string | null;
    status: string;
  };
  worker: {
    id: string;
    name: string;
    phone: string;
    category: string;
    experienceYears: number;
    rating: number;
    reviewCount: number;
    photoUrl: string | null;
  };
}

export default function Applications() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  useEffect(() => {
    if (session?.user.role !== "EMPLOYER") {
      router.push("/dashboard");
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications");
        if (response.ok) {
          const data = await response.json();
          setApplications(data);
        } else {
          setError("Failed to load applications");
        }
      } catch (error) {
        setError("An error occurred while loading applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [session, router]);

  const filteredApplications = applications.filter(app => {
    if (filter === "pending") return app.status === "PENDING";
    if (filter === "accepted") return app.status === "ACCEPTED";
    if (filter === "rejected") return app.status === "REJECTED";
    return true;
  });

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

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/accept`, {
        method: "POST",
      });
      if (response.ok) {
        // Refresh applications
        const updatedApplications = applications.map(app =>
          app.id === applicationId ? { ...app, status: "ACCEPTED" } : app
        );
        setApplications(updatedApplications);
      }
    } catch {
        setError("Failed to accept application");
      }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "POST",
      });
      if (response.ok) {
        // Refresh applications
        const updatedApplications = applications.map(app =>
          app.id === applicationId ? { ...app, status: "REJECTED" } : app
        );
        setApplications(updatedApplications);
      }
    } catch {
        setError("Failed to reject application");
      }
  };

  if (!session || session.user.role !== "EMPLOYER") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Applications</h1>
            <p className="text-gray-600">Manage applications from workers to your job postings</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setFilter("all")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "all"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending ({applications.filter(a => a.status === "PENDING").length})
              </button>
              <button
                onClick={() => setFilter("accepted")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "accepted"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Accepted ({applications.filter(a => a.status === "ACCEPTED").length})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                  filter === "rejected"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Rejected ({applications.filter(a => a.status === "REJECTED").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-4">
                {filter === "pending" 
                  ? "No pending applications at the moment."
                  : filter === "accepted"
                  ? "No accepted applications yet."
                  : filter === "rejected"
                  ? "No rejected applications."
                  : "You haven't received any applications yet. Post jobs to attract talented workers!"
                }
              </p>
              <button
                onClick={() => router.push("/jobs/new")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post a New Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
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
                      {application.job.budget && (
                        <div className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">Budget:</span> RWF {application.job.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                  </div>

                  {/* Worker Information */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {application.worker.photoUrl ? (
                          <img
                            src={application.worker.photoUrl}
                            alt={application.worker.name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-200 rounded-full border-2 border-gray-200 flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{application.worker.name}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(application.worker.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 01.69.694l.33 1.108c.43.288.824.588 1.163.886l.215.125c.437.264.785.559 1.466.559.686 0 1.342-.108 1.787-.32l.189-.096c.147-.07.37-.141.632-.255.456-.083.873-.262 1.26-.425l.159-.052c.417-.137.806-.321 1.165-.688.357-.367.676-.774.93-1.207.332-.714.578-1.486.69-2.311.196-1.12.496-2.313.69-3.446.196-.894.496-1.785.69-2.313.69-1.342m0 0a1 1 0 001 1v3a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h1" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-600">
                              {application.worker.rating.toFixed(1)} ({application.worker.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Category:</span> {application.worker.category}
                          </div>
                          <div>
                            <span className="font-medium">Experience:</span> {application.worker.experienceYears}+ years
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span>
                            <a href={`tel:${application.worker.phone}`} className="text-blue-600 hover:text-blue-800">
                              {application.worker.phone}
                            </a>
                          </div>
                          <div>
                            <span className="font-medium">Applied:</span> {formatDate(application.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons based on status */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    {application.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAcceptApplication(application.id)}
                          className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Accept Application
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application.id)}
                          className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Reject Application
                        </button>
                        <button
                          className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View Worker Profile
                        </button>
                      </>
                    )}
                    {application.status === "ACCEPTED" && (
                      <>
                        <button
                          className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Contact Worker
                        </button>
                        <button
                          className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                        >
                          View Worker Profile
                        </button>
                      </>
                    )}
                    {application.status === "REJECTED" && (
                      <button
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Worker Profile
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
