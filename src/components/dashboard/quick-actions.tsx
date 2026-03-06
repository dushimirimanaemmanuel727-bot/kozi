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
            className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-200 group`}
          >
            <div className="flex items-center space-x-3">
              <div className={colors.text}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
