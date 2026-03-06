"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useNotification } from "@/contexts/notification-context";
import { getTimeRemaining, getDeadlineColor, isExpired } from "@/utils/time-remaining";

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget?: number | null;
  district?: string | null;
  deadline?: Date | string | null;
  createdAt: Date | string;
}

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const { data: session } = useSession();
  const [isApplying, setIsApplying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const notification = useNotification();

  const showNotification = (message: string, type: "success" | "error") => {
    if (notification) {
      notification.addNotification(message, type);
    }
  };

  useEffect(() => {
    const fetchApplicationCount = async () => {
      try {
        const response = await fetch(`/api/jobs/${job.id}/applications-count`);
        if (response.ok) {
          const data = await response.json();
          setApplicationCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch application count:", error);
      }
    };

    fetchApplicationCount();
  }, [job.id]);

  const handleApply = async () => {
    console.log("Apply button clicked for job:", job.id);
    console.log("Session:", session);
    
    if (!session) {
      console.log("No session, redirecting to sign in");
      // Redirect to sign in
      window.location.href = "/auth/signin";
      return;
    }

    if (session.user?.role !== "WORKER") {
      console.log("User is not a worker:", session.user.role);
      showNotification("Only workers can apply for jobs", "error");
      return;
    }

    console.log("Starting application process...");
    setIsApplying(true);

    try {
      console.log("Making API call to /api/applications");
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);

      if (response.ok) {
        console.log("Application successful");
        showNotification("Application submitted successfully!", "success");
        // Refresh application count
        const countResponse = await fetch(`/api/jobs/${job.id}/applications-count`);
        if (countResponse.ok) {
          const countData = await countResponse.json();
          setApplicationCount(countData.count);
        }
      } else {
        console.log("Application failed:", data.error);
        showNotification(data.error || "Failed to submit application", "error");
      }
    } catch (err) {
      console.error("Application error:", err);
      showNotification("Failed to submit application", "error");
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
            {job.budget ? `${job.budget.toLocaleString()} FRW/month` : "Negotiable"}
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
          {job.deadline && (
            <div className={`flex items-center text-sm ${getDeadlineColor(job.deadline)}`}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {getTimeRemaining(job.deadline)}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {applicationCount} {applicationCount === 1 ? 'application' : 'applications'}
          </div>
        </div>

        {/* Action */}
        <div className="flex space-x-2">
          <button
            onClick={handleApply}
            disabled={isApplying || isExpired(job.deadline || null)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isApplying
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : isExpired(job.deadline || null)
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isApplying ? "Applying..." : isExpired(job.deadline || null) ? "Expired" : "Apply Now"}
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
