import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session?.user?.role?.toUpperCase() !== "EMPLOYER") {
      return NextResponse.json({ error: "Not an employer" }, { status: 403 });
    }

    // Get employer user ID from session phone
    const employerResult = await query('SELECT id FROM "User" WHERE phone = $1', [session.user.phone]);
    const employer = employerResult.rows[0];

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get employer profile
    const profileResult = await query(
      'SELECT * FROM "EmployerProfile" WHERE userid = $1',
      [employer.id]
    );
    const employerProfile = profileResult.rows[0];

    if (!employerProfile) {
      // Return default/empty profile data if no profile exists yet
      return NextResponse.json({
        // EmployerProfile fields with defaults
        id: null,
        userId: employer.id,
        companyName: null,
        website: null,
        description: null,
        industry: null,
        companySize: null,
        rating: 0,
        reviewCount: 0,
        logoUrl: null,
        createdAt: null,
        updatedAt: null,
        // Stats
        jobCount: 0,
        applicationCount: 0,
        hiredCount: 0,
        recentJobs: []
      });
    }

    // Get additional stats
    const jobCountResult = await query(
      'SELECT COUNT(*) as count FROM "Job" WHERE employerid = $1',
      [employer.id]
    );
    const jobCount = parseInt(jobCountResult.rows[0].count);

    const applicationCountResult = await query(
      'SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a.jobid = j.id WHERE j.employerid = $1',
      [employer.id]
    );
    const applicationCount = parseInt(applicationCountResult.rows[0].count);

    const hiredCountResult = await query(
      'SELECT COUNT(*) as count FROM "Application" a JOIN "Job" j ON a.jobid = j.id WHERE j.employerid = $1 AND a.status = $2',
      [employer.id, 'ACCEPTED']
    );
    const hiredCount = parseInt(hiredCountResult.rows[0].count);

    const recentJobsResult = await query(
      'SELECT title, status, createdat FROM "Job" WHERE employerid = $1 ORDER BY createdat DESC LIMIT 5',
      [employer.id]
    );
    const recentJobs = recentJobsResult.rows;

    return NextResponse.json({
      id: employerProfile.id,
      userId: employerProfile.userid,
      companyName: employerProfile.companyname,
      website: employerProfile.website,
      description: employerProfile.description,
      industry: employerProfile.industry,
      companySize: employerProfile.companysize,
      rating: employerProfile.rating,
      reviewCount: employerProfile.reviewcount,
      logoUrl: employerProfile.logourl,
      createdAt: employerProfile.createdat,
      updatedAt: employerProfile.updatedat,
      jobCount,
      applicationCount,
      hiredCount,
      recentJobs
    });

  } catch (error) {
    console.error("Get employer profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
