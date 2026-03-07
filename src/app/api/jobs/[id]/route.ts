import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the job
    const job = await prisma.$queryRawUnsafe(`
      SELECT 
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
      WHERE j.id = '${id}'
    `);

    if (!job || (job as any[]).length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobData = job as any[];

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && jobData[0].employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(jobData[0]);

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
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if job exists and user owns it
    const existingJob = await prisma.$queryRawUnsafe(`
      SELECT id, "employerId", status
      FROM "Job" 
      WHERE id = '${id}'
    `);

    if (!existingJob || (existingJob as any[]).length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobData = existingJob as any[];

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && jobData[0].employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, budget, district, deadline } = body;

    // Validate required fields
    if (!title || !category || !description) {
      return NextResponse.json({ error: "Title, category, and description are required" }, { status: 400 });
    }

    // Update the job
    const updatedJob = await prisma.$executeRawUnsafe(`
      UPDATE "Job"
      SET 
        title = '${title}',
        category = '${category}',
        description = '${description}',
        budget = ${budget ? parseInt(budget) : null},
        district = ${district ? `'${district}'` : null},
        deadline = ${deadline ? `'${new Date(deadline).toISOString()}'` : null},
        "updatedAt" = NOW()
      WHERE id = '${id}'
      RETURNING id, title, category, description, budget, district, status, "createdAt", deadline
    `);

    return NextResponse.json({ 
      message: "Job updated successfully",
      job: updatedJob
    });

  } catch (error) {
    console.error("Failed to update job:", error);
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

    if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only employers can delete jobs" }, { status: 403 });
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if job exists and user owns it
    const existingJob = await prisma.$queryRawUnsafe(`
      SELECT id, "employerId"
      FROM "Job" 
      WHERE id = '${id}'
    `);

    if (!existingJob || (existingJob as any[]).length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobData = existingJob as any[];

    // Check if user owns the job or is admin
    if (user.role !== "ADMIN" && jobData[0].employerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the job (this will cascade delete applications)
    await prisma.$executeRawUnsafe(`
      DELETE FROM "Job" WHERE id = '${id}'
    `);

    return NextResponse.json({ 
      message: "Job deleted successfully"
    });

  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
