"use client";

import { SessionProvider } from "next-auth/react";
import { authOptions } from "@/lib/auth";

interface ProvidersProps {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: ProvidersProps) {
  return <SessionProvider session={null}>{children}</SessionProvider>;
}
