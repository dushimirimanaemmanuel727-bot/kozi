import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const where: any = {};
    
    if (status && status !== "ALL") {
      where.status = status;
    }
    
    if (type && type !== "ALL") {
      where.type = type;
    }
    
    if (search) {
      where.user = {
        name: { contains: search, mode: "insensitive" }
      };
    }

    const [verifications, total] = await Promise.all([
      prisma.verification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              role: true,
              workerProfile: {
                select: {
                  nationalId: true,
                  passportNumber: true,
                  passportUrl: true,
                  category: true
                }
              }
            }
          }
        },
        orderBy: { issuedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.verification.count({ where })
    ]);

    return NextResponse.json({
      verifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching verifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch verifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, type, status, issuedAt, expiresAt } = await request.json();

    const verification = await prisma.verification.create({
      data: {
        userId,
        type,
        status: status || "PENDING",
        issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json(verification);
  } catch (error) {
    console.error("Error creating verification:", error);
    return NextResponse.json(
      { error: "Failed to create verification" },
      { status: 500 }
    );
  }
}
