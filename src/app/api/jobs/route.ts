import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, budget, district, deadline } = body;
    const budgetNum: number | undefined = budget ? Number(budget) : undefined;
    const districtStr: string | null = district ?? null;
    const deadlineDate: Date | null = deadline ? new Date(deadline) : null;

    // Get employer user ID from session
    const employer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true, name: true }
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title,
        category,
        description,
        budget: budgetNum,
        district: districtStr,
        ...(deadlineDate && { deadline: deadlineDate }),
      },
    });

    // Send notifications to all workers about the new job
    try {
      // Get all workers
      const workers = await prisma.user.findMany({
        where: { 
          role: "WORKER",
          // Optionally filter by workers who match the job category or district
          workerProfile: {
            category: category
          }
        },
        select: { id: true }
      });

      // Create notifications for all matching workers
      const notifications = workers.map(worker => ({
        userId: worker.id,
        title: "New Household Job",
        message: `${employer.name} is looking for a ${category.toLowerCase()}: ${title}${districtStr ? ` in ${districtStr}` : ''}${budgetNum ? ` - ${budgetNum} FRW/month` : ''}`,
        type: "JOB_POSTED"
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications
        });
      }
    } catch (notificationError) {
      console.error("Failed to send job notifications:", notificationError);
      // Don't fail the job creation if notifications fail
    }

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
