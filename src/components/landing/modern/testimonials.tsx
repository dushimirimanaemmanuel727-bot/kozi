'use client';

import { motion } from 'framer-motion';

import { Star, Quote } from 'lucide-react';

const ModernTestimonials = () => {
  const testimonials = [
    {
      quote: "KaziHome transformed my job search. I found a respectful employer and a stable income within a week. The verification process gives both sides peace of mind.",
      name: 'Aline Uwamahoro',
      role: 'Professional Nanny',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop',
      rating: 5,
    },
    {
      quote: "Hiring reliable domestic staff used to be a nightmare of referrals and uncertainty. With KaziHome, it’s simple, safe, and I found a great cook in days.",
      name: 'David Mugisha',
      role: 'Homeowner, Kigali',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5,
    },
    {
      quote: "As a gardener, I struggled to find consistent work. Now I have several regular clients all through KaziHome. The platform is very easy to use on my phone.",
      name: 'Jean-Paul Nkurunziza',
      role: 'Professional Gardener',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      rating: 4,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6"
          >
            Trusted by <span className="text-blue-600">Thousands</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 font-medium"
          >
            See what our community members have to say about their experience with KaziHome.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative"
            >
              <Quote className="absolute top-6 right-8 w-10 h-10 text-slate-50" />
              
              <div className="flex space-x-1 mb-6 relative z-10">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              
              <p className="text-slate-700 font-medium leading-relaxed mb-8 relative z-10">
                "{testimonial.quote}"
              </p>
              
              <div className="mt-auto flex items-center space-x-4 border-t border-slate-50 pt-6">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100">
                  <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{testimonial.name}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernTestimonials;
