import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, expiresAt, notes } = await request.json();

    const verification = await prisma.verification.update({
      where: { id },
      data: {
        status,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true
          }
        }
      }
    });

    // TODO: Send notification to user about status change
    // await sendVerificationNotification(verification.userId, status);

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Error updating verification:", error);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.verification.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Verification deleted successfully" });
  } catch (error) {
    console.error("Error deleting verification:", error);
    return NextResponse.json(
      { error: "Failed to delete verification" },
      { status: 500 }
    );
  }
}
