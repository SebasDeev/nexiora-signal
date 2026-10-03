import { useCallback, useEffect, useState } from 'react';

import { getCurrentUser, login } from '@/features/auth/auth.api';
import {
  clearSession,
  getStoredSession,
  saveSession,
} from '@/features/auth/auth-storage';

import type {
  AuthSession,
  LoginPayload,
} from '@/features/auth/types';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    return getStoredSession();
  });

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    let cancelled = false;

    getCurrentUser(session.accessToken)
      .then((user) => {
        if (cancelled) return;

        const updatedSession: AuthSession = {
          accessToken: session.accessToken,
          user,
        };

        setSession(updatedSession);
        saveSession(updatedSession);
      })
      .catch(() => {
        if (cancelled) return;

        clearSession();
        setSession(null);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const authenticatedSession = await login(payload);

      saveSession(authenticatedSession);
      setSession(authenticatedSession);

      return authenticatedSession;
    },
    [],
  );

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return {
    session,
    signIn,
    signOut,
  };
}