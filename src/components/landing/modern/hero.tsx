'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

const MotionLink = motion(Link);

const ModernHero = () => {
  const { translate } = useLanguage();
  return (
    <section className="w-full py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-6 px-2">
            {translate("hero_title")}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 mb-8 px-4">
            {translate("hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center sm:items-stretch px-4">
            <MotionLink
              href="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-gray-900 text-white font-medium rounded-md shadow-sm hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {translate("browse_workers")}
            </MotionLink>
            <MotionLink
              href="/auth/signup?role=employer"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-gray-100 text-gray-900 font-medium rounded-md shadow-sm hover:bg-gray-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {translate("post_job")}
            </MotionLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernHero;
