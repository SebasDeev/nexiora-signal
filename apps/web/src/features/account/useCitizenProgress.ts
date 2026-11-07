import { useCallback, useEffect, useState } from 'react';

import { getCitizenProgress } from './account.api';
import type { CitizenReportProgress } from '@nexiora/types';

export function useCitizenProgress(accessToken?: string) {
  const [progress, setProgress] = useState<CitizenReportProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setProgress(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getCitizenProgress(accessToken);
      setProgress(response);
      return response;
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : 'No fue posible consultar tu progreso ciudadano.';
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  return { progress, loading, error, refresh };
}
