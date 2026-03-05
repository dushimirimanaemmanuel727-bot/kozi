"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "@/components/auth/auth-modal";

export default function Home() {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">Loading Kazi Home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Kazi Home</h1>
              <p className="text-blue-100 text-lg">Connect with trusted workers and employers in Rwanda</p>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-blue-200 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/workers"
                    className="text-white hover:text-blue-200 font-medium transition-colors"
                  >
                    Browse Workers
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal("signin")}
                    className="text-white hover:text-blue-200 font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-6 flex flex-col gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-blue-200 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/workers"
                  className="text-white hover:text-blue-200 font-medium transition-colors"
                >
                  Browse Workers
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal("signin")}
                  className="text-white hover:text-blue-200 font-medium transition-colors text-left"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-all"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              Worker or Job
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect with skilled nannies, cooks, cleaners, gardeners, security personnel, drivers, and laundry professionals across Rwanda
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/workers"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Workers
            </Link>
            {session ? (
              <Link 
                href={session.user.role === "EMPLOYER" ? "/jobs/new" : "/dashboard"}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
              >
                {session.user.role === "EMPLOYER" ? "Post a Job" : "View Dashboard"}
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal("signup")}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all transform hover:scale-105"
              >
                Join Now
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 mb-4">
              <div className="text-4xl font-bold text-blue-800 mb-2">500+</div>
              <div className="text-blue-600 font-medium">Verified Workers</div>
            </div>
            <p className="text-gray-600">Trusted professionals across all categories</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 mb-4">
              <div className="text-4xl font-bold text-green-800 mb-2">1000+</div>
              <div className="text-green-600 font-medium">Jobs Posted</div>
            </div>
            <p className="text-gray-600">Opportunities created for Rwandan workers</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 mb-4">
              <div className="text-4xl font-bold text-purple-800 mb-2">98%</div>
              <div className="text-purple-600 font-medium">Success Rate</div>
            </div>
            <p className="text-gray-600">Happy employers and workers nationwide</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0112 21a9.001 9.001 0 01-9-9.255A9.001 9.001 0 0112 3a9.001 9.001 0 019 9.255z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Employers</h3>
            <p className="text-gray-600 mb-6">Find verified workers with proven experience and reliable reviews</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Verified worker profiles
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Real reviews and ratings
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Direct communication
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Workers</h3>
            <p className="text-gray-600 mb-6">Create your profile and connect with quality employers</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Free profile creation
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Build your reputation
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Flexible job opportunities
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border border-gray-100">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 w-16 h-16 mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
            <p className="text-gray-600 mb-6">Professional services across multiple sectors</p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Nanny & Childcare
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Cooking & Cleaning
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Security & Driving
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {session ? "Welcome Back to Kazi Home!" : "Ready to Transform Your Career or Business?"}
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {session 
              ? `Continue your journey as ${session.user.name} - explore new opportunities and connections`
              : "Join thousands of Rwandans who are already finding reliable work and skilled workers through Kazi Home"
            }
          </p>
          {session ? (
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-xl inline-block"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("signup")}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-xl inline-block"
            >
              Get Started Now
            </button>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
