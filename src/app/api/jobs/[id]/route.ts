import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from session
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the job
    const jobResult = await query(
      `SELECT 
        j.id,
        j.title,
        j.category,
        j.description,
        j.budget,
        j.district,
        j.status,
        j."createdAt",
        j.deadline,
        j."employerId"
      FROM "Job" j
      WHERE j.id = $1`,
      [id]
    );
    const job = jobResult.rows[0];

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && job.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(job);

  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only employers can edit jobs" }, { status: 403 });
    }

    // Get user from session
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if job exists and user owns it
    const existingJobResult = await query(
      'SELECT id, "employerId", status FROM "Job" WHERE id = $1',
      [id]
    );
    const existingJob = existingJobResult.rows[0];

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && existingJob.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, budget, district, deadline, status } = body;

    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (category !== undefined) { fields.push(`category = $${paramIndex++}`); values.push(category); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (budget !== undefined) { fields.push(`budget = $${paramIndex++}`); values.push(Number(budget)); }
    if (district !== undefined) { fields.push(`district = $${paramIndex++}`); values.push(district); }
    if (deadline !== undefined) { fields.push(`deadline = $${paramIndex++}`); values.push(deadline ? new Date(deadline) : null); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }

    if (fields.length === 0) {
      return NextResponse.json({ message: "No changes to update" });
    }

    fields.push(`"updatedAt" = NOW()`);
    values.push(id);
    
    const updateResult = await query(
      `UPDATE "Job" SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json({ 
      message: "Job updated successfully",
      job: updateResult.rows[0]
    });

  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from session
    const userResult = await query('SELECT id, role FROM "User" WHERE phone = $1', [session.user.phone]);
    const user = userResult.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if job exists and user owns it
    const jobResult = await query('SELECT id, "employerId" FROM "Job" WHERE id = $1', [id]);
    const job = jobResult.rows[0];

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && job.employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the job
    await query('DELETE FROM "Job" WHERE id = $1', [id]);

    return NextResponse.json({ message: "Job deleted successfully" });

  } catch (error) {
    console.error("Job deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
