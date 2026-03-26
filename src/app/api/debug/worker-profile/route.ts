import { query } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user from session
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if WorkerProfile exists for this user
    const profileExistsResult = await query(`
      SELECT EXISTS (
        SELECT FROM "WorkerProfile" 
        WHERE "userId" = $1
      ) as exists
    `, [user.id]);

    const profileExists = profileExistsResult.rows[0].exists;

    let workerProfile = null;
    if (profileExists) {
      const profileResult = await query(`
        SELECT * FROM "WorkerProfile" WHERE "userId" = $1
      `, [user.id]);
      workerProfile = profileResult.rows[0];
    }

    return Response.json({ 
      user: {
        id: user.id,
        role: user.role,
        phone: session.user.phone
      },
      workerProfile: {
        exists: profileExists,
        data: workerProfile
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
