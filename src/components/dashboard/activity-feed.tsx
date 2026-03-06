"use client";

import React from "react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  type: "application" | "job_posted" | "hired" | "review";
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
  actionUrl?: string;
  actionText?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  loading?: boolean;
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "application":
      return (
        <div className="p-2 bg-blue-100 rounded-full">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
    case "job_posted":
      return (
        <div className="p-2 bg-green-100 rounded-full">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    case "hired":
      return (
        <div className="p-2 bg-purple-100 rounded-full">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "review":
      return (
        <div className="p-2 bg-yellow-100 rounded-full">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.69.69l4.338.632c.925.134 1.294 1.27.624 1.921l-3.138 3.058a1 1 0 00-.286.894l.739 4.322c.165.962-.868 1.696-1.757 1.242l-3.881-2.041a1 1 0 00-.928 0l-3.881 2.041c-.889.454-1.922-.28-1.757-1.242l.739-4.322a1 1 0 00-.286-.894l-3.138-3.058c-.67-.651-.301-1.787.624-1.921l4.338-.632a1 1 0 00.69-.69l1.519-4.674z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="p-2 bg-gray-100 rounded-full">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

const getStatusBadge = (status: string) => {
  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    OPEN: "bg-blue-100 text-blue-800",
    CLOSED: "bg-gray-100 text-gray-800"
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

const formatTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(timestamp).getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};

export default function ActivityFeed({ 
  activities, 
  maxItems = 5, 
  loading = false 
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(maxItems)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          {getActivityIcon(activity.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  {activity.status && getStatusBadge(activity.status)}
                </div>
              </div>
            </div>
            {activity.actionUrl && activity.actionText && (
              <div className="mt-2">
                <Link
                  href={activity.actionUrl}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {activity.actionText} →
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
