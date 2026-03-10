"use client";

import { useState, useEffect } from "react";
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
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Browse Workers</h1>
        <form onSubmit={handleSearch} className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
            <select name="category" defaultValue={searchParams.category ?? ""} className="rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option value="">All Categories</option>
              {["NANNY","COOK","CLEANER","GARDENER","SECURITY","DRIVER","LAUNDRY"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">District</label>
            <select name="district" defaultValue={searchParams.district ?? ""} className="rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option value="">All Districts</option>
              {["GASABO","KICUKIRO","NYARUGENGE"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Availability</label>
            <select name="availability" defaultValue={searchParams.availability ?? ""} className="rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option value="">Availability</option>
              {["FULL_TIME","PART_TIME","DAILY"].map((a) => (
                <option key={a} value={a}>{a.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Experience</label>
            <input 
              type="number" 
              name="minExp" 
              placeholder="Min Years"
              defaultValue={searchParams.minExp ?? ""} 
              className="rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Live In?</label>
            <select name="liveIn" defaultValue={searchParams.liveIn ?? ""} className="rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option value="">Either</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="flex flex-col justify-end space-y-2">
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
              Filter
            </button>
            <button type="button" onClick={handleReset} className="w-full text-gray-500 font-semibold py-1 px-4 hover:text-gray-700 transition-all text-xs">
              Reset Filters
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <Link key={worker.id} href={`/workers/${worker.id}`} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1">
                  <div className="p-6 flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all duration-300">
                        {worker.photoUrl ? (
                          <img 
                            src={worker.photoUrl} 
                            alt={worker.user?.name} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">
                              {worker.user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{worker.user?.name}</h3>
                        </div>
                        <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-wider">
                          <span className="bg-blue-50 px-2 py-0.5 rounded-md">{worker.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="truncate">{worker.user?.district}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{worker.experienceYears}y exp</span>
                      </div>
                    </div>

                    {worker.skills && (
                      <div className="flex flex-wrap gap-2">
                        {worker.skills.split(",").slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-md border border-gray-100">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700 ml-1">{worker.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400 ml-1">({worker.reviewCount})</span>
                    </div>
                    <span className="text-blue-600 text-sm font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
                      View Profile
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
