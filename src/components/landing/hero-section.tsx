"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import SignInPopup from "@/components/auth/signin-popup";
import SignUpPopup from "@/components/auth/signup-popup";

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const slides = [
    {
      title: "Find Household Work",
      subtitle: "Connect with families needing your help",
      description: "Discover cleaning, cooking, childcare, and other domestic jobs in your area",
      image: "🏠"
    },
    {
      title: "Hire Trusted Helpers",
      subtitle: "Find reliable household workers",
      description: "Access verified professionals for cleaning, cooking, childcare, and home care",
      image: "👨‍👩‍👧‍👦"
    },
    {
      title: "Build Your Career",
      subtitle: "Grow as a household professional",
      description: "Get reviews, build trust, and find steady work with families in your community",
      image: "⭐"
    }
  ];

  useEffect(() => {
    setIsClient(true);
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate deterministic positions based on index to avoid hydration mismatches
  const generatePosition = (index: number) => {
    const positions = [
      { left: 10, top: 15, delay: 0.1, duration: 3.5 },
      { left: 25, top: 8, delay: 0.5, duration: 4.2 },
      { left: 40, top: 20, delay: 1.0, duration: 3.8 },
      { left: 55, top: 12, delay: 1.5, duration: 4.5 },
      { left: 70, top: 25, delay: 2.0, duration: 3.9 },
      { left: 85, top: 18, delay: 2.5, duration: 4.1 },
      { left: 15, top: 35, delay: 0.2, duration: 3.7 },
      { left: 30, top: 42, delay: 0.7, duration: 4.3 },
      { left: 45, top: 38, delay: 1.2, duration: 3.6 },
      { left: 60, top: 45, delay: 1.7, duration: 4.4 },
      { left: 75, top: 40, delay: 2.2, duration: 3.8 },
      { left: 90, top: 35, delay: 2.7, duration: 4.0 },
      { left: 8, top: 55, delay: 0.3, duration: 3.9 },
      { left: 22, top: 62, delay: 0.8, duration: 4.6 },
      { left: 36, top: 58, delay: 1.3, duration: 3.7 },
      { left: 50, top: 65, delay: 1.8, duration: 4.2 },
      { left: 64, top: 60, delay: 2.3, duration: 3.5 },
      { left: 78, top: 68, delay: 2.8, duration: 4.7 },
      { left: 12, top: 78, delay: 0.4, duration: 3.8 },
      { left: 28, top: 85, delay: 0.9, duration: 4.1 }
    ];
    return positions[index % positions.length];
  };

  const openSignInModal = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
  };

  const openSignUpModal = () => {
    setShowSignUpModal(true);
    setShowSignInModal(false);
  };

  const closeModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            const position = generatePosition(i);
            return (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${position.left}%`,
                  top: `${position.top}%`,
                  animationDelay: `${position.delay}s`,
                  animationDuration: `${position.duration}s`
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full opacity-30"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`text-center lg:text-left space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                #1 Job Platform in Rwanda
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 font-medium">
                {slides[currentSlide].subtitle}
              </p>
              
              <p className="text-lg text-white/80 max-w-lg">
                {slides[currentSlide].description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={openSignUpModal}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                Get Started Now
              </button>
              <button
                onClick={openSignInModal}
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {[
                { number: "10K+", label: "Active Users" },
                { number: "5K+", label: "Jobs Posted" },
                { number: "95%", label: "Success Rate" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Animated Illustration */}
          <div className={`hidden lg:flex justify-center items-center transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <div className="text-9xl animate-bounce">{slides[currentSlide].image}</div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-12 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-8 bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Sign In Modal */}
      <Modal isOpen={showSignInModal} onClose={closeModals}>
        <SignInPopup 
          isOpen={showSignInModal} 
          onClose={closeModals} 
          onSwitchToSignup={openSignUpModal} 
        />
      </Modal>
      
      {/* Sign Up Modal */}
      <Modal isOpen={showSignUpModal} onClose={closeModals}>
        <SignUpPopup 
          isOpen={showSignUpModal} 
          onClose={closeModals} 
          onSwitchToSignin={openSignInModal} 
        />
      </Modal>
    </section>
  );
}
