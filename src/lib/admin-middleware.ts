import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.user?.role?.toLowerCase() !== "admin" && session.user?.role?.toLowerCase() !== "superadmin") {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.user?.role?.toLowerCase() !== "superadmin") {
    redirect("/unauthorized");
  }
  
  return session;
}

export function isAdmin(role?: string): boolean {
  const roleLower = role?.toLowerCase();
  return roleLower === "admin" || roleLower === "superadmin";
}

export function isSuperAdmin(role?: string): boolean {
  return role?.toLowerCase() === "superadmin";
}
