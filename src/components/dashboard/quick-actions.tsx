"use client";

import React from "react";
import Link from "next/link";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: "blue" | "green" | "purple" | "orange";
}

interface QuickActionsProps {
  actions: QuickAction[];
  role: "EMPLOYER" | "WORKER";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    hover: "hover:bg-blue-100",
    border: "border-blue-200"
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    hover: "hover:bg-green-100",
    border: "border-green-200"
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    hover: "hover:bg-purple-100",
    border: "border-purple-200"
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    hover: "hover:bg-orange-100",
    border: "border-orange-200"
  }
};

export default function QuickActions({ actions, role }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const colors = colorClasses[action.color];
        
        return (
          <Link
            key={action.id}
            href={action.href}
            className={`p-5 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
          >
            <div className="flex items-center space-x-4 relative z-10">
              <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} transition-transform group-hover:scale-110`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-medium line-clamp-1">
                  {action.description}
                </p>
              </div>
            </div>
            <div className={`absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
