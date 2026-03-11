import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { NotificationProvider } from "@/components/ui/notification-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kazi Home - Find Workers and Jobs in Rwanda",
  description: "Connect with skilled workers and find job opportunities in Rwanda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <NotificationProvider>
            <SessionProviderWrapper>
              {children}
            </SessionProviderWrapper>
          </NotificationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
