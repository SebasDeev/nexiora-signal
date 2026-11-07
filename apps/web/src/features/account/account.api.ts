import { apiFetch } from '@/lib/api/client';
import type { AuthSession, AuthUser } from '@/features/auth/types';
import type { CitizenReportProgress } from '@nexiora/types';

export type TechnicianRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TechnicianRequestPerson {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  phone?: string | null;
}

export interface TechnicianRequest {
  id: string;
  experience: string;
  motivation: string | null;
  status: TechnicianRequestStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  reviewerId: string | null;
  user?: TechnicianRequestPerson;
  reviewer?: TechnicianRequestPerson | null;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface CreateTechnicianRequestPayload {
  experience: string;
  motivation?: string;
}

function authorization(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export function updateProfile(
  accessToken: string,
  payload: UpdateProfilePayload,
) {
  return apiFetch<AuthUser>('/users/me', {
    method: 'PATCH',
    headers: authorization(accessToken),
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  accessToken: string,
  payload: ChangePasswordPayload,
) {
  return apiFetch<AuthSession>('/auth/password', {
    method: 'POST',
    headers: authorization(accessToken),
    body: JSON.stringify(payload),
  });
}

export function getCitizenProgress(accessToken: string) {
  return apiFetch<CitizenReportProgress>('/users/me/progress', {
    method: 'GET',
    headers: authorization(accessToken),
  });
}

export function getMyTechnicianRequest(accessToken: string) {
  return apiFetch<TechnicianRequest | null>('/users/me/technician-request', {
    method: 'GET',
    headers: authorization(accessToken),
  });
}

export function createTechnicianRequest(
  accessToken: string,
  payload: CreateTechnicianRequestPayload,
) {
  return apiFetch<TechnicianRequest>('/users/me/technician-request', {
    method: 'POST',
    headers: authorization(accessToken),
    body: JSON.stringify(payload),
  });
}

export function cancelMyTechnicianRequest(accessToken: string) {
  return apiFetch<TechnicianRequest>('/users/me/technician-request/cancel', {
    method: 'PATCH',
    headers: authorization(accessToken),
  });
}

export function getTechnicianRequests(accessToken: string) {
  return apiFetch<TechnicianRequest[]>('/users/technician-requests', {
    method: 'GET',
    headers: authorization(accessToken),
  });
}

export function reviewTechnicianRequest(
  accessToken: string,
  requestId: string,
  payload: { approved: boolean; reviewNote?: string },
) {
  return apiFetch<TechnicianRequest>(`/users/technician-requests/${requestId}`, {
    method: 'PATCH',
    headers: authorization(accessToken),
    body: JSON.stringify(payload),
  });
}
