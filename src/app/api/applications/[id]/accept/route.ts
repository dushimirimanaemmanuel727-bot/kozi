import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: applicationId } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Only employers can accept applications" }, { status: 403 });
    }

    // Get employer user ID from session phone
    const employer = await prisma.user.findUnique({
      where: { phone: session.user.phone },
      select: { id: true }
    });

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 });
    }

    // Get the application and verify ownership
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: { 
            employerId: true,
            title: true
          }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.job.employerId !== employer.id) {
      return NextResponse.json({ error: "Not authorized to accept this application" }, { status: 403 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application is not pending" }, { status: 400 });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" }
    });

    // Create notification for worker using raw SQL (workaround for Prisma client not being updated)
    await prisma.$executeRaw`
      INSERT INTO "Notification" (id, "userId", title, message, type, "read", "createdAt")
      VALUES (${crypto.randomUUID()}, ${application.workerId}, ${'Application Accepted! 🎉'}, ${`Your application for "${application.job?.title || "a position"}" has been accepted! Contact the employer to discuss next steps.`}, ${'SUCCESS'}, ${false}, ${new Date()})
    `;

    return NextResponse.json({ 
      message: "Application accepted successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Accept application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
