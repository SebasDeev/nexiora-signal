import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  RefreshCw,
  Search,
  Upload,
  Wrench,
  X,
} from 'lucide-react';
import type { Report, ReportStatus } from '@/types/report';

interface TechnicalOperationsViewProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
  onRefresh: () => void;
  onUpdateWork: (
    reportId: string,
    status: 'IN_PROGRESS' | 'RESOLVED',
  ) => Promise<unknown>;
  onUploadEvidence: (
    reportId: string,
    image: File,
    note?: string,
  ) => Promise<unknown>;
  onClearActionError: () => void;
}


const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  VERIFIED: 'Verificado',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
  REJECTED: 'Rechazado',
};

const STATUS_ICONS: Record<ReportStatus, typeof Clock3> = {
  PENDING: Clock3,
  VERIFIED: CheckCircle2,
  IN_PROGRESS: Wrench,
  RESOLVED: CheckCircle2,
  REJECTED: AlertTriangle,
};

type Filter = 'ALL' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusClass(status: ReportStatus) {
  return `technical-status technical-status--${status.toLowerCase()}`;
}

function getSeverityLabel(severity: Report['severity']) {
  const labels = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  };

  return labels[severity];
}

function getPriorityLabel(priority: Report['priority']) {
  const labels = {
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
  };

  return labels[priority];
}

export default function TechnicalOperationsView({
  reports,
  loading,
  error,
  actionLoading,
  actionError,
  onRefresh,
  onUpdateWork,
  onUploadEvidence,
  onClearActionError,
}: TechnicalOperationsViewProps) {
const [filter, setFilter] = useState<Filter>('ALL');
const [search, setSearch] = useState('');
const [selectedReport, setSelectedReport] = useState<Report | null>(null);

const [successMessage, setSuccessMessage] = useState<{
  title: string;
  description: string;
} | null>(null);

const [workStatus, setWorkStatus] =
  useState<'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  useEffect(() => {
  if (!successMessage) {
    return;
  }

  const timer = window.setTimeout(() => {
    setSuccessMessage(null);
  }, 3500);

  return () => window.clearTimeout(timer);
}, [successMessage]);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesFilter =
        filter === 'ALL' || report.status === filter;

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        report.reportCode,
        report.title,
        report.description,
        report.address,
        report.failureType,
        report.user.firstName,
        report.user.lastName,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
    });
  }, [reports, filter, search]);

  const counters = useMemo(
    () => ({
      total: reports.length,
      verified: reports.filter((report) => report.status === 'VERIFIED').length,
      progress: reports.filter((report) => report.status === 'IN_PROGRESS').length,
      resolved: reports.filter((report) => report.status === 'RESOLVED').length,
    }),
    [reports],
  );

  function openReport(report: Report) {
    setSelectedReport(report);
    setWorkStatus(
      report.status === 'IN_PROGRESS'
        ? 'RESOLVED'
        : 'IN_PROGRESS',
    );
    setEvidenceFile(null);
    setEvidenceNote('');
    onClearActionError();
  }

  function closeReport() {
    if (actionLoading) {
      return;
    }

    setSelectedReport(null);
    setEvidenceFile(null);
    setEvidenceNote('');
    onClearActionError();
  }

async function handleWorkSubmit() {
  if (!selectedReport) {
    return;
  }

  try {
    const updated = await onUpdateWork(
      selectedReport.id,
      workStatus,
    );

    if (updated && typeof updated === 'object') {
      setSelectedReport(updated as Report);
    }

    if (workStatus === 'IN_PROGRESS') {
      setSuccessMessage({
        title: 'Trabajo iniciado correctamente',
        description:
          'El reporte está ahora en proceso. Gracias por gestionar esta incidencia.',
      });
    } else {
      setSuccessMessage({
        title: 'Gestión finalizada correctamente',
        description:
          'El reporte ha sido marcado como resuelto. Gracias por tu gestión.',
      });
    }
  } catch {
    // El hook expone actionError para mostrar el mensaje.
  }
}

  function handleEvidenceChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setEvidenceFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setEvidenceFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEvidenceFile(null);
      return;
    }

    setEvidenceFile(file);
  }

  async function handleEvidenceSubmit() {
    if (!selectedReport || !evidenceFile) {
      return;
    }

    try {
      const evidence = await onUploadEvidence(
        selectedReport.id,
        evidenceFile,
        evidenceNote,
      );

      if (evidence && typeof evidence === 'object') {
        setSelectedReport((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            evidence: [
              evidence as NonNullable<Report['evidence']>[number],
              ...(current.evidence ?? []),
            ],
          };
        });
      }

      setEvidenceFile(null);
      setEvidenceNote('');
    } catch {
      // El hook expone actionError para mostrar el mensaje.
    }
  }

  if (loading) {
    return (
      <section className="technical-page">
        <div className="technical-header">
          <div>
            <span className="section-eyebrow">OPERACIÓN</span>
            <h1>Operación técnica</h1>
            <p>
              Gestiona las incidencias asignadas y registra el trabajo
              realizado.
            </p>
          </div>
        </div>

        <div className="technical-loading">
          <RefreshCw size={28} className="technical-loading-icon" />
          <strong>Cargando incidencias asignadas...</strong>
          <span>Estamos consultando la información más reciente.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="technical-page">
            {successMessage && (
        <div className="technical-success-toast" role="status" aria-live="polite">
          <div className="technical-success-icon">
            <CheckCircle2 size={20} />
          </div>

          <div className="technical-success-content">
            <strong className="technical-success-title">
              {successMessage.title}
            </strong>

            <p className="technical-success-description">
              {successMessage.description}
            </p>
          </div>

          <button
            type="button"
            className="technical-success-close"
            onClick={() => setSuccessMessage(null)}
            aria-label="Cerrar mensaje"
          >
            <X size={17} />
          </button>
        </div>
      )}
      <div className="technical-header">
        <div>
          <span className="section-eyebrow">OPERACIÓN</span>
          <h1>Operación técnica</h1>
          <p>
            Gestiona las incidencias asignadas y registra el trabajo
            realizado.
          </p>
        </div>

        <button
          type="button"
          className="technical-refresh"
          onClick={onRefresh}
          title="Actualizar incidencias"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="technical-summary">
        <div className="technical-summary-card">
          <div className="technical-summary-icon">
            <Wrench size={19} />
          </div>
          <div>
            <strong>{counters.total}</strong>
            <span>Asignados</span>
          </div>
        </div>

        <div className="technical-summary-card">
          <div className="technical-summary-icon">
            <Clock3 size={19} />
          </div>
          <div>
            <strong>{counters.verified}</strong>
            <span>Por iniciar</span>
          </div>
        </div>

        <div className="technical-summary-card">
          <div className="technical-summary-icon">
            <Wrench size={19} />
          </div>
          <div>
            <strong>{counters.progress}</strong>
            <span>En progreso</span>
          </div>
        </div>

        <div className="technical-summary-card">
          <div className="technical-summary-icon">
            <CheckCircle2 size={19} />
          </div>
          <div>
            <strong>{counters.resolved}</strong>
            <span>Resueltos</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="technical-error">
          <AlertTriangle size={19} />
          <span>{error}</span>
          <button type="button" onClick={onRefresh}>
            Reintentar
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="technical-toolbar">
            <div className="technical-search">
              <Search size={17} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por código, título, ubicación..."
                aria-label="Buscar incidencias"
              />
            </div>

            <div className="technical-filters">
              {[
                { value: 'ALL' as const, label: 'Todas' },
                { value: 'VERIFIED' as const, label: 'Por iniciar' },
                { value: 'IN_PROGRESS' as const, label: 'En progreso' },
                { value: 'RESOLVED' as const, label: 'Resueltas' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={
                    filter === item.value
                      ? 'technical-filter is-active'
                      : 'technical-filter'
                  }
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="technical-list">
              {filteredReports.map((report) => {
                const StatusIcon = STATUS_ICONS[report.status];

                return (
                  <article className="technical-card" key={report.id}>
                    <div className="technical-card-main">
                      <div className="technical-card-top">
                        <span className="technical-code">
                          {report.reportCode ?? 'Sin código'}
                        </span>

                        <span className={getStatusClass(report.status)}>
                          <StatusIcon size={14} />
                          {STATUS_LABELS[report.status]}
                        </span>
                      </div>

                      <h2>{report.title}</h2>

                      <p className="technical-description">
                        {report.description}
                      </p>

                      <div className="technical-meta">
                        {report.address && (
                          <span>
                            <MapPin size={15} />
                            {report.address}
                          </span>
                        )}

                        <span>
                          <CalendarDays size={15} />
                          {formatDate(report.createdAt)}
                        </span>
                      </div>

                      <div className="technical-tags">
                        <span>
                          Severidad: {getSeverityLabel(report.severity)}
                        </span>
                        <span>
                          Prioridad: {getPriorityLabel(report.priority)}
                        </span>
                        <span>
                          Evidencias: {report.evidence?.length ?? 0}
                        </span>
                      </div>
                    </div>

                    {report.imageUrl && (
                      <div className="technical-image">
                        <img
                          src={
                            report.imageUrl.startsWith('http')
                              ? report.imageUrl
                              : `/api${report.imageUrl}`
                          }
                          alt={`Evidencia ${report.reportCode ?? ''}`}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      className="technical-detail-button"
                      onClick={() => openReport(report)}
                    >
                      <span>Gestionar</span>
                      <ChevronRight size={18} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="technical-empty">
              <div className="technical-empty-icon">
                <Wrench size={32} />
              </div>

              <h2>
                {reports.length === 0
                  ? 'No tienes incidencias asignadas'
                  : 'No encontramos incidencias'}
              </h2>

              <p>
                {reports.length === 0
                  ? 'Cuando un reporte sea asignado a tu cuenta aparecerá aquí.'
                  : 'Prueba con otro término o cambia el filtro seleccionado.'}
              </p>
            </div>
          )}
        </>
      )}

      {selectedReport && (
        <div
          className="technical-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReport();
            }
          }}
        >
          <div
            className="technical-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="technical-modal-title"
          >
            <div className="technical-modal-header">
              <div>
                <span className="section-eyebrow">GESTIÓN DE INCIDENCIA</span>
                <h2 id="technical-modal-title">
                  {selectedReport.title}
                </h2>
              </div>

              <button
                type="button"
                className="technical-modal-close"
                onClick={closeReport}
                disabled={actionLoading}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="technical-modal-status">
              {(() => {
                const StatusIcon =
                  STATUS_ICONS[selectedReport.status];

                return (
                  <span className={getStatusClass(selectedReport.status)}>
                    <StatusIcon size={15} />
                    {STATUS_LABELS[selectedReport.status]}
                  </span>
                );
              })()}

              <span className="technical-code">
                {selectedReport.reportCode ?? 'Sin código'}
              </span>
            </div>

            <div className="technical-detail-grid">
              <div>
                <span>Descripción</span>
                <strong>{selectedReport.description}</strong>
              </div>

              <div>
                <span>Ubicación</span>
                <strong>
                  {selectedReport.address ??
                    `${selectedReport.latitude.toFixed(5)}, ${selectedReport.longitude.toFixed(5)}`}
                </strong>
              </div>

              <div>
                <span>Severidad</span>
                <strong>
                  {getSeverityLabel(selectedReport.severity)}
                </strong>
              </div>

              <div>
                <span>Prioridad</span>
                <strong>
                  {getPriorityLabel(selectedReport.priority)}
                </strong>
              </div>

              <div>
                <span>Ciudadano</span>
                <strong>
                  {selectedReport.user.firstName}{' '}
                  {selectedReport.user.lastName}
                </strong>
              </div>

              <div>
                <span>Fecha</span>
                <strong>
                  {formatDate(selectedReport.createdAt)}
                </strong>
              </div>
            </div>

            {selectedReport.imageUrl && (
              <div className="technical-main-evidence">
                <div className="technical-subtitle">
                  Evidencia inicial
                </div>

                <img
                  src={
                    selectedReport.imageUrl.startsWith('http')
                      ? selectedReport.imageUrl
                      : `/api${selectedReport.imageUrl}`
                  }
                  alt="Evidencia inicial"
                />
              </div>
            )}

            <div className="technical-section">
              <div className="technical-section-heading">
                <div>
                  <span className="technical-subtitle">
                    Trabajo técnico
                  </span>
                  <p>
                    Actualiza el estado de la incidencia para que el avance
                    sea visible en todo Nexiora Signal.
                  </p>
                </div>
              </div>

              <div className="technical-work-options">
                <button
                  type="button"
                  className={
                    workStatus === 'IN_PROGRESS'
                      ? 'technical-work-option is-active'
                      : 'technical-work-option'
                  }
                  onClick={() => setWorkStatus('IN_PROGRESS')}
                  disabled={
                    actionLoading ||
                    selectedReport.status === 'IN_PROGRESS'
                  }
                >
                  <Wrench size={17} />
                  <span>
                    <strong>Iniciar trabajo</strong>
                    <small>Marcar como en progreso</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    workStatus === 'RESOLVED'
                      ? 'technical-work-option is-active'
                      : 'technical-work-option'
                  }
                  onClick={() => setWorkStatus('RESOLVED')}
                  disabled={
                    actionLoading ||
                    selectedReport.status === 'RESOLVED'
                  }
                >
                  <CheckCircle2 size={17} />
                  <span>
                    <strong>Finalizar trabajo</strong>
                    <small>Marcar como resuelto</small>
                  </span>
                </button>
              </div>

              <div className="technical-form-footer">
                <span>El estado se actualizará en Reportes y el mapa.</span>

                <button
                  type="button"
                  className="technical-primary-button"
                  onClick={handleWorkSubmit}
                  disabled={
                    actionLoading ||
                    selectedReport.status === workStatus
                  }
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="technical-button-spinner" size={16} />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Actualizar trabajo
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="technical-section">
              <div className="technical-section-heading">
                <div>
                  <span className="technical-subtitle">
                    Evidencia técnica
                  </span>
                  <p>
                    Adjunta una fotografía relacionada con la intervención.
                  </p>
                </div>
              </div>

              <label className="technical-upload">
                <Upload size={20} />

                <span>
                  {evidenceFile
                    ? evidenceFile.name
                    : 'Seleccionar fotografía'}
                </span>

                <small>
                  JPG, PNG, WEBP · máximo 5 MB
                </small>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceChange}
                  disabled={actionLoading}
                />
              </label>

              <textarea
                className="technical-note"
                value={evidenceNote}
                onChange={(event) =>
                  setEvidenceNote(event.target.value)
                }
                placeholder="Nota opcional para esta evidencia..."
                maxLength={1000}
                disabled={actionLoading}
              />

              <div className="technical-form-footer">
                <span>{evidenceNote.length}/1000 caracteres</span>

                <button
                  type="button"
                  className="technical-secondary-button"
                  onClick={handleEvidenceSubmit}
                  disabled={
                    actionLoading ||
                    !evidenceFile
                  }
                >
                  <Upload size={16} />
                  Subir evidencia
                </button>
              </div>
            </div>

            {selectedReport.evidence &&
              selectedReport.evidence.length > 0 && (
                <div className="technical-section">
                  <div className="technical-section-heading">
                    <div>
                      <span className="technical-subtitle">
                        Evidencias registradas
                      </span>
                      <p>
                        Fotografías adjuntadas durante la atención.
                      </p>
                    </div>
                  </div>

                  <div className="technical-evidence-grid">
                    {selectedReport.evidence.map((evidence) => (
                      <div
                        className="technical-evidence-card"
                        key={evidence.id}
                      >
                        <img
                          src={
                            evidence.imageUrl.startsWith('http')
                              ? evidence.imageUrl
                              : `/api${evidence.imageUrl}`
                          }
                          alt="Evidencia técnica"
                        />

                        <div>
                          <strong>
                            {evidence.uploadedBy
                              ? `${evidence.uploadedBy.firstName} ${evidence.uploadedBy.lastName}`
                              : 'Usuario técnico'}
                          </strong>

                          <span>
                            {formatDate(evidence.createdAt)}
                          </span>

                          {evidence.note && (
                            <p>{evidence.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {actionError && (
              <div className="technical-action-error">
                <AlertTriangle size={17} />
                <span>{actionError}</span>
                <button
                  type="button"
                  onClick={onClearActionError}
                >
                  Cerrar
                </button>
              </div>
            )}

            <div className="technical-modal-footer">
              <button
                type="button"
                className="technical-close-button"
                onClick={closeReport}
                disabled={actionLoading}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
