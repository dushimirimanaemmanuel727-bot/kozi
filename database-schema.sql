-- Database Schema for Kazi Home Application
-- Created: 2026-03-12

-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "WorkerProfile" CASCADE;
DROP TABLE IF EXISTS "Job" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Users table
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
    passwordHash VARCHAR(255),
    suspended BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worker profiles table
CREATE TABLE "WorkerProfile" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    category VARCHAR(100),
    skills TEXT,
    experienceYears INTEGER,
    availability TEXT,
    minMonthlyPay DECIMAL(10,2),
    bio TEXT,
    photoUrl TEXT,
    nationalId TEXT,
    location VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE "Job" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    payType VARCHAR(20) CHECK (payType IN ('monthly', 'daily', 'hourly', 'contract')),
    payAmount DECIMAL(10,2) NOT NULL,
    employerId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE "Application" (
    id SERIAL PRIMARY KEY,
    jobId INTEGER NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
    workerId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    appliedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jobId, workerId)
);

-- Reviews table
CREATE TABLE "Review" (
    id SERIAL PRIMARY KEY,
    reviewerId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    revieweeId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    jobId INTEGER REFERENCES "Job"(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK(reviewerId != revieweeId)
);

-- Notifications table
CREATE TABLE "Notification" (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    relatedId INTEGER,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_phone ON "User"(phone);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_job_employer_id ON "Job"("employerId");
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_application_job_id ON "Application"("jobId");
CREATE INDEX idx_application_worker_id ON "Application"("workerId");
CREATE INDEX idx_application_status ON "Application"(status);
CREATE INDEX idx_notification_user_id ON "Notification"("userId");
CREATE INDEX idx_notification_read ON "Notification"(read);

-- Create a default admin user (password: admin123)
INSERT INTO "User" (phone, name, role, passwordHash) 
VALUES ('+250000000000', 'System Admin', 'admin', '$2a$10$rQZ8kHKMJTQpQzJQZQZQZJuQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ');

-- Create trigger to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_profile_updated_at BEFORE UPDATE ON "WorkerProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_updated_at BEFORE UPDATE ON "Job" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_updated_at BEFORE UPDATE ON "Application" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
