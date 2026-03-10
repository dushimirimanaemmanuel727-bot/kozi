-- Create Superadmin Account for Kazi Home
-- This SQL script creates a superadmin user with full privileges

-- First, check if the superadmin already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "User" WHERE phone = '0750000001') THEN
        RAISE NOTICE 'Superadmin with phone 0750000001 already exists';
    ELSE
        -- Insert the superadmin user
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
            createdAt,
            updatedAt
        ) VALUES (
            'admin_super_' || EXTRACT(EPOCH FROM NOW())::TEXT,
            'Super Admin',
            '0750000001',
            'superadmin@kazihome.com',
            'admin',
            'KIGALI',
            ARRAY['English', 'Kinyarwanda'],
            '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LFvO6', -- Password: SuperAdmin123!
            false,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Superadmin created successfully!';
        RAISE NOTICE 'Login Credentials:';
        RAISE NOTICE 'Phone: 0750000001';
        RAISE NOTICE 'Password: SuperAdmin123!';
        RAISE NOTICE 'Role: admin (with superadmin privileges)';
    END IF;
END $$;

-- Verify the superadmin was created
SELECT 
    id,
    name,
    phone,
    email,
    role,
    district,
    suspended,
    createdAt
FROM "User" 
WHERE phone = '0750000001';
