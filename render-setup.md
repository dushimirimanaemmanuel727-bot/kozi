# Render Database Setup Instructions

## Quick Fix for Database Issues

### 1. Check if Database is Empty
In Render PostgreSQL dashboard, run this query:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### 2. If Database is Empty, Run Schema Setup

#### Option A: Use Render Console
1. Go to your PostgreSQL service in Render
2. Click on "Console" 
3. Copy and paste the entire content of `database-schema.sql`
4. Execute it

#### Option B: Connect via psql
```bash
psql "postgresql://postgres:YOUR_PASSWORD@YOUR_DB_HOST:5432/kazi_home" -f database-schema.sql
```

### 3. Verify Tables Exist
```sql
SELECT COUNT(*) FROM "User";
```

### 4. Create Superadmin if Needed
```sql
INSERT INTO "User" (
    id,
    name,
    phone,
    email,
    role,
    district,
    languages,
    passwordhash,
    suspended,
    createdat,
    updatedat
) VALUES (
    gen_random_uuid(),
    'Super Admin',
    '0750000001',
    'admin@kazihome.com',
    'admin',
    'Kigali',
    '["en", "rw", "fr"]',
    '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ',
    false,
    NOW(),
    NOW()
) ON CONFLICT (phone) DO NOTHING;
```

### 5. Test Connection
After setup, test: https://kozi.onrender.com/api/health
