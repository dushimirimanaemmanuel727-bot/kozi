"use client";

import React from "react";

import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "orange";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: "text-blue-500"
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    icon: "text-green-500"
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    icon: "text-yellow-500"
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    icon: "text-red-500"
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    icon: "text-purple-500"
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: "text-orange-500"
  }
};

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue", 
  loading = false 
}: StatsCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group overflow-hidden relative"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-3">
              <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                change.type === "increase" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                <svg
                  className={`w-3 h-3 mr-1 ${
                    change.type === "increase" ? "text-green-500" : "text-red-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {change.type === "increase" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  )}
                </svg>
                {change.value}%
              </div>
              <span className="text-xs text-gray-400 ml-2 font-medium">this month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${colors.bg}`}>
          <div className={cn("w-7 h-7", colors.icon)}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper to handle Lucide icons or raw SVG
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
