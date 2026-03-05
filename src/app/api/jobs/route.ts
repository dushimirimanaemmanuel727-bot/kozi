import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const employerPhone: string | undefined = body.employerPhone;
  const title: string = body.title;
  const category: string = body.category;
  const description: string = body.description;
  const budget: number | undefined = body.budget ? Number(body.budget) : undefined;
  const district: string | null = body.district ?? null;

  let employer = null as null | { id: string };
  if (employerPhone) {
    employer = await prisma.user.findFirst({ where: { phone: employerPhone, role: "EMPLOYER" }, select: { id: true } });
  }
  if (!employer) {
    employer = await prisma.user.findFirst({ where: { role: "EMPLOYER" }, select: { id: true } });
  }
  if (!employer) {
    return NextResponse.json({ error: "No employer found" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      employerId: employer.id,
      title,
      category,
      description,
      budget,
      district,
    },
  });
  return NextResponse.json({ job });
}
