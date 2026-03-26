"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useNotifications } from "@/components/ui/notification-toast";

interface SignOutButtonProps {
  variant?: "full" | "compact";
}

export default function SignOutButton({ variant = "full" }: SignOutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { showNotification } = useNotifications();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      showNotification({
        type: "info",
        title: "Signed Out",
        message: "You have been successfully logged out.",
      });
      // Redirect to homepage after successful sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  // Compact version for dropdown menus
  if (variant === "compact") {
    return (
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="w-full flex items-center text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {isSigningOut ? "Signing Out..." : "Log out"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 group"
      >
        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span>Sign Out</span>
      </button>

      {/* Centered Sign Out Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 max-w-sm w-full transform transition-all animate-in zoom-in-95 duration-300">
            <div className="text-center">
              {/* Animated Logout Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-red-50 mb-6 shadow-inner">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <LogOut className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Sign Out?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed px-2">
                Are you sure you want to sign out? You'll need to enter your phone and password again to access your account.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full py-4 px-6 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSigningOut ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0h12v8z"></path>
                      </svg>
                      Signing out...
                    </>
                  ) : (
                    "Yes, Sign Out"
                  )}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isSigningOut}
                  className="w-full py-4 px-6 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
