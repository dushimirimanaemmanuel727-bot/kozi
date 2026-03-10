-- Kazi Home Database Schema
-- PostgreSQL database schema for the job marketplace application

-- Create the database (if not exists)
CREATE DATABASE kazi_home;

-- Connect to the database
\c kazi_home;

-- User table for authentication and user management
CREATE TABLE "User" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('worker', 'employer', 'admin', 'superadmin')),
    district VARCHAR(100),
    languages TEXT[],
    passwordHash VARCHAR(255),
    suspended BOOLEAN DEFAULT false,
    suspensionReason TEXT,
    suspendedAt TIMESTAMP,
    suspendedBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job table for job listings
CREATE TABLE "Job" (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    employerId VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    salaryRange VARCHAR(100),
    requirements TEXT[],
    skills TEXT[],
    experienceLevel VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'filled')),
    applicationDeadline DATE,
    publishedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP
);

-- Application table for job applications
CREATE TABLE "Application" (
    id VARCHAR(255) PRIMARY KEY,
    jobId VARCHAR(255) NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
    workerId VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    coverLetter TEXT,
    expectedSalary VARCHAR(100),
    availabilityDate DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    employerNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jobId, workerId)
);

-- Review table for job reviews
CREATE TABLE "Review" (
    id VARCHAR(255) PRIMARY KEY,
    jobId VARCHAR(255) NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE,
    reviewerId VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    revieweeId VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reviewType VARCHAR(20) NOT NULL CHECK (reviewType IN ('employer_to_worker', 'worker_to_employer')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(jobId, reviewerId, revieweeId)
);

-- Notification table for user notifications
CREATE TABLE "Notification" (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    relatedId VARCHAR(255),
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresAt TIMESTAMP
);

-- EmployerProfile table for employer-specific information
CREATE TABLE "EmployerProfile" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "companyName" VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    industry VARCHAR(100),
    "companySize" VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "logoUrl" VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WorkerProfile table for worker-specific information
CREATE TABLE "WorkerProfile" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    category VARCHAR(100) DEFAULT 'GENERAL',
    skills TEXT,
    "experienceYears" INTEGER DEFAULT 0,
    availability VARCHAR(50) DEFAULT 'FULL_TIME',
    "minMonthlyPay" DECIMAL(10,2),
    "liveIn" BOOLEAN DEFAULT false,
    bio TEXT,
    "nationalId" VARCHAR(255),
    "passportNumber" VARCHAR(255),
    photoUrl VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "viewCount" INTEGER DEFAULT 0,
    age INTEGER,
    gender VARCHAR(20),
    "passportUrl" VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification table for user verification status
CREATE TABLE "Verification" (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    "documentUrl" VARCHAR(255),
    "reviewNotes" TEXT,
    "reviewedBy" VARCHAR(255) REFERENCES "User"(id),
    "issuedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_user_phone ON "User"(phone);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_job_employer ON "Job"(employerId);
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_application_job ON "Application"(jobId);
CREATE INDEX idx_application_worker ON "Application"(workerId);
CREATE INDEX idx_application_status ON "Application"(status);
CREATE INDEX idx_review_job ON "Review"(jobId);
CREATE INDEX idx_notification_user ON "Notification"(userId);
CREATE INDEX idx_notification_read ON "Notification"(isRead);
CREATE INDEX idx_employer_profile_user ON "EmployerProfile"("userId");
CREATE INDEX idx_worker_profile_user ON "WorkerProfile"("userId");
CREATE INDEX idx_verification_user ON "Verification"("userId");
CREATE INDEX idx_verification_status ON "Verification"(status);

-- Insert default admin user (password: admin123)
INSERT INTO "User" (id, name, phone, email, role, passwordHash, createdAt) VALUES 
('admin_1', 'System Administrator', '1234567890', 'admin@kazi-home.com', 'admin', 
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', CURRENT_TIMESTAMP);

-- Insert sample data for testing
INSERT INTO "User" (id, name, phone, email, role, passwordHash, district, languages, createdAt) VALUES 
('worker_1', 'John Worker', '0701234567', 'john@worker.com', 'worker', 
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kigali', '{Kinyarwanda, English}', CURRENT_TIMESTAMP),
('employer_1', 'Jane Employer', '0709876543', 'jane@employer.com', 'employer', 
 '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kigali', '{English}', CURRENT_TIMESTAMP);

INSERT INTO "Job" (id, title, description, employerId, category, location, salaryRange, requirements, skills, experienceLevel, status, applicationDeadline, publishedAt) VALUES 
('job_1', 'Software Developer', 'We are looking for an experienced software developer...', 'employer_1', 'IT/Software', 'Kigali', 'RWF 500,000 - 800,000', '{Bachelor degree, 3+ years experience}', '{JavaScript, TypeScript, React}', 'Mid-level', 'active', '2026-04-30', CURRENT_TIMESTAMP),
('job_2', 'Construction Worker', 'Construction project requiring skilled workers...', 'employer_1', 'Construction', 'Kigali', 'RWF 300,000 - 500,000', '{Construction experience}', '{Masonry, Carpentry}', 'Entry-level', 'active', '2026-04-15', CURRENT_TIMESTAMP);

INSERT INTO "Application" (id, jobId, workerId, coverLetter, expectedSalary, availabilityDate, status, createdAt) VALUES 
('app_1', 'job_1', 'worker_1', 'I am an experienced software developer...', 'RWF 600,000', '2026-03-15', 'pending', CURRENT_TIMESTAMP);

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;