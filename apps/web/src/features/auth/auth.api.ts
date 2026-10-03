import { apiFetch } from '@/lib/api/client';
import type { AuthSession, LoginPayload } from './types';

export function login(payload: LoginPayload) {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: payload.identifier,
      password: payload.password,
    }),
  });
}

export function getCurrentUser(accessToken: string) {
  return apiFetch<AuthSession['user']>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function register(payload: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}