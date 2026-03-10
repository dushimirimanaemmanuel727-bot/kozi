'use client';

import { motion } from 'framer-motion';
import ModernHero from './hero';
import ModernFeatures from './features';
import RecentJobs from './recent-jobs';
import ModernHowItWorks from './how-it-works';
import ModernTestimonials from './testimonials';
import ModernContact from './contact';
import ModernCTA from './cta';
import ModernFooter from './footer';
import NavigationBar from '../navigation-bar';

const ModernLandingPage = () => {
  return (
    <div className="bg-white">
      <NavigationBar />
      <main>
        <ModernHero />
        <ModernFeatures />
        <RecentJobs />
        <ModernHowItWorks />
        <ModernTestimonials />
        <ModernContact />
        <ModernCTA />
      </main>
      <ModernFooter />
    </div>
  );
};

export default ModernLandingPage;
