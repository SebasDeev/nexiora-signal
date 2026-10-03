import { apiFetch } from '@/lib/api/client';
import type { AuthUser } from '@/features/auth/types';

export type ManagedUser = AuthUser & {
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManagedUserRole =
  | 'CITIZEN'
  | 'LEADER'
  | 'TECHNICIAN';

export interface CreateManagedUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role?: ManagedUserRole;
}

export interface UpdateManagedUserPayload {
  role?: ManagedUserRole;
  isActive?: boolean;
}

export function getUsers(
  accessToken: string,
  role?: ManagedUserRole,
) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';

  return apiFetch<ManagedUser[]>(`/users${query}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function createManagedUser(
  accessToken: string,
  payload: CreateManagedUserPayload,
) {
  return apiFetch<ManagedUser>('/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateManagedUser(
  accessToken: string,
  userId: string,
  payload: UpdateManagedUserPayload,
) {
  return apiFetch<ManagedUser>(`/users/${userId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteManagedUser(
  accessToken: string,
  userId: string,
) {
  return apiFetch<{ id: string }>(`/users/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}