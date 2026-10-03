import { useCallback, useEffect, useState } from 'react';

import {
  addReportEvidence,
  assignReportTechnician,
  createReport,
  getReports,
  updateTechnicalWork,
  validateReport,
} from '@/features/reports/reports.api';
import type {
  CreateReportPayload,
  Report,
  ReportPriority,
} from '@/types/report';

const REPORTS_POLLING_INTERVAL = 30_000;

export function useReports(token?: string) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadReports = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const data = await getReports();
      setReports(data);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar los reportes.',
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadReports();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        void loadReports(true);
      }
    }, REPORTS_POLLING_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [loadReports]);

  const replaceReport = useCallback((updatedReport: Report) => {
    setReports((currentReports) =>
      currentReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report,
      ),
    );
  }, []);

  const runAction = useCallback(async <T,>(action: () => Promise<T>) => {
    if (!token) {
      throw new Error('No existe una sesión activa.');
    }

    setActionLoading(true);
    setActionError(null);

    try {
      return await action();
    } catch (actionFailure) {
      const message =
        actionFailure instanceof Error
          ? actionFailure.message
          : 'No fue posible actualizar el reporte.';

      setActionError(message);
      throw actionFailure;
    } finally {
      setActionLoading(false);
    }
  }, [token]);

  const addReport = useCallback(async (payload: CreateReportPayload) => {
    if (!token) {
      throw new Error('No existe una sesión activa.');
    }

    const createdReport = await createReport(token, payload);
    setReports((currentReports) => [createdReport, ...currentReports]);

    return createdReport;
  }, [token]);

  const validate = useCallback(
    async (
      reportId: string,
      approved: boolean,
      priority?: ReportPriority,
    ) => {
      return runAction(async () => {
        const updatedReport = await validateReport(token!, reportId, {
          approved,
          priority,
        });
        replaceReport(updatedReport);
        return updatedReport;
      });
    },
    [replaceReport, runAction, token],
  );

  const assignTechnician = useCallback(
    async (
      reportId: string,
      technicianId: string,
      priority?: ReportPriority,
    ) => {
      return runAction(async () => {
        const updatedReport = await assignReportTechnician(token!, reportId, {
          technicianId,
          priority,
        });
        replaceReport(updatedReport);
        return updatedReport;
      });
    },
    [replaceReport, runAction, token],
  );

  const updateWork = useCallback(
    async (reportId: string, status: 'IN_PROGRESS' | 'RESOLVED') => {
      return runAction(async () => {
        const updatedReport = await updateTechnicalWork(token!, reportId, {
          status,
        });
        replaceReport(updatedReport);
        return updatedReport;
      });
    },
    [replaceReport, runAction, token],
  );

  const uploadEvidence = useCallback(
    async (reportId: string, image: File, note?: string) => {
      return runAction(async () => {
        const evidence = await addReportEvidence(token!, reportId, image, note);

        setReports((currentReports) =>
          currentReports.map((report) =>
            report.id === reportId
              ? {
                  ...report,
                  evidence: [evidence, ...(report.evidence ?? [])],
                }
              : report,
          ),
        );

        return evidence;
      });
    },
    [runAction, token],
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
    addReport,
    validate,
    assignTechnician,
    updateWork,
    uploadEvidence,
    clearActionError,
  };
}
