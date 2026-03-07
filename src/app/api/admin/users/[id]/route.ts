import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-middleware";

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        employerProfile: true,
        workerProfile: true,
        jobsPosted: {
          select: { id: true, title: true, status: true },
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        applications: {
          select: { id: true, status: true, job: { select: { title: true } } },
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert Decimal to number for serialization
    const serializedUser = {
      ...user,
      workerProfile: user.workerProfile ? {
        ...user.workerProfile,
        minMonthlyPay: user.workerProfile.minMonthlyPay ? Number(user.workerProfile.minMonthlyPay) : null
      } : null
    };

    return NextResponse.json({ user: serializedUser });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    const body = await request.json();
    const { name, email, phone, role, status } = body;

    // Only SUPERADMIN can change roles
    if (role && session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Only SUPERADMIN can change user roles" },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        employerProfile: true,
        workerProfile: true
      }
    });

    // Convert Decimal to number for serialization
    const serializedUser = {
      ...updatedUser,
      workerProfile: updatedUser.workerProfile ? {
        ...updatedUser.workerProfile,
        minMonthlyPay: updatedUser.workerProfile.minMonthlyPay ? Number(updatedUser.workerProfile.minMonthlyPay) : null
      } : null
    };

    return NextResponse.json({ user: serializedUser });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    
    // Only SUPERADMIN can delete users
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Only SUPERADMIN can delete users" },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deletion of SUPERADMIN users
    if (user.role === "SUPERADMIN") {
      return NextResponse.json(
        { error: "Cannot delete SUPERADMIN users" },
        { status: 403 }
      );
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
