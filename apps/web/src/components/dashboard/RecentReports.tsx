import type { Report } from '@/types/report';
import {
  getFailureOption,
  STATUS_LABELS,
} from '@/features/reports/report-catalog';

interface RecentReportsProps {
  reports: Report[];
}

function getStatusLabel(status: Report['status']): string {
  switch (status) {
    case 'PENDING':
      return STATUS_LABELS.PENDING;

    case 'VERIFIED':
      return STATUS_LABELS.VERIFIED;

    case 'IN_PROGRESS':
      return STATUS_LABELS.IN_PROGRESS;

    case 'RESOLVED':
      return STATUS_LABELS.RESOLVED;

    case 'REJECTED':
      return 'Rechazado';

    default:
      return 'Estado desconocido';
  }
}

export function RecentReports({
  reports,
}: RecentReportsProps) {
  if (!reports.length) {
    return (
      <p className="control-empty-state">
        Aún no hay reportes para priorizar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const failure = getFailureOption(report.failureType);

        return (
          <div
            key={report.id}
            className="recent-report-item"
          >
            <h3>
              {failure?.icon ?? '📍'}{' '}
              {failure?.label ?? report.title}
            </h3>

            <p>{report.description}</p>

            <div>
              <span
                className={`report-status status-${report.status.toLowerCase()}`}
              >
                {getStatusLabel(report.status)}
              </span>

              <span>
                {report.reportCode ?? 'Sin radicado'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}