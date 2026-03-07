"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Modal from "@/components/ui/modal";
import SignInPopup from "@/components/auth/signin-popup";
import SignUpPopup from "@/components/auth/signup-popup";

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#contact", label: "Contact" }
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const openSignInModal = () => {
    setShowSignInModal(true);
    setShowSignUpModal(false);
    setIsMobileMenuOpen(false);
  };

  const openSignUpModal = () => {
    setShowSignUpModal(true);
    setShowSignInModal(false);
    setIsMobileMenuOpen(false);
  };

  const closeModals = () => {
    setShowSignInModal(false);
    setShowSignUpModal(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isScrolled ? "bg-blue-600" : "bg-white"
            }`}>
              <span className={`font-bold text-xl ${
                isScrolled ? "text-white" : "text-blue-600"
              }`}>K</span>
            </div>
            <span className={`text-2xl font-bold ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}>KaziHome</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium transition-colors ${
                  isScrolled ? "text-gray-700 hover:text-blue-600" : "text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={openSignInModal}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled 
                      ? "text-gray-700 hover:text-blue-600 border border-gray-300" 
                      : "text-white hover:text-white border border-white/50"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={openSignUpModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-3 rounded-lg transition-colors ${
              isScrolled 
                ? "text-gray-700 hover:bg-gray-100 border border-gray-300" 
                : "text-white hover:bg-white/20 border border-white/50"
            }`}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {session ? (
                  <Link
                    href="/dashboard"
                    className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={openSignInModal}
                      className="block w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={openSignUpModal}
                      className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
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
    </nav>
  );
}
