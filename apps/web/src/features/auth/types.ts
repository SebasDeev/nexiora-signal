import type { UserRole } from '@nexiora/types';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}