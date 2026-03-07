import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const district = searchParams.get("district");
  const availability = searchParams.get("availability");
  const minExp = searchParams.get("minExp");
  const liveIn = searchParams.get("liveIn");
  const q = searchParams.get("q");

  const where: Prisma.WorkerProfileWhereInput = {};
  if (category) where.category = category;
  if (availability) where.availability = availability;
  if (liveIn === "true") where.liveIn = true;
  if (minExp) where.experienceYears = { gte: Number(minExp) || 0 };
  if (q) where.OR = [{ skills: { contains: q, mode: "insensitive" } }, { bio: { contains: q, mode: "insensitive" } }];

  const usersWhere: Prisma.UserWhereInput = { role: "WORKER" };
  if (district) usersWhere.district = district;

  const workers = await prisma.workerProfile.findMany({
    where: {
      ...where,
      user: { is: usersWhere },
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true, district: true, languages: true },
      },
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 50,
  });

  const data = workers
    .filter((w) => !!w.user)
    .map((w) => ({
      id: w.id,
      category: w.category,
      availability: w.availability,
      liveIn: w.liveIn,
      experienceYears: w.experienceYears,
      rating: w.rating,
      reviewCount: w.reviewCount,
      photoUrl: w.photoUrl,
      skills: w.skills,
      bio: w.bio,
      user: {
        id: w.user!.id,
        name: w.user!.name,
        phone: w.user!.phone,
        district: w.user!.district,
        languages: w.user!.languages,
      },
    }));

  return NextResponse.json(data);
}
