import { useCallback, useEffect, useState } from 'react';

import {
  getAvailableTechnicians,
  type TechnicianOption,
} from '@/features/reports/reports.api';

export function useAvailableTechnicians(accessToken?: string) {
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setTechnicians([]);
      setError(null);
      return;
    }

    setLoading(true);

    try {
      const data = await getAvailableTechnicians(accessToken);
      setTechnicians(data);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar los técnicos disponibles.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { technicians, loading, error, refresh };
}
