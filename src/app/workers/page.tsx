"use client";

import { useState, useEffect } from "react";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";

type WorkerProfile = {
  id: string;
  category: string;
  availability: string;
  liveIn: boolean;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  skills?: string;
  bio?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    district?: string;
    languages?: string;
  };
};

type SearchParams = {
  category?: string;
  district?: string;
  availability?: string;
  minExp?: string;
  liveIn?: string;
  q?: string;
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(`/api/workers?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setWorkers(data);
        }
      } catch (error) {
        console.error("Failed to fetch workers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams: SearchParams = {};
    
    formData.forEach((value, key) => {
      if (key === "liveIn") {
        newParams[key] = value === "true" ? "true" : undefined;
      } else if (value) {
        newParams[key as keyof SearchParams] = value as string;
      }
    });
    
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-6">
        <h1 className="mb-4 text-2xl font-semibold">Browse Workers</h1>
        <form onSubmit={handleSearch} className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-6">
          <select name="category" defaultValue={searchParams.category ?? ""} className="rounded border p-2">
            <option value="">Category</option>
            {["NANNY","COOK","CLEANER","GARDENER","SECURITY","DRIVER","LAUNDRY"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select name="district" defaultValue={searchParams.district ?? ""} className="rounded border p-2">
            <option value="">District</option>
            {["GASABO","KICUKIRO","NYARUGENGE"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select name="availability" defaultValue={searchParams.availability ?? ""} className="rounded border p-2">
            <option value="">Availability</option>
            {["FULL_TIME","PART_TIME","LIVE_IN","LIVE_OUT","WEEKENDS"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            name="minExp"
            placeholder="Min years"
            defaultValue={searchParams.minExp ?? ""}
            className="rounded border p-2"
          />
          <label className="flex items-center gap-2 rounded border p-2">
            <input type="checkbox" name="liveIn" value="true" defaultChecked={searchParams.liveIn === "true"} />
            Live-in
          </label>
          <input name="q" placeholder="Search skills" defaultValue={searchParams.q ?? ""} className="rounded border p-2" />
          <button type="submit" className="col-span-2 rounded bg-black p-2 text-white sm:col-span-1">Apply</button>
          <button type="button" onClick={handleReset} className="col-span-2 rounded border p-2 text-center sm:col-span-1">
            Reset
          </button>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading workers...</div>
          </div>
        ) : workers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No workers found matching your criteria.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers
              .filter((w) => w.user)
              .map((w) => (
              <div key={w.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {w.photoUrl ? (
                        <img
                          src={w.photoUrl}
                          alt={w.user!.name}
                          className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{w.user!.name}</h3>
                      <div className="flex items-center text-blue-100 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{w.rating.toFixed(1)} ({w.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-5">
                  {/* Category and Experience */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {w.category}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      {w.experienceYears}+ years
                    </span>
                  </div>

                  {/* Location and Availability */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {w.user!.district || "Kigali"}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {w.availability.replace('_', ' ')}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {w.user!.phone}
                    </div>
                  </div>

                  {/* Skills */}
                  {w.skills && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {w.skills.split(',').slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {skill.trim()}
                          </span>
                        ))}
                        {w.skills.split(',').length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                            +{w.skills.split(',').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bio Preview */}
                  {w.bio && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{w.bio}</p>
                    </div>
                  )}

                  {/* Languages */}
                  {w.user!.languages && (
                    <div className="mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {w.user!.languages}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${w.user!.phone}`}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-center text-sm"
                    >
                      Call Now
                    </a>
                    <Link
                      href={`/workers/${w.id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
