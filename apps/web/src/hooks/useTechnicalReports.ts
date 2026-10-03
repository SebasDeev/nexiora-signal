import { useCallback, useEffect, useState } from 'react';
import {
  addReportEvidence,
  getMyReports,
  updateTechnicalWork,
} from '@/features/reports/reports.api';
import type { Report } from '@/types/report';

export function useTechnicalReports(token?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
      setError('No fue posible cargar los reportes asignados.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const updateWork = useCallback(
    async (
      reportId: string,
      status: 'IN_PROGRESS' | 'RESOLVED',
    ) => {
      if (!token) {
        throw new Error('No existe sesión activa.');
      }

      try {
        setActionLoading(true);
        setActionError(null);

        const updatedReport = await updateTechnicalWork(
          token,
          reportId,
          {
            status,
          },
        );

        setReports((current) =>
          current.map((report) =>
            report.id === reportId ? updatedReport : report,
          ),
        );

        return updatedReport;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible actualizar el trabajo técnico.';

        setActionError(message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const uploadEvidence = useCallback(
    async (reportId: string, image: File, note?: string) => {
      if (!token) {
        throw new Error('No existe sesión activa.');
      }

      try {
        setActionLoading(true);
        setActionError(null);

        const evidence = await addReportEvidence(
          token,
          reportId,
          image,
          note,
        );

        setReports((current) =>
          current.map((report) => {
            if (report.id !== reportId) {
              return report;
            }

            return {
              ...report,
              evidence: [
                evidence,
                ...(report.evidence ?? []),
              ],
            };
          }),
        );

        return evidence;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible cargar la evidencia.';

        setActionError(message);
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    reports,
    loading,
    error,
    actionLoading,
    actionError,
    refresh: loadReports,
    updateWork,
    uploadEvidence,
    clearActionError,
  };
}
