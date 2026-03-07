"use client";

import React from "react";
import Link from "next/link";

interface Worker {
  id: string;
  name: string;
  skills: string[];
  experience: string;
  location: string;
  expectedSalary?: number;
  availability: string;
  profileCompletion?: number;
  photoUrl?: string;
  rating?: number;
  jobApplications?: number;
}

interface AvailableWorkersProps {
  workers: Worker[];
  loading?: boolean;
}

export default function AvailableWorkers({ workers, loading = false }: AvailableWorkersProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500">No available workers at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {workers.map((worker) => (
        <div key={worker.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {worker.photoUrl ? (
                  <img 
                    src={worker.photoUrl} 
                    alt={worker.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {worker.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{worker.name}</h3>
                  {worker.rating && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-600 ml-1">{worker.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {worker.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {worker.skills.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{worker.skills.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                    </svg>
                    {worker.experience}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {worker.location}
                  </span>
                  {worker.expectedSalary && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ${worker.expectedSalary}/mo
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    worker.availability === 'IMMEDIATE' 
                      ? 'bg-green-100 text-green-800'
                      : worker.availability === 'WEEK'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {worker.availability}
                  </span>
                  
                  {worker.profileCompletion && (
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${worker.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{worker.profileCompletion}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 ml-4">
              <Link 
                href={`/workers/${worker.id}`}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-center"
              >
                View Profile
              </Link>
              <Link 
                href={`/messages/new?worker=${worker.id}`}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-center"
              >
                Message
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {workers.length > 0 && (
        <div className="text-center mt-6">
          <Link 
            href="/workers"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All Available Workers
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
