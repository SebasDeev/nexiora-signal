import { useCallback, useEffect, useState } from 'react';

import {
  getTechnicianRequests,
  reviewTechnicianRequest,
} from './account.api';
import type { TechnicianRequest } from './account.api';

export function useTechnicianRequests(
  accessToken?: string,
  enabled = false,
) {
  const [requests, setRequests] = useState<TechnicianRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken || !enabled) {
      setRequests([]);
      setError(null);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getTechnicianRequests(accessToken);
      setRequests(response);
      return response;
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : 'No fue posible cargar las solicitudes técnicas.';
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [accessToken, enabled]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  const review = useCallback(async (
    requestId: string,
    approved: boolean,
    reviewNote?: string,
  ) => {
    if (!accessToken) {
      throw new Error('La sesión no es válida.');
    }
    const updated = await reviewTechnicianRequest(accessToken, requestId, {
      approved,
      reviewNote,
    });
    setRequests((current) => current.map((request) => (
      request.id === requestId ? updated : request
    )));
    return updated;
  }, [accessToken]);

  return { requests, loading, error, refresh, review };
}
