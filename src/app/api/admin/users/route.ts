import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-middleware";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    
    // Check if export is requested
    if (searchParams.get('export') === 'true') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          employerProfile: true,
          workerProfile: true
        }
      });

      // Convert Decimal objects to plain numbers for serialization
      const serializedUsers = users.map(user => ({
        ...user,
        workerProfile: user.workerProfile ? {
          ...user.workerProfile,
          minMonthlyPay: user.workerProfile.minMonthlyPay ? Number(user.workerProfile.minMonthlyPay) : null
        } : null
      }));

      // Create CSV content
      const headers = ['ID', 'Name', 'Phone', 'Email', 'Role', 'District', 'Languages', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...serializedUsers.map(user => [
          user.id,
          user.name,
          user.phone,
          user.email || '',
          user.role,
          user.district || '',
          user.languages || '',
          user.createdAt.toISOString()
        ].join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`
        }
      });
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'ALL') {
      where.role = role;
    }
    
    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employerProfile: {
            select: { organization: true }
          },
          workerProfile: {
            select: { 
              category: true, 
              experienceYears: true, 
              rating: true,
              reviewCount: true,
              minMonthlyPay: true
            }
          },
          _count: {
            select: {
              jobsPosted: true,
              applications: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    // Convert Decimal objects to plain numbers for serialization
    const serializedUsers = users.map(user => ({
      ...user,
      workerProfile: user.workerProfile ? {
        ...user.workerProfile,
        minMonthlyPay: user.workerProfile.minMonthlyPay ? Number(user.workerProfile.minMonthlyPay) : null
      } : null
    }));
    
    return NextResponse.json({
      users: serializedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
