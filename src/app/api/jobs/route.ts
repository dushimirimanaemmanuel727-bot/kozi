import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query, transaction } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log('Job creation API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.role, session?.user?.phone);

    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role?.toLowerCase();
    if (userRole !== "employer") {
      console.log('User role not employer:', userRole);
      return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    const { title, category, description, budget, district, deadline } = body;
    const budgetNum: number | undefined = budget ? Number(budget) : undefined;
    const districtStr: string | null = district ?? null;
    const deadlineDate: Date | null = deadline ? new Date(deadline) : null;

    // Get employer user ID from session phone
    console.log('Looking up employer with phone:', session.user.phone);
    const employerResult = await query('SELECT id, name FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];
    console.log('Employer found:', employer);

    if (!employer) {
      console.log('Employer not found');
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('Creating job with ID:', jobId);
    
    // Create the job
    const createJobResult = await query(
      `INSERT INTO "Job" (id, employerid, title, category, description, payamount, location, deadline, status, createdat) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW()) 
       RETURNING *`,
      [jobId, employer.id, title, category, description, budgetNum, districtStr, deadlineDate]
    );
    const job = createJobResult.rows[0];
    console.log('Job created successfully:', job);

    // Send notifications to all workers about the new job
    try {
      // Get all workers matching the category
      const workersResult = await query(
        `SELECT u.id FROM "User" u 
         JOIN "WorkerProfile" wp ON u.id = wp."userId" 
         WHERE u.role = 'worker' AND wp.category = $1`,
        [category]
      );
      const workers = workersResult.rows;
      console.log('Found workers for notifications:', workers.length);

      // Create notifications for all matching workers
      if (workers.length > 0) {
        for (const worker of workers) {
          const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await query(
            `INSERT INTO "Notification" (id, "userId", title, message, type, read, "createdAt") 
             VALUES ($1, $2, $3, $4, 'JOB_POSTED', false, NOW())`,
            [
              notificationId, 
              worker.id, 
              "New Household Job", 
              `${employer.name} is looking for a ${category.toLowerCase()}: ${title}${districtStr ? ` in ${districtStr}` : ''}${budgetNum ? ` - ${budgetNum} FRW/month` : ''}`
            ]
          );
        }
      }
    } catch (notificationError) {
      console.error("Failed to send job notifications:", notificationError);
      // Don't fail the job creation if notifications fail
    }

    console.log('Job creation completed successfully');
    return NextResponse.json({ 
      message: "Job created successfully",
      job 
    });

  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
