"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ModernLandingPage from "@/components/landing/modern/modern-landing-page";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Redirect to dashboard based on user role
      const userRole = session.user?.role?.toUpperCase();
      if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/en/dashboard");
      }
    }
  }, [session, router]);

  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <ModernLandingPage />;
}
