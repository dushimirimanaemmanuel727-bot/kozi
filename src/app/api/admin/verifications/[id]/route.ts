import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user.role?.toLowerCase() !== "admin" && session.user.role?.toLowerCase() !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verification table doesn't exist
    return NextResponse.json({ 
      error: "Verification system is not available" 
    }, { status: 503 });
    
  } catch (error: unknown) {
    console.error("Error updating verification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update verification", details: errorMessage },
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
    
    if (!session || !session.user || (session.user.role?.toLowerCase() !== "admin" && session.user.role?.toLowerCase() !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verification table doesn't exist
    return NextResponse.json({ 
      error: "Verification system is not available" 
    }, { status: 503 });
    
  } catch (error: unknown) {
    console.error("Error deleting verification:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete verification", details: errorMessage },
      { status: 500 }
    );
  }
}
