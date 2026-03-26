export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'WORKER' | 'EMPLOYER' | 'ADMIN' | 'SUPERADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerProfile {
  userId: string;
  category: string;
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string;
  district?: string;
  languages?: string;
  age?: number;
  gender?: string;
  availability?: string;
  minMonthlyPay?: number;
  profilePhoto?: string;
  cvDocument?: string;
  certificates?: string;
  verificationStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployerProfile {
  userId: string;
  companyName: string;
  industry?: string;
  description?: string;
  website?: string;
  logo?: string;
  address?: string;
  district?: string;
  phone?: string;
  email?: string;
  verificationStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  district?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY';
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string;
  benefits?: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  employerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  coverLetter?: string;
  proposedSalary?: string;
  availability?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  jobId?: string;
  rating: number;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Verification {
  id: string;
  userId: string;
  type: 'WORKER' | 'EMPLOYER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents?: string;
  adminNotes?: string;
  issuedAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Database query result types
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
