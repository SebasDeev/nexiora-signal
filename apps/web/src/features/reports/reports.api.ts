import { apiFetch } from '../../lib/api/client';
import type { CreateReportPayload, Report } from '../../types/report';

export function createReport(
  accessToken: string,
  payload: CreateReportPayload,
) {
  return apiFetch<Report>('/reports', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function getReports() {
  return apiFetch<Report[]>('/reports');
}