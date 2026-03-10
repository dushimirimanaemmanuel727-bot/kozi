"use client";

import React from "react";
import Link from "next/link";

import { motion } from "framer-motion";

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
      {workers.map((worker, index) => (
        <motion.div 
          key={worker.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group relative"
        >
          <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
            <div className="flex items-start space-x-5 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all duration-300">
                {worker.photoUrl ? (
                  <img 
                    src={worker.photoUrl} 
                    alt={worker.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {worker.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{worker.name}</h3>
                  {worker.rating && (
                    <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full">
                      <svg className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-yellow-700 ml-1">{worker.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {worker.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="inline-block px-3 py-1 text-[11px] font-bold bg-gray-50 text-gray-600 rounded-lg border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                      {skill}
                    </span>
                  ))}
                  {worker.skills.length > 3 && (
                    <span className="inline-block px-3 py-1 text-[11px] font-bold bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
                      +{worker.skills.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-medium text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                    </svg>
                    {worker.experience} Exp
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {worker.location}
                  </span>
                  {worker.expectedSalary && (
                    <span className="flex items-center text-blue-600 font-bold">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {worker.expectedSalary} FRW/mo
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className={`inline-flex items-center px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${
                    worker.availability === 'IMMEDIATE' 
                      ? 'bg-green-50 text-green-700'
                      : worker.availability === 'WEEK'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    {worker.availability}
                  </span>
                  
                  {worker.profileCompletion && (
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${worker.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-400">{worker.profileCompletion}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex sm:flex-col gap-3 ml-0 sm:ml-4 w-full sm:w-auto mt-4 sm:mt-0">
              <Link 
                href={`/workers/${worker.id}`}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 transition-all duration-300 text-center"
              >
                View Profile
              </Link>
              <Link 
                href={`/messages/new?worker=${worker.id}`}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold border border-gray-100 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 text-center"
              >
                Message
              </Link>
            </div>
          </div>
        </motion.div>
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
