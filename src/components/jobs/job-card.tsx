"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget?: number | null;
  district?: string | null;
  createdAt: Date | string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { data: session } = useSession();
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = async () => {
    if (!session) {
      // Redirect to sign in
      window.location.href = "/auth/signin";
      return;
    }

    if (session.user?.role !== "WORKER") {
      alert("Only workers can apply for jobs");
      return;
    }

    setIsApplying(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Application submitted successfully!");
      } else {
        alert(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsSaved(!isSaved);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:scale-105 group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {job.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
          {job.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {job.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.budget ? `${job.budget.toLocaleString()} RWF/month` : "Negotiable"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.district || "Location not specified"}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Action */}
        <div className="flex space-x-2">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isApplying
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isSaved
                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                : "border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
