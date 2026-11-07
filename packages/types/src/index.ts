export const USER_ROLES = ['CITIZEN', 'LEADER', 'TECHNICIAN', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REPORT_STATUSES = [
  'PENDING',
  'VERIFIED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type ReportPriority = (typeof REPORT_PRIORITIES)[number];

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const CITIZEN_BADGES = [
  {
    id: 'NEXOER',
    name: 'Nexoer',
    level: 1,
    requiredReports: 20,
  },
  {
    id: 'NEXMASTER',
    name: 'Nexmaster',
    level: 2,
    requiredReports: 60,
  },
  {
    id: 'NEXPRO',
    name: 'Nexpro',
    level: 3,
    requiredReports: 120,
  },
] as const;

export type CitizenBadgeId = (typeof CITIZEN_BADGES)[number]['id'];

export interface CitizenBadgeProgress {
  id: CitizenBadgeId;
  name: string;
  level: number;
  requiredReports: number;
  unlocked: boolean;
}

export interface CitizenReportProgress {
  reportCount: number;
  stars: number;
  progressToNext: number;
  currentBadge: CitizenBadgeProgress | null;
  nextBadge: CitizenBadgeProgress | null;
  badges: CitizenBadgeProgress[];
}

export const FAILURE_TYPES = [
  'POWER_OFF',
  'YELLOW_FLASHING',
  'RED_STUCK',
  'GREEN_STUCK',
  'DAMAGED',
  'ACCIDENT',
  'POTHOLE',
  'ROADWORK',
  'CONGESTION',
  'OTHER',
] as const;
export type FailureType = (typeof FAILURE_TYPES)[number];

export interface ReportUser {
  id?: string;
  firstName: string;
  lastName: string;
}

export interface ReportEvidence {
  id: string;
  imageUrl: string;
  note: string | null;
  createdAt: string;
  uploadedBy?: ReportUser | null;
}

/** Public API representation of a report. */
export interface Report {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  priority: ReportPriority;
  status: ReportStatus;
  reportCode: string | null;
  imageUrl: string | null;
  address: string | null;
  failureType: FailureType | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: ReportUser;
  assignedTechnicianId: string | null;
  assignedTechnician?: ReportUser | null;
  evidence?: ReportEvidence[];
}

/** Legacy-compatible API fields required to create a report. */
export interface CreateReportInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  address?: string;
  failureType?: FailureType;
}
