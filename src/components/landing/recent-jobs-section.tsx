"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget?: number;
  district?: string;
  createdAt: string;
  deadline?: string;
  employerName: string;
  organizationName?: string;
}

export default function RecentJobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      console.log("Fetching recent jobs...");
      const response = await fetch("/api/jobs/recent?limit=6");
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Received data:", data);
        setJobs(data.jobs || []);
        console.log("Jobs set:", data.jobs || []);
      } else {
        console.error("API response not ok:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch recent jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 1 ? "Just posted" : `${minutes}h ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return days === 1 ? "Yesterday" : `${days}d ago`;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Housekeeping": "bg-blue-100 text-blue-800",
      "Cleaning": "bg-cyan-100 text-cyan-800",
      "Cooking": "bg-orange-100 text-orange-800",
      "Childcare": "bg-pink-100 text-pink-800",
      "Elderly Care": "bg-purple-100 text-purple-800",
      "Laundry": "bg-green-100 text-green-800",
      "Gardening": "bg-emerald-100 text-emerald-800",
      "Driving": "bg-indigo-100 text-indigo-800",
      "Security": "bg-red-100 text-red-800",
      "Pet Care": "bg-yellow-100 text-yellow-800",
      "Grocery Shopping": "bg-teal-100 text-teal-800",
      "Ironing": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Household Jobs</h2>
            <p className="text-lg text-gray-600">Find cleaning, cooking, childcare, and other domestic work opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Household Jobs</h2>
            <p className="text-lg text-gray-600">Find cleaning, cooking, childcare, and other domestic work opportunities</p>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs available yet</h3>
            <p className="text-gray-600 mb-6">Check back soon for new job opportunities</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Sign up to get notified
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-blue-600 text-sm font-semibold">🏠 Household Opportunities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Household Jobs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover rewarding domestic work opportunities from trusted families across Rwanda. 
            From childcare to cooking, find the perfect match for your skills.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {jobs.map((job, index) => (
            <div 
              key={job.id} 
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Card Header */}
              <div className="relative h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              
              <div className="p-6">
                {/* Category and Time */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getCategoryColor(job.category)} shadow-sm`}>
                    {job.category}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(job.createdAt)}
                  </div>
                </div>
                
                {/* Job Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
                
                {/* Employer */}
                <div className="flex items-center text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  {job.employerName}
                </div>
                
                {/* Footer */}
                <div className="space-y-3">
                  {job.budget && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.budget.toLocaleString()} FRW
                      <span className="text-xs text-gray-500 font-normal ml-2">/month</span>
                    </div>
                  )}
                  
                  {job.district && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.district}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hover Action */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/95 to-purple-600/95 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-bold mb-2">Ready to Apply?</h4>
                  <p className="text-sm mb-4 opacity-90">Join thousands finding household work</p>
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Sign Up Now
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl text-white max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Find Your Next Job?</h3>
              <p className="text-blue-100 mb-6">Join our community of household workers and connect with families across Rwanda</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105"
                >
                  Create Account
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-8 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-400 transition-all transform hover:scale-105"
                >
                  Browse All Jobs
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
