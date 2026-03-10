import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('🚀 Starting database schema update...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    const results = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip database creation and connection commands
      if (statement.includes('CREATE DATABASE') || 
          statement.includes('\\c') || 
          statement.includes('GRANT ALL PRIVILEGES')) {
        console.log(`⏭️  Skipping statement ${i + 1}: ${statement.substring(0, 50)}...`);
        continue;
      }
      
      try {
        await query(statement);
        console.log(`✅ Executed statement ${i + 1}: ${statement.substring(0, 50)}...`);
        results.push({ statement: i + 1, status: 'success', message: 'Executed successfully' });
      } catch (error: any) {
        // Check if it's a "already exists" error, which is fine
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist')) {
          console.log(`⚠️  Statement ${i + 1} skipped (object already exists): ${statement.substring(0, 50)}...`);
          results.push({ statement: i + 1, status: 'skipped', message: 'Object already exists' });
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement}`);
          results.push({ statement: i + 1, status: 'error', message: error.message, sql: statement });
        }
      }
    }
    
    console.log('🎉 Database schema update completed!');
    
    // Test the new tables
    console.log('🔍 Testing new tables...');
    const testResults: any = {};
    
    try {
      const employerResult = await query('SELECT COUNT(*) as count FROM "EmployerProfile"');
      console.log('✅ EmployerProfile table accessible');
      testResults.employerProfile = { accessible: true, count: employerResult.rows[0].count };
    } catch (error: any) {
      console.log('⚠️  EmployerProfile table test failed:', error.message);
      testResults.employerProfile = { accessible: false, error: error.message };
    }
    
    try {
      const workerResult = await query('SELECT COUNT(*) as count FROM "WorkerProfile"');
      console.log('✅ WorkerProfile table accessible');
      testResults.workerProfile = { accessible: true, count: workerResult.rows[0].count };
    } catch (error: any) {
      console.log('⚠️  WorkerProfile table test failed:', error.message);
      testResults.workerProfile = { accessible: false, error: error.message };
    }
    
    try {
      const verificationResult = await query('SELECT COUNT(*) as count FROM "Verification"');
      console.log('✅ Verification table accessible');
      testResults.verification = { accessible: true, count: verificationResult.rows[0].count };
    } catch (error: any) {
      console.log('⚠️  Verification table test failed:', error.message);
      testResults.verification = { accessible: false, error: error.message };
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema update completed',
      results,
      testResults
    });
    
  } catch (error: any) {
    console.error('💥 Schema update failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
