'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/language-context';

import { Shield, Zap, Search, Users, CheckCircle, Smartphone } from 'lucide-react';

const ModernFeatures = () => {
  const { translate } = useLanguage();
  
  const features = [
    {
      title: translate('verified_professionals'),
      description: translate('verified_professionals_desc'),
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: translate('instant_job_matching'),
      description: translate('instant_job_matching_desc'),
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      color: 'bg-yellow-50',
    },
    {
      title: translate('easy_search_filters'),
      description: translate('easy_search_filters_desc'),
      icon: <Search className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: translate('trusted_community'),
      description: translate('trusted_community_desc'),
      icon: <Users className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: translate('quality_guarantee'),
      description: translate('quality_guarantee_desc'),
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      title: translate('mobile_friendly'),
      description: translate('mobile_friendly_desc'),
      icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50',
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full -ml-48 -mb-48 blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
          >
            {translate('features')}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6"
          >
            {translate('why_choose_kazihome')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium"
          >
            {translate('features_subtitle')}
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-300" 
              variants={itemVariants}
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ModernFeatures;
