import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkerCard from "@/components/workers/worker-card";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only employers can have favorites
  if (session.user.role !== "EMPLOYER") {
    redirect("/workers");
  }

  const favorites = await prisma.favorite.findMany({
    where: {
      employerId: session.user.id,
    },
    include: {
      worker: {
        include: {
          workerProfile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-600 to-red-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">My Favorites ❤️</h1>
            <p className="text-pink-100 text-lg">
              Workers you've saved for future opportunities
            </p>
          </div>
        </div>

        {/* Favorites Count */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Favorite Workers ({favorites.length})
          </h2>
        </div>

        {/* Favorites List */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite workers yet</h3>
            <p className="text-gray-600 mb-6">
              Start browsing and save workers you're interested in for future reference.
            </p>
            <Link
              href="/workers"
              className="inline-flex bg-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              Browse Workers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const worker = favorite.worker;
              const profile = worker.workerProfile;
              
              if (!profile) return null;

              return (
                <WorkerCard
                  key={`${favorite.employerId}-${favorite.workerId}`}
                  worker={worker}
                  profile={profile}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
