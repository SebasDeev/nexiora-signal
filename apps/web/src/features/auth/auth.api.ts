import { apiFetch } from '../../lib/api/client';
import type { AuthSession, LoginPayload } from './types';

export function login(payload: LoginPayload) {
  return apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}