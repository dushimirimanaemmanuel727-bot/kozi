import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-middleware";
import { query } from "@/lib/db";

// GET all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    
    const { searchParams } = new URL(request.url);
    
    // Check if export is requested
    if (searchParams.get('export') === 'true') {
      const usersResult = await query(
        `SELECT u.*, ep.organization, wp.category, wp."experienceYears", wp.rating, wp."reviewCount", wp."minMonthlyPay"
         FROM "User" u
         LEFT JOIN "EmployerProfile" ep ON u.id = ep."userId"
         LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
         ORDER BY u."createdAt" DESC`
      );
      const users = usersResult.rows;

      // Create CSV content
      const headers = ['ID', 'Name', 'Phone', 'Email', 'Role', 'District', 'Languages', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...users.map((user: any) => [
          user.id,
          user.name,
          user.phone,
          user.email || '',
          user.role,
          user.district || '',
          user.languages || '',
          user.createdAt ? new Date(user.createdAt).toISOString() : ''
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
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (role && role !== 'ALL') {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    
    const offset = (page - 1) * limit;

    // Fetch users with pagination
    const [usersResult, totalCountResult] = await Promise.all([
      query(
        `SELECT u.*, ep.organization, 
                wp.category, wp."experienceYears", wp.rating, wp."reviewCount", wp."minMonthlyPay",
                (SELECT COUNT(*) FROM "Job" j WHERE j."employerId" = u.id) as jobs_posted_count,
                (SELECT COUNT(*) FROM "Application" a WHERE a."workerId" = u.id) as applications_count
         FROM "User" u
         LEFT JOIN "EmployerProfile" ep ON u.id = ep."userId"
         LEFT JOIN "WorkerProfile" wp ON u.id = wp."userId"
         ${whereClause}
         ORDER BY u."createdAt" DESC
         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) as count FROM "User" u ${whereClause}`, params)
    ]);
    
    const users = usersResult.rows.map((user: any) => ({
      ...user,
      employerProfile: user.organization ? { organization: user.organization } : null,
      workerProfile: user.category ? { 
        category: user.category, 
        experienceYears: user.experienceYears, 
        rating: user.rating,
        reviewCount: user.reviewCount,
        minMonthlyPay: user.minMonthlyPay ? Number(user.minMonthlyPay) : null
      } : null,
      _count: {
        jobsPosted: parseInt(user.jobs_posted_count),
        applications: parseInt(user.applications_count)
      }
    }));
    
    const totalCount = parseInt(totalCountResult.rows[0].count);
    
    // Convert Decimal objects to plain numbers for serialization
    const serializedUsers = users.map((user: any) => ({
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
