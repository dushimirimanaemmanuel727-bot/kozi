import { query, transaction } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  district?: string;
  languages?: string;
  passwordHash?: string;
  suspended: boolean;
  suspensionreason?: string;
  suspendedat?: Date;
  suspendedby?: string;
  createdat: Date;
}

export interface CreateUserData {
  name: string;
  phone: string;
  email?: string;
  role: string;
  district?: string;
  languages?: string;
  password?: string;
}

// Find user by phone
export async function findUserByPhone(phone: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE phone = $1', [phone]);
  return result.rows[0] || null;
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Create new user
export async function createUser(userData: CreateUserData): Promise<User> {
  const { name, phone, email, role, district, languages = [], password } = userData;
  
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  
  const result = await query(
    `INSERT INTO "User" (
      id, name, phone, email, role, district, languages, 
      "passwordHash", suspended, createdAt
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [id, name, phone, email, role, district, languages, passwordHash, false, new Date()]
  );
  
  return result.rows[0];
}

// Verify password for authentication
export async function verifyPassword(phone: string, password: string): Promise<User | null> {
  const user = await findUserByPhone(phone);
  
  if (!user || !user.passwordHash) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? user : null;
}

// Update user
export async function updateUser(id: string, updates: Partial<CreateUserData>): Promise<User | null> {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);
  
  const result = await query(
    `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

// Delete user
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query('DELETE FROM "User" WHERE id = $1', [id]);
  return result.rowCount > 0;
}

// Get all users with pagination
export async function getUsers(limit = 50, offset = 0): Promise<User[]> {
  const result = await query(
    'SELECT * FROM "User" ORDER BY createdAt DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows;
}

// Count total users
export async function countUsers(): Promise<number> {
  const result = await query('SELECT COUNT(*) as count FROM "User"');
  return parseInt(result.rows[0].count);
}

// Suspend user
export async function suspendUser(
  id: string, 
  reason: string, 
  suspendedBy: string
): Promise<User | null> {
  const result = await query(
    `UPDATE "User" 
     SET suspended = true, suspensionReason = $1, suspendedAt = $2, suspendedBy = $3
     WHERE id = $4 RETURNING *`,
    [reason, new Date(), suspendedBy, id]
  );
  
  return result.rows[0] || null;
}

// Unsuspend user
export async function unsuspendUser(id: string): Promise<User | null> {
  const result = await query(
    `UPDATE "User" 
     SET suspended = false, suspensionReason = NULL, suspendedAt = NULL, suspendedBy = NULL
     WHERE id = $1 RETURNING *`,
    [id]
  );
  
  return result.rows[0] || null;
}
