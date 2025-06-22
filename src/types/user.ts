export type UserRole = 'admin' | 'client' | 'intern' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  // Optional fields
  businessName?: string;          // For clients
  phoneVerified?: boolean;        // For interns
  commissionEarned?: number;      // For interns
}


export interface AuthResponse {
  user: User | null;
  error: string | null;
}