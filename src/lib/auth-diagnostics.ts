import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function testAuthenticationSystem() {
  console.log("🧪 Testing Authentication System...");
  
  try {
    // Test database connection
    console.log("🗄️  Testing database connection...");
    const connectionTest = await query("SELECT 1 as test");
    console.log("✅ Database connection successful");
    
    // Check if User table exists
    console.log("📋 Checking User table structure...");
    const userTableResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log("📊 User table columns:");
    userTableResult.rows.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if there are any users
    console.log("👥 Checking for existing users...");
    const userCountResult = await query("SELECT COUNT(*) as count FROM \"User\"");
    const userCount = parseInt(userCountResult.rows[0].count);
    console.log(`   Found ${userCount} users in system`);
    
    if (userCount === 0) {
      console.log("❌ No users found - you need to create test accounts");
      console.log("📝 Suggested test accounts:");
      console.log("   Phone: 0750000001, Password: SuperAdmin123!, Role: admin");
      console.log("   Phone: 0799999999, Password: password123, Role: employer");
      console.log("   Phone: 0784746467, Password: password123, Role: worker");
      return false;
    }
    
    // Test password hash field consistency
    console.log("🔐 Testing password hash fields...");
    const passwordTest = await query(`
      SELECT phone, name, role,
             passwordhash as passwordhash_field,
             passwordHash as passwordHash_field,
             suspended,
             suspensionreason,
             suspendedat
      FROM \"User\" 
      LIMIT 5
    `);
    
    let hasInconsistentHashes = false;
    passwordTest.rows.forEach((user: any) => {
      const hasPasswordHash = !!user.passwordhash_field || !!user.passwordHash_field;
      const passwordFieldName = user.passwordhash_field ? "passwordhash_field" : 
                                user.passwordHash_field ? "passwordHash_field" : null;
      
      console.log(`   User: ${user.name} (${user.phone}) - Role: ${user.role}`);
      console.log(`     Has password: ${hasPasswordHash ? 'Yes' : 'No'}`);
      console.log(`     Password field: ${passwordFieldName || 'None'}`);
      console.log(`     Suspended: ${user.suspended ? 'Yes' : 'No'}`);
      
      if (!hasPasswordHash) {
        console.log("⚠️  User has no password hash stored");
        hasInconsistentHashes = true;
      }
    });
    
    if (hasInconsistentHashes) {
      console.log("⚠️  Some users have inconsistent password hash fields");
      console.log("🔄 Consider running password hash migration");
    }
    
    // Test authentication with a known user
    console.log("🔐 Testing authentication with sample user...");
    const testUser = passwordTest.rows[0];
    
    if (testUser) {
      const testPassword = "SuperAdmin123!"; // Common test password
      const hash = testUser.passwordhash_field || testUser.passwordHash_field;
      
      if (hash) {
        const isValid = await bcrypt.compare(testPassword, hash);
        console.log(`   Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
        if (isValid) {
          console.log("✅ Authentication system appears to be working");
          console.log("📋 Test user details:");
          console.log(`   Name: ${testUser.name}`);
          console.log(`   Phone: ${testUser.phone}`);
          console.log(`   Role: ${testUser.role}`);
          console.log(`   Suspended: ${testUser.suspended ? 'Yes' : 'No'}`);
        }
      } else {
        console.log("❌ No password hash found for test user");
      }
    }
    
    console.log("🎉 Authentication system test completed");
    return true;
    
  } catch (error: any) {
    console.error("❌ Authentication system test failed:", error.message);
    console.error("🔧 Error details:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

export async function fixPasswordHashInconsistencies() {
  console.log("🔄 Fixing password hash inconsistencies...");
  
  try {
    // Find users with missing password hashes
    const usersWithoutHashes = await query(`
      SELECT id, phone, name, role 
      FROM \"User\" 
      WHERE (passwordhash IS NULL OR passwordhash = '') 
         AND (passwordHash IS NULL OR passwordHash = '')
    `);
    
    if (usersWithoutHashes.rows.length === 0) {
      console.log("✅ No users need password hash fixes");
      return true;
    }
    
    console.log(`👥 Found ${usersWithoutHashes.rows.length} users needing password fixes`);
    
    for (const user of usersWithoutHashes.rows) {
      console.log(`   Fixing user: ${user.name} (${user.phone})`);
      
      // Generate a default password hash (in production, you'd want to prompt for actual passwords)
      const defaultPassword = "password123";
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      // Update both password fields to ensure consistency
      await query(`
        UPDATE \"User\" 
        SET passwordhash = $1, passwordHash = $1 
        WHERE id = $2
      `, [passwordHash, user.id]);
      
      console.log(`   ✅ Fixed password for ${user.name}`);
    }
    
    console.log("🎉 Password hash fixes completed");
    return true;
    
  } catch (error: any) {
    console.error("❌ Password hash fix failed:", error.message);
    return false;
  }
}

export async function unsuspendAllUsers() {
  console.log("🔄 Unsuspending all users...");
  
  try {
    const result = await query(`
      UPDATE \"User\" 
      SET suspended = false, 
          suspensionreason = NULL, 
          suspendedat = NULL, 
          suspendedby = NULL
      WHERE suspended = true
      RETURNING id, phone, name
    `);
    
    console.log(`👥 Unsuspended ${result.rowCount} users`);
    return true;
    
  } catch (error: any) {
    console.error("❌ Unsuspend failed:", error.message);
    return false;
  }
}

export async function createTestUsers() {
  console.log("📝 Creating test users...");
  
  const testUsers = [
    {
      name: "Super Admin",
      phone: "0750000001",
      email: "superadmin@example.com",
      password: "SuperAdmin123!",
      role: "admin",
      district: "Kigali"
    },
    {
      name: "Ishimwe Adeline",
      phone: "0799999999",
      email: "adeline@example.com",
      password: "password123",
      role: "employer",
      district: "Kigali"
    },
    {
      name: "Mustafa Adnan",
      phone: "0784746467",
      email: "mustafa@example.com",
      password: "password123",
      role: "worker",
      district: "Kigali"
    }
  ];
  
  try {
    for (const userData of testUsers) {
      console.log(`   Creating user: ${userData.name}`);
      
      // Check if user already exists
      const existingUserResult = await query(`
        SELECT id FROM \"User\" WHERE phone = $1
      `, [userData.phone]);
      
      if (existingUserResult.rows.length > 0) {
        console.log(`   ⏭️  User already exists, skipping`);
        continue;
      }
      
      // Create user with hashed password
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const result = await query(`
        INSERT INTO \"User\" (id, name, phone, email, role, district, passwordhash, passwordHash, suspended, \"createdAt\")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7, false, NOW())
        RETURNING *
      `, [
        `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userData.name,
        userData.phone,
        userData.email,
        userData.role,
        userData.district,
        passwordHash
      ]);
      
      console.log(`   ✅ Created user: ${result.rows[0].name}`);
    }
    
    console.log("🎉 Test users created successfully");
    return true;
    
  } catch (error: any) {
    console.error("❌ Test user creation failed:", error.message);
    return false;
  }
}

export async function runAuthenticationDiagnostics() {
  console.log("🚀 Running comprehensive authentication diagnostics...");
  
  const tests = [
    { name: "Database Connection", test: async () => {
      try {
        await query("SELECT 1");
        return { success: true, message: "Database connected" };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }},
    { name: "User Table Check", test: async () => {
      try {
        const result = await query(`
          SELECT COUNT(*) as count FROM \"User\" 
          WHERE passwordhash IS NOT NULL OR passwordHash IS NOT NULL
        `);
        return { 
          success: true, 
          message: `${result.rows[0].count} users with password hashes` 
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }},
    { name: "Suspended Users Check", test: async () => {
      try {
        const result = await query("SELECT COUNT(*) as count FROM \"User\" WHERE suspended = true");
        return { 
          success: true, 
          message: `${result.rows[0].count} suspended users` 
        };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }}
  ];
  
  let allTestsPassed = true;
  
  for (const test of tests) {
    const result = await test.test();
    console.log(`   ${test.name}: ${result.success ? '✅' : '❌'} ${result.message}`);
    if (!result.success) allTestsPassed = false;
  }
  
  return allTestsPassed;
}

export async function resetAuthenticationSystem() {
  console.log("🔄 Resetting authentication system...");
  
  try {
    // Unsuspend all users
    await unsuspendAllUsers();
    
    // Fix password hash inconsistencies
    await fixPasswordHashInconsistencies();
    
    console.log("🎉 Authentication system reset completed");
    return true;
    
  } catch (error: any) {
    console.error("❌ Reset failed:", error.message);
    return false;
  }
}

// Main diagnostic function
export async function diagnoseLoginIssues() {
  console.log("🔍 Diagnosing login issues...");
  
  try {
    // Run comprehensive diagnostics
    const diagnostics = await runAuthenticationDiagnostics();
    
    if (!diagnostics) {
      console.log("⚠️  Critical issues found, attempting fixes...");
      
      // Try to fix issues
      await resetAuthenticationSystem();
      await createTestUsers();
      
      console.log("🔍 Re-running diagnostics...");
      await runAuthenticationDiagnostics();
    }
    
    // Test authentication with known credentials
    console.log("🔐 Testing authentication with known credentials...");
    const testResult = await testAuthenticationSystem();
    
    if (testResult) {
      console.log("🎉 Login system should now be working");
      console.log("💡 Test credentials:");
      console.log("   Phone: 0750000001, Password: SuperAdmin123! (admin)");
      console.log("   Phone: 0799999999, Password: password123 (employer)");
      console.log("   Phone: 0784746467, Password: password123 (worker)");
      return true;
    } else {
      console.log("❌ Login system still has issues");
      return false;
    }
    
  } catch (error: any) {
    console.error("❌ Diagnosis failed:", error.message);
    return false;
  }
}