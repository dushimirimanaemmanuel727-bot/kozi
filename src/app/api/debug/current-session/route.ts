import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Full session object:', JSON.stringify(session, null, 2));
    
    if (!session) {
      return NextResponse.json({ 
        error: "No session found",
        session: null 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      message: "Session found",
      session: {
        user: {
          id: session.user?.id,
          name: session.user?.name,
          email: session.user?.email,
          role: session.user?.role,
          phone: session.user?.phone
        },
        expires: session.expires
      },
      roleCheck: {
        hasRole: !!session.user?.role,
        roleValue: session.user?.role,
        roleLower: session.user?.role?.toLowerCase(),
        isSuperAdmin: session.user?.role?.toLowerCase() === "superadmin",
        isAdmin: session.user?.role?.toLowerCase() === "admin"
      }
    });

  } catch (error: any) {
    console.error("Debug session error:", error);
    return NextResponse.json(
      { error: "Debug error: " + error.message },
      { status: 500 }
    );
  }
}
