"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/language-context";
import LanguageSwitcher from "@/components/ui/language-switcher";

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { translate } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { href: "#features", label: translate("features") },
    { href: "#how-it-works", label: translate("how_it_works") },
    { href: "#testimonials", label: translate("testimonials") },
    { href: "#contact", label: translate("contact") }
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg" 
        : "bg-white/90 backdrop-blur-md shadow-sm"
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
              isScrolled ? "text-gray-900" : "text-gray-900"
            }`}>KaziHome</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`font-medium transition-colors ${
                  isScrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons & Language Switcher */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {translate("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isScrolled 
                      ? "text-gray-700 hover:text-blue-600 border border-gray-300" 
                      : "text-gray-700 hover:text-blue-600 border border-gray-300"
                  }`}
                >
                  {translate("sign_in")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {translate("sign_up")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-3 rounded-lg transition-colors ${
                isScrolled 
                  ? "text-gray-700 hover:bg-gray-100 border border-gray-300" 
                  : "text-gray-700 hover:bg-gray-100 border border-gray-300"
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 shadow-xl overflow-y-auto max-h-[calc(100vh-4rem)]">
            <div className="px-6 py-8 space-y-6">
              {navigation.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className="block w-full text-left px-4 py-3 text-lg font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-6 border-t border-gray-100 space-y-4">
                {session ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-200"
                  >
                    {translate("go_to_dashboard")}
                  </Link>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-4 text-gray-700 border-2 border-gray-100 rounded-xl font-bold hover:bg-gray-50 transition-all text-center"
                    >
                      {translate("sign_in")}
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full px-4 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-center shadow-lg shadow-blue-200"
                    >
                      {translate("create_account")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
