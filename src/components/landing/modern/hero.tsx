'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/contexts/language-context';

const MotionLink = motion(Link);

const ModernHero = () => {
  const { translate } = useLanguage();
  return (
    <section className="relative w-full py-32 md:py-48 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 px-2 drop-shadow-2xl">
            {translate("hero_title")}
          </h1>
          <p className="max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-100 mb-10 px-4 drop-shadow-lg font-medium opacity-90">
            {translate("hero_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-stretch px-4 mt-8">
            <MotionLink
              href="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-10 bg-white text-gray-900 font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-all duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              {translate("browse_workers")}
            </MotionLink>
            <MotionLink
              href="/auth/signup?role=employer"
              className="w-full sm:w-auto inline-flex items-center justify-center h-14 px-10 bg-transparent border-2 border-white text-white font-bold rounded-lg shadow-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
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
