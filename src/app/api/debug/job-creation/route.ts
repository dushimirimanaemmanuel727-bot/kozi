import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    console.log('=== DEBUG: Job creation test started ===');
    
    const session = await getServerSession(authOptions);
    console.log('DEBUG: Session found:', !!session);
    console.log('DEBUG: User role:', session?.user?.role);
    console.log('DEBUG: User phone:', session?.user?.phone);

    if (!session) {
      console.log('DEBUG: No session found');
      return NextResponse.json({ error: "Unauthorized", debug: "No session" }, { status: 401 });
    }

    const userRole = session.user.role?.toLowerCase();
    if (userRole !== "employer") {
      console.log('DEBUG: User role not employer:', userRole);
      return NextResponse.json({ error: "Only employers can post jobs", debug: `Role: ${userRole}` }, { status: 403 });
    }

    const body = await req.json();
    console.log('DEBUG: Request body:', body);
    
    const { title, category, description, budget, district, deadline } = body;
    const budgetNum: number | undefined = budget ? Number(budget) : undefined;
    const districtStr: string | null = district ?? null;
    const deadlineDate: Date | null = deadline ? new Date(deadline) : null;

    // Get employer user ID from session phone
    console.log('DEBUG: Looking up employer with phone:', session.user.phone);
    const employerResult = await query('SELECT id, name FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];
    console.log('DEBUG: Employer found:', !!employer, employer?.id, employer?.name);

    if (!employer) {
      console.log('DEBUG: Employer not found');
      return NextResponse.json({ error: "Employer not found", debug: `Phone: ${session.user.phone}` }, { status: 404 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('DEBUG: Creating job with ID:', jobId);
    
    // Test the Job table structure first
    console.log('DEBUG: Testing Job table access...');
    const jobTableTest = await query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Job\' ORDER BY ordinal_position');
    console.log('DEBUG: Job table columns:', jobTableTest.rows.map((row: any) => `${row.column_name}: ${row.data_type}`));
    
    // Create the job
    console.log('DEBUG: Inserting job...');
    const createJobResult = await query(
      `INSERT INTO "Job" (id, "employerId", title, category, description, "salaryRange", location, "applicationDeadline", status, "publishedAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW()) 
       RETURNING *`,
      [jobId, employer.id, title, category, description, budgetNum ? budgetNum.toString() : null, districtStr, deadlineDate]
    );
    const job = createJobResult.rows[0];
    console.log('DEBUG: Job created successfully:', job);

    console.log('=== DEBUG: Job creation test completed successfully ===');
    return NextResponse.json({ 
      message: "Job created successfully",
      job,
      debug: {
        employer: { id: employer.id, name: employer.name },
        jobId,
        requestData: { title, category, description, budget: budgetNum, district: districtStr, deadline: deadlineDate }
      }
    });

  } catch (error) {
    console.error('=== DEBUG: Job creation error ===', error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        debug: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'Unknown'
        }
      },
      { status: 500 }
    );
  }
}
