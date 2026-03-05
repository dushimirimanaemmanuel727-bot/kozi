"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function ViewEmployerProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.role !== "EMPLOYER") {
      router.push("/dashboard");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile/employer/current");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, router]);

  if (!session || session.user.role !== "EMPLOYER") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">View your complete profile information</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading profile...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-medium text-gray-900">{session.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">{session.user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Role</p>
                    <p className="font-medium text-gray-900">{session.user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">District</p>
                    <p className="font-medium text-gray-900">{profile.user?.district || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organization</p>
                    <p className="font-medium text-gray-900">
                      {profile.organization || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Industry</p>
                    <p className="font-medium text-gray-900">
                      {profile.industry || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Company Size</p>
                    <p className="font-medium text-gray-900">
                      {profile.companySize || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Website</p>
                    <p className="font-medium text-gray-900">
                      {profile.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {profile.description && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <p className="font-medium text-gray-900">{profile.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {profile.jobCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Jobs Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {profile.applicationCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Applications Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {profile.hiredCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Workers Hired</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {profile.recentJobs && profile.recentJobs.length > 0 ? (
                    profile.recentJobs.map((job: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No recent activity to display
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/jobs/new")}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Post New Job
                </button>
                <button
                  onClick={() => router.push("/jobs/my-jobs")}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  View My Jobs
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600">Unable to load your profile information.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
