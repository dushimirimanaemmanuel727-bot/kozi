'use client';

import { motion } from 'framer-motion';

import { UserPlus, Search, CheckCircle2, ArrowRight } from 'lucide-react';

const ModernHowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Sign up as a worker or an employer and complete your profile in minutes. Tell us about your skills or hiring needs.',
      icon: <UserPlus className="w-8 h-8" />,
    },
    {
      step: 2,
      title: 'Find Your Match',
      description: 'Browse through our verified job listings or search for qualified professionals that fit your specific requirements.',
      icon: <Search className="w-8 h-8" />,
    },
    {
      step: 3,
      title: 'Connect & Hire',
      description: 'Communicate securely through our platform, agree on terms, and start a successful working relationship.',
      icon: <CheckCircle2 className="w-8 h-8" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
          >
            Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6"
          >
            Get Started in <span className="text-blue-600">3 Easy Steps</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium"
          >
            Whether you're looking for work or looking to hire, our platform makes it simple and efficient.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white border-4 border-slate-50 text-blue-600 font-black rounded-2xl flex items-center justify-center shadow-md">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">{step.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed max-w-xs">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="md:hidden mt-8 text-slate-200">
                    <ArrowRight className="w-8 h-8 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHowItWorks;
