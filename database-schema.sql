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
    passwordhash VARCHAR(255),
    suspended BOOLEAN DEFAULT FALSE,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Worker profiles table
CREATE TABLE "WorkerProfile" (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    category VARCHAR(100),
    skills TEXT,
    experienceyears INTEGER,
    availability TEXT,
    minmonthlypay DECIMAL(10,2),
    bio TEXT,
    photourl TEXT,
    nationalid TEXT,
    location VARCHAR(255),
    age INTEGER,
    gender VARCHAR(10),
    passporturl TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    reviewcount INTEGER DEFAULT 0,
    viewcount INTEGER DEFAULT 0,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE "Job" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    paytype VARCHAR(20) CHECK (paytype IN ('monthly', 'daily', 'hourly', 'contract')),
    payamount DECIMAL(10,2) NOT NULL,
    employerid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    deadline TIMESTAMP,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE "Application" (
    id SERIAL PRIMARY KEY,
    jobid INTEGER NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
    workerid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    appliedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jobid, workerid)
);

-- Reviews table
CREATE TABLE "Review" (
    id SERIAL PRIMARY KEY,
    reviewerid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    revieweeid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    jobid INTEGER REFERENCES "Job"(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK(reviewerid != revieweeid)
);

-- Employer profiles table
CREATE TABLE "EmployerProfile" (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    companyname VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    companysize VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    reviewcount INTEGER DEFAULT 0,
    logourl TEXT,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE "Notification" (
    id SERIAL PRIMARY KEY,
    userid INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    relatedid INTEGER,
    createdat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_phone ON "User"(phone);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_job_employer_id ON "Job"(employerid);
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_application_job_id ON "Application"(jobid);
CREATE INDEX idx_application_worker_id ON "Application"(workerid);
CREATE INDEX idx_application_status ON "Application"(status);
CREATE INDEX idx_notification_user_id ON "Notification"(userid);
CREATE INDEX idx_notification_read ON "Notification"(read);

-- Create a default admin user (password: admin123)
INSERT INTO "User" (phone, name, role, passwordhash) 
VALUES ('+250000000000', 'System Admin', 'admin', '$2a$10$rQZ8kHKMJTQpQzJQZQZQZJuQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ');

-- Create trigger to update updatedat timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_profile_updated_at BEFORE UPDATE ON "WorkerProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_updated_at BEFORE UPDATE ON "Job" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_updated_at BEFORE UPDATE ON "Application" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
