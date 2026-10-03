import { useCallback, useEffect, useState } from 'react';
import { getMyReports } from '@/features/reports/reports.api';
import type { Report } from '@/types/report';

export function useMyReports(token?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    if (!token) {
      setReports([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);

      const data = await getMyReports(token);

      setReports(data);
      setError(null);
    } catch {
      setError('No fue posible cargar tus reportes.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  return {
    reports,
    loading,
    error,
    refresh: loadReports,
  };
}
