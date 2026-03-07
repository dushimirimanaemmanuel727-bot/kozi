import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN") {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  if (session.user?.role !== "SUPERADMIN") {
    redirect("/unauthorized");
  }
  
  return session;
}

export function isAdmin(role?: string): boolean {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function isSuperAdmin(role?: string): boolean {
  return role === "SUPERADMIN";
}
