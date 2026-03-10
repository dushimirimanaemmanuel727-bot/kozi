"use client";

import React from "react";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export default function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  actions, 
  loading = false 
}: ChartContainerProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
          {subtitle && (
            <p className="text-sm font-medium text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
      
      <div className="p-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-50 rounded-full w-3/4"></div>
            <div className="h-64 bg-gray-50 rounded-2xl"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
