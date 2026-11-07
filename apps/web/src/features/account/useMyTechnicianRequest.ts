import { useCallback, useEffect, useState } from 'react';

import {
  cancelMyTechnicianRequest,
  createTechnicianRequest,
  getMyTechnicianRequest,
} from './account.api';
import type {
  CreateTechnicianRequestPayload,
  TechnicianRequest,
} from './account.api';

export function useMyTechnicianRequest(
  accessToken?: string,
  enabled = false,
) {
  const [request, setRequest] = useState<TechnicianRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken || !enabled) {
      setRequest(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getMyTechnicianRequest(accessToken);
      setRequest(response);
      return response;
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : 'No fue posible consultar el estado de tu solicitud.';
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  const submit = useCallback(async (payload: CreateTechnicianRequestPayload) => {
    if (!accessToken) {
      throw new Error('La sesión no es válida.');
    }
    const created = await createTechnicianRequest(accessToken, payload);
    setRequest(created);
    return created;
  }, [accessToken]);

  const cancel = useCallback(async () => {
    if (!accessToken) {
      throw new Error('La sesión no es válida.');
    }
    const cancelled = await cancelMyTechnicianRequest(accessToken);
    setRequest(cancelled);
    return cancelled;
  }, [accessToken]);

  return {
    request,
    loading,
    error,
    refresh,
    submit,
    cancel,
  };
}
