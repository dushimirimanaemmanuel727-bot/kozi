"use client";

import React from "react";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  height?: number;
  showLabels?: boolean;
  maxValue?: number;
}

export default function SimpleBarChart({ 
  data, 
  height = 200, 
  showLabels = true,
  maxValue 
}: SimpleBarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className="flex items-end space-x-2"
        style={{ height: `${height}px` }}
      >
        {data.map((point, index) => {
          const barHeight = max > 0 ? (point.value / max) * height : 0;
          const defaultColor = "bg-blue-500";
          const barColor = point.color || defaultColor;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex flex-col items-center">
                {showLabels && point.value > 0 && (
                  <span className="text-xs font-medium text-gray-700 mb-1">
                    {point.value}
                  </span>
                )}
                <div
                  className={`w-full ${barColor} rounded-t-sm transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${barHeight}px` }}
                />
              </div>
              {showLabels && (
                <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                  {point.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
