"use client";

import { useState, useEffect, useRef } from "react";

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
        setActiveStep((prev) => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const workerSteps = [
    {
      number: "1",
      title: "Create Your Profile",
      description: "Sign up and build your professional profile with skills, experience, and photos",
      icon: "👤"
    },
    {
      number: "2",
      title: "Browse Jobs",
      description: "Explore available job opportunities that match your skills and preferences",
      icon: "🔍"
    },
    {
      number: "3",
      title: "Apply Instantly",
      description: "Apply to jobs with a single click and track your application status",
      icon: "📤"
    },
    {
      number: "4",
      title: "Get Hired",
      description: "Connect with employers, attend interviews, and start your new job",
      icon: "🎉"
    }
  ];

  const employerSteps = [
    {
      number: "1",
      title: "Post Your Job",
      description: "Create detailed job postings with requirements, salary, and location",
      icon: "📝"
    },
    {
      number: "2",
      title: "Review Applications",
      description: "Receive and review applications from qualified workers",
      icon: "📋"
    },
    {
      number: "3",
      title: "Interview Candidates",
      description: "Schedule and conduct interviews with shortlisted candidates",
      icon: "💼"
    },
    {
      number: "4",
      title: "Hire the Best",
      description: "Select the perfect candidate and manage your hiring process",
      icon: "⭐"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
            🚀 How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple Steps to Success
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting started with KaziHome is easy. Follow these simple steps to find your dream job or hire the perfect worker.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex justify-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gray-100 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setActiveStep(0)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeStep < 4 ? 'bg-white text-blue-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Workers
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeStep >= 4 ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              For Employers
            </button>
          </div>
        </div>

        {/* Steps Display */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Steps List */}
          <div className="space-y-6">
            {(activeStep < 4 ? workerSteps : employerSteps).map((step, index) => {
              const actualIndex = activeStep < 4 ? index : index + 4;
              const isActive = actualIndex === activeStep;
              
              return (
                <div
                  key={index}
                  onClick={() => setActiveStep(actualIndex)}
                  className={`flex items-start space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    isActive ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isActive ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Visual Display */}
          <div className={`relative transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {(activeStep < 4 ? workerSteps : employerSteps)[activeStep % 4].icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {(activeStep < 4 ? workerSteps : employerSteps)[activeStep % 4].title}
              </h3>
              <p className="text-gray-600">
                {(activeStep < 4 ? workerSteps : employerSteps)[activeStep % 4].description}
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center mt-8 space-x-2">
                {(activeStep < 4 ? workerSteps : employerSteps).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === (activeStep % 4) ? 'w-8 bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Start Your Journey Today
            </h3>
            <p className="text-white/90 mb-6">
              Join KaziHome and take the first step towards your dream job or finding the perfect worker.
            </p>
            <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
