import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Simulate the login process that the signin page uses
    const formData = await request.formData();
    
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }

    // Call NextAuth signin endpoint
    const authResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3030'}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        phone,
        password,
        csrfToken: 'test', // We'll skip CSRF for testing
        callbackUrl: '/',
        json: 'true'
      })
    });

    const authData = await authResponse.text();
    
    // Try to get session after login
    const session = await getServerSession(authOptions);

    return NextResponse.json({
      authResponseStatus: authResponse.status,
      authResponseText: authData,
      session: session,
      sessionExists: !!session,
      userRole: session?.user?.role,
      canLogin: !!session?.user
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}
