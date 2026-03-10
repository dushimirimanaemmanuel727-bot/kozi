'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Job {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: number | null;
  district: string;
  createdAt: string;
  employerName: string;
}

const RecentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response = await fetch('/api/jobs/recent?limit=3', {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return null; // Don't show the section if no jobs are available
  }

  return (
    <section id="recent-jobs" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
          >
            Latest Opportunities
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6"
          >
            Recently Posted <span className="text-blue-600">Jobs</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium"
          >
            Explore the latest household and domestic opportunities across Rwanda.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                  {job.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {job.title}
              </h3>
              
              <p className="text-slate-600 font-medium leading-relaxed mb-6 line-clamp-2">
                {job.description}
              </p>
              
              <div className="mt-auto space-y-4">
                <div className="flex items-center text-slate-500 font-bold text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                  {job.district || 'Kigali'}
                </div>
                
                <div className="flex items-center text-slate-500 font-bold text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employer</p>
                    <p className="text-sm font-bold text-slate-900">{job.employerName}</p>
                  </div>
                  <Link 
                    href="/auth/signin" 
                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link 
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 group"
          >
            <span>View All Jobs</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentJobs;
