import type { CreateReportInput } from '@nexiora/types';

export type {
  FailureType,
  Report,
  ReportPriority,
  ReportStatus,
  ReportUser,
  Severity,
} from '@nexiora/types';

export interface CreateReportPayload extends CreateReportInput {
  image?: File;
}
