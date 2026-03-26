import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const id = `test_${Date.now()}`;
    const passwordHash = await bcrypt.hash('test123', 12);
    
    console.log('Testing direct insert with:', {
      id,
      passwordHash: passwordHash.substring(0, 20) + '...'
    });
    
    const result = await query(`
      INSERT INTO "User" (
        id, name, phone, email, role, district, languages, 
        passwordHash, suspended, createdAt
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      id, 
      'Test Direct', 
      '0789999999', 
      'test@direct.com', 
      'worker', 
      'Kigali', 
      ['Kinyarwanda'], 
      passwordHash, 
      false, 
      new Date()
    ]);
    
    return Response.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Direct insert error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json({ 
      error: errorMessage,
      details: error
    }, { status: 500 });
  }
}
