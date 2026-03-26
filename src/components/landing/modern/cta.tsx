'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionLink = motion(Link);

const ModernCTA = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          viewport={{ once: true }}
          className="px-4"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="max-w-xl mx-auto text-base sm:text-lg text-gray-600 mb-8">
            Join the KaziHome community today. Whether you're looking for work or hiring, your search ends here.
          </p>
          <MotionLink
            href="/auth/signup"
            className="w-full sm:w-auto inline-block px-10 py-4 bg-gray-900 text-white font-medium rounded-md shadow-lg hover:bg-gray-800 transition-transform transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up Now
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernCTA;
