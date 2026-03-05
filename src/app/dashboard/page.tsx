import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Check if worker has completed profile
  if (session.user.role === "WORKER") {
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        nationalId: true,
        passportNumber: true,
        photoUrl: true,
        passportUrl: true,
      }
    });

    const isProfileCompleted = !!(
      workerProfile?.nationalId &&
      workerProfile?.passportNumber &&
      workerProfile?.photoUrl &&
      workerProfile?.passportUrl
    );

    if (!isProfileCompleted) {
      redirect("/profile/worker/complete");
    }
  }

  // Get user profile based on role
  let userProfile = null;
  if (session.user.role === "WORKER") {
    userProfile = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true, phone: true, district: true, languages: true }
        }
      }
    });
  } else if (session.user.role === "EMPLOYER") {
    userProfile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true, phone: true, district: true }
        }
      }
    });
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session.user.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {session.user.role === "WORKER" 
                ? "Here's an overview of your profile and activity"
                : "Manage your job postings and find talented workers"
              }
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {session.user.role === "WORKER" ? (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{session.user.role === "WORKER" ? (userProfile as any)?.rating?.toFixed(1) || "0.0" : "N/A"}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Average Rating</h3>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor((userProfile as any)?.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.69.694l.33 1.108c.43.288.824.588 1.163.886l.215.125c.437.264.785.559 1.466.559.686 0 1.342-.108 1.787-.32l.189-.096c.147-.07.37-.141.632-.255.456-.083.873-.262 1.26-.425l.159-.052c.417-.137.806-.321 1.165-.688.357-.367.676-.774.93-1.207.332-.714.578-1.486.69-2.311.196-1.12.496-2.313.69-3.446.196-.894.496-1.785.69-2.313.69-1.342m0 0a1 1 0 001 1v3a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h1" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{session.user.role === "WORKER" ? (userProfile as any)?.reviewCount || 0 : "N/A"}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Total Reviews</h3>
                <p className="text-gray-500 text-xs mt-1">From employers</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{session.user.role === "WORKER" ? (userProfile as any)?.experienceYears || 0 : "N/A"}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Years Experience</h3>
                <p className="text-gray-500 text-xs mt-1">In your field</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{session.user.role === "WORKER" ? (userProfile as any)?.availability || "N/A" : "N/A"}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Availability</h3>
                <p className="text-gray-500 text-xs mt-1">Current status</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{session.user.role === "EMPLOYER" ? (userProfile as any)?.organization || "Not Set" : "Not Set"}</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Organization</h3>
                <p className="text-gray-500 text-xs mt-1">Company name</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Active Jobs</h3>
                <p className="text-gray-500 text-xs mt-1">Posted jobs</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Applications</h3>
                <p className="text-gray-500 text-xs mt-1">Pending review</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">0</span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">Workers Hired</h3>
                <p className="text-gray-500 text-xs mt-1">Total hires</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {session.user.role === "WORKER" ? (
              <>
                <Link href="/profile/worker/edit" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                      <p className="text-sm text-gray-600">Update your info</p>
                    </div>
                  </div>
                </Link>

                <Link href="/jobs" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Browse Jobs</h3>
                      <p className="text-sm text-gray-600">Find opportunities</p>
                    </div>
                  </div>
                </Link>

                <Link href="/jobs/applied" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Applied Jobs</h3>
                      <p className="text-sm text-gray-600">Track applications</p>
                    </div>
                  </div>
                </Link>

                <Link href="/reviews" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.69.694l.33 1.108c.43.288.824.588 1.163.886l.215.125c.437.264.785.559 1.466.559.686 0 1.342-.108 1.787-.32l.189-.096c.147-.07.37-.141.632-.255.456-.083.873-.262 1.26-.425l.159-.052c.417-.137.806-.321 1.165-.688.357-.367.676-.774.93-1.207.332-.714.578-1.486.69-2.311.196-1.12.496-2.313.69-3.446.196-.894.496-1.785.69-2.313.69-1.342m0 0a1 1 0 001 1v3a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 001 1h1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Reviews</h3>
                      <p className="text-sm text-gray-600">View feedback</p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/jobs/new" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Post Job</h3>
                      <p className="text-sm text-gray-600">Create new posting</p>
                    </div>
                  </div>
                </Link>

                <Link href="/workers" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Browse Workers</h3>
                      <p className="text-sm text-gray-600">Find talent</p>
                    </div>
                  </div>
                </Link>

                <Link href="/applications" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Applications</h3>
                      <p className="text-sm text-gray-600">Review candidates</p>
                    </div>
                  </div>
                </Link>

                <Link href="/profile/employer/view" className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">My Profile</h3>
                      <p className="text-sm text-gray-600">View details</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {session.user.role === "WORKER" && (!(userProfile as any)?.skills || !(userProfile as any)?.bio) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                <p className="text-gray-600 mb-4">
                  Add your skills and bio to increase your chances of getting hired by employers.
                </p>
                <Link
                  href="/profile/worker/edit"
                  className="inline-flex bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
