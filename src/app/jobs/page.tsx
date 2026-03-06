import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import JobCard from "@/components/jobs/job-card";

type SearchParams = {
  category?: string;
  district?: string;
  minBudget?: string;
  maxBudget?: string;
  q?: string;
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const where: Prisma.JobWhereInput = {};
  
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.district) where.district = searchParams.district;
  if (searchParams.minBudget || searchParams.maxBudget) {
    where.budget = {};
    if (searchParams.minBudget) where.budget.gte = Number(searchParams.minBudget);
    if (searchParams.maxBudget) where.budget.lte = Number(searchParams.maxBudget);
  }
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold mb-2">Browse Jobs 🎯</h1>
            <p className="text-green-100 text-lg">
              Find the perfect opportunity that matches your skills and availability
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Search & Filter</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                name="q"
                placeholder="Search jobs..."
                defaultValue={searchParams.q ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" defaultValue={searchParams.category ?? ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Categories</option>
                <option value="NANNY">Nanny</option>
                <option value="COOK">Cook</option>
                <option value="CLEANER">Cleaner</option>
                <option value="GARDENER">Gardener</option>
                <option value="SECURITY">Security</option>
                <option value="DRIVER">Driver</option>
                <option value="LAUNDRY">Laundry</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <select name="district" defaultValue={searchParams.district ?? ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">All Districts</option>
                <option value="GASABO">Gasabo</option>
                <option value="KICUKIRO">Kicukiro</option>
                <option value="NYARUGENGE">Nyarugenge</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
              <input
                type="number"
                name="minBudget"
                placeholder="Min FRW"
                defaultValue={searchParams.minBudget ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
              <input
                type="number"
                name="maxBudget"
                placeholder="Max FRW"
                defaultValue={searchParams.maxBudget ?? ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                Search
              </button>
              <Link href="/jobs" className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center">
                Reset
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Available Jobs ({jobs.length})
          </h2>
          <div className="text-sm text-gray-600">
            Showing latest opportunities
          </div>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
            <Link href="/jobs" className="inline-flex bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Clear Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
