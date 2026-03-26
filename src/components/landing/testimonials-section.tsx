"use client";

import { useState, useEffect, useRef } from "react";

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const testimonials = [
    {
      name: "Marie Mukamana",
      role: "Domestic Worker",
      location: "Kigali, Rwanda",
      content: "KaziHome helped me find my dream job as a domestic worker. The platform is easy to use and I found a great family to work with within just 2 weeks!",
      rating: 5,
      avatar: "👩‍🦰"
    },
    {
      name: "Jean-Pierre Niyonzima",
      role: "Domestic Worker", 
      location: "Kigali, Rwanda",
      content: "As a busy professional, I needed reliable help at home. KaziHome connected me with amazing workers who are skilled and trustworthy. Highly recommended!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Sarah Mukamana",
      role: "Construction Worker",
      location: "Kigali, Rwanda",
      content: "I've been using KaziHome for 6 months now and have found consistent work. The platform gives me the flexibility to choose jobs that fit my schedule.",
      rating: 5,
      avatar: "👷‍♀️"
    },
    {
      name: "Michel Habimana",
      role: "Small Business Owner",
      location: "Kigali, Rwanda",
      content: "Finding skilled workers for my small business was always challenging until I discovered KaziHome. Now I can easily find qualified candidates.",
      rating: 5,
      avatar: "🏪"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            💬 Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied users who have found success through KaziHome
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Featured Testimonial */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="bg-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-5"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-5xl">{testimonials[currentTestimonial].avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </h3>
                    <p className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </p>
                    <p className="text-sm text-gray-500">
                      📍 {testimonials[currentTestimonial].location}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.694.694l3.292 1.07c.921.3.921 1.603 0 1.902l-3.292 1.07a1 1 0 00-.694.694l-1.07 3.292c-.3.921-1.603.921-1.902 0l-1.07-3.292a1 1 0 00-.694-.694l-3.292-1.07c-.921-.3-.921-1.603 0-1.902l3.292-1.07a1 1 0 00.694-.694l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-lg text-gray-700 leading-relaxed italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6">Platform Statistics</h3>
              
              <div className="space-y-6">
                {[
                  { number: "10,000+", label: "Active Users" },
                  { number: "5,000+", label: "Jobs Posted" },
                  { number: "8,000+", label: "Successful Matches" },
                  { number: "98%", label: "Satisfaction Rate" }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white/90">{stat.label}</span>
                    <span className="text-2xl font-bold">{stat.number}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-white/80">
                  Join our growing community of professionals and employers across Rwanda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                currentTestimonial === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.694.694l3.292 1.07c.921.3.921 1.603 0 1.902l-3.292 1.07a1 1 0 00-.694.694l-1.07 3.292c-.3.921-1.603.921-1.902 0l-1.07-3.292a1 1 0 00-.694-.694l-3.292-1.07c-.921-.3-.921-1.603 0-1.902l3.292-1.07a1 1 0 00.694-.694l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Share Your Success Story?
          </h3>
          <p className="text-gray-600 mb-8">
            Join KaziHome today and start your journey to success
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
