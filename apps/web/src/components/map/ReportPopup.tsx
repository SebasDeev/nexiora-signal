import {
  getFailureOption,
  STATUS_LABELS,
} from '@/features/reports/report-catalog';
import { getApiAssetUrl } from '@/lib/api/client';
import type { Report } from '@/types/report';

interface ReportPopupProps {
  report: Report;
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

export function ReportPopup({
  report,
}: ReportPopupProps) {
  const failure = getFailureOption(report.failureType);
  const imageUrl = getApiAssetUrl(report.imageUrl);

  return (
    <article className="report-popup-card">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Evidencia del incidente"
          className="report-popup-image"
        />
      )}

      <div className="report-popup-header">
        <span>{failure?.icon ?? '📍'}</span>

        <div>
          <small>
            {report.reportCode ?? 'Reporte ciudadano'}
          </small>

          <h3>
            {failure?.label ?? report.title}
          </h3>
        </div>
      </div>

      <p className="report-popup-description">
        {report.description}
      </p>

      <dl className="report-popup-details">
        <div>
          <dt>Estado</dt>

          <dd
            className={`report-status status-${report.status.toLowerCase()}`}
          >
            {getStatusLabel(report.status)}
          </dd>
        </div>

        <div>
          <dt>Reportado por</dt>

          <dd>
            {report.user.firstName}{' '}
            {report.user.lastName}
          </dd>
        </div>

        {report.address && (
          <div>
            <dt>Referencia</dt>

            <dd>{report.address}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}