import { apiFetch } from "../../lib/api/client";
import type {
  CreateReportPayload,
  Report,
  ReportPriority,
} from "../../types/report";

export interface TechnicianOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function createReport(
  accessToken: string,
  payload: CreateReportPayload,
) {
  if (payload.image) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('severity', payload.severity);
    formData.append('latitude', String(payload.latitude));
    formData.append('longitude', String(payload.longitude));
    formData.append('failureType', payload.failureType ?? 'OTHER');
    if (payload.address) formData.append('address', payload.address);
    formData.append('image', payload.image);

    return apiFetch<Report>('/reports', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
  }

  return apiFetch<Report>("/reports", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      latitude: payload.latitude,
      longitude: payload.longitude,
      failureType: payload.failureType,
      address: payload.address,
    }),
  });
}

export function getReports() {
  return apiFetch<Report[]>("/reports");
}
export function getMyReports(accessToken: string) {
  return apiFetch<Report[]>('/reports/mine', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function getAvailableTechnicians(accessToken: string) {
  return apiFetch<TechnicianOption[]>('/users/technicians', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function validateReport(
  accessToken: string,
  reportId: string,
  payload: {
    approved: boolean;
    priority?: ReportPriority;
  },
) {
  return apiFetch<Report>(`/reports/${reportId}/validation`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function assignReportTechnician(
  accessToken: string,
  reportId: string,
  payload: {
    technicianId: string;
    priority?: ReportPriority;
  },
) {
  return apiFetch<Report>(`/reports/${reportId}/assignment`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateTechnicalWork(
  accessToken: string,
  reportId: string,
  payload: {
    status: 'IN_PROGRESS' | 'RESOLVED';
  },
) {
  return apiFetch<Report>(`/reports/${reportId}/work`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function addReportEvidence(
  accessToken: string,
  reportId: string,
  image: File,
  note?: string,
) {
  const formData = new FormData();

  formData.append('image', image);

  if (note?.trim()) {
    formData.append('note', note.trim());
  }

  return apiFetch<NonNullable<Report['evidence']>[number]>(
    `/reports/${reportId}/evidence`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    },
  );
}
