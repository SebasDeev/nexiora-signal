export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CreateReportPayload {
  title: string;
  description: string;
  severity: Severity;
  latitude: number;
  longitude: number;
}

export interface ReportUser {
  firstName: string;
  lastName: string;
}

export interface Report extends CreateReportPayload {
  id: string;
  status: 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED';
  userId: string;
  createdAt: string;
  updatedAt: string;

  user: ReportUser;
}