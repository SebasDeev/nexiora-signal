import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileWarning,
  MapPin,
  RefreshCw,
  Search,
  UserCheck,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';

import type { TechnicianOption } from '@/features/reports/reports.api';
import { getFailureOption, STATUS_LABELS } from '@/features/reports/report-catalog';
import type { Report, ReportPriority, ReportStatus } from '@/types/report';
import type { UserRole } from '@nexiora/types';

interface ReportsViewProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  role: UserRole;
  technicians: TechnicianOption[];
  techniciansLoading: boolean;
  techniciansError: string | null;
  actionLoading: boolean;
  actionError: string | null;
  onRefresh: () => void;
  onValidate: (
    reportId: string,
    approved: boolean,
    priority?: ReportPriority,
  ) => Promise<Report>;
  onAssignTechnician: (
    reportId: string,
    technicianId: string,
    priority?: ReportPriority,
  ) => Promise<Report>;
  onClearActionError: () => void;
}

type Filter = 'ALL' | ReportStatus;

const STATUS_LABELS_WITH_REJECTED: Record<ReportStatus, string> = {
  ...STATUS_LABELS,
  REJECTED: 'Rechazado',
};

const PRIORITIES: Array<{ value: ReportPriority; label: string }> = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'VERIFIED', label: 'Validados' },
  { value: 'IN_PROGRESS', label: 'En proceso' },
  { value: 'RESOLVED', label: 'Resultados' },
  { value: 'REJECTED', label: 'Rechazados' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusIcon(status: ReportStatus) {
  switch (status) {
    case 'PENDING':
      return Clock3;
    case 'VERIFIED':
      return UserCheck;
    case 'IN_PROGRESS':
      return Wrench;
    case 'RESOLVED':
      return CheckCircle2;
    case 'REJECTED':
      return XCircle;
  }
}

function statusStyle(status: ReportStatus) {
  switch (status) {
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'VERIFIED':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'IN_PROGRESS':
      return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'RESOLVED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700';
  }
}

function priorityStyle(priority: ReportPriority) {
  switch (priority) {
    case 'CRITICAL':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'HIGH':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'MEDIUM':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'LOW':
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function progressStep(status: ReportStatus) {
  switch (status) {
    case 'PENDING':
      return 1;
    case 'VERIFIED':
      return 2;
    case 'IN_PROGRESS':
      return 3;
    case 'RESOLVED':
      return 4;
    case 'REJECTED':
      return 1;
  }
}

function ProgressTrack({ report }: { report: Report }) {
  const currentStep = progressStep(report.status);
  const rejected = report.status === 'REJECTED';
  const steps = ['Recibido', 'Validado', 'En atención', 'Resultado'];

  return (
    <div className="mt-5" aria-label={`Progreso: ${STATUS_LABELS_WITH_REJECTED[report.status]}`}>
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const complete = !rejected && stepNumber <= currentStep;

          return (
            <div className="flex min-w-0 flex-1 items-center gap-1.5" key={step}>
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-black ${
                  complete
                    ? 'bg-blue-600 text-white shadow-[0_3px_9px_rgba(37,99,235,0.28)]'
                    : rejected && stepNumber === 1
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {complete && stepNumber < currentStep ? '✓' : stepNumber}
              </span>
              {index < steps.length - 1 && (
                <span className={`h-1 min-w-2 flex-1 rounded-full ${complete && stepNumber < currentStep ? 'bg-blue-500' : 'bg-slate-100'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 grid grid-cols-4 gap-1 text-[9px] font-semibold text-slate-400">
        {steps.map((step) => <span key={step}>{step}</span>)}
      </div>
    </div>
  );
}

export function ReportsView({
  reports,
  loading,
  error,
  role,
  technicians,
  techniciansLoading,
  techniciansError,
  actionLoading,
  actionError,
  onRefresh,
  onValidate,
  onAssignTechnician,
  onClearActionError,
}: ReportsViewProps) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<ReportPriority>('MEDIUM');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );
  const canManage = role === 'LEADER' || role === 'ADMIN';

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (filter !== 'ALL' && report.status !== filter) {
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
        report.assignedTechnician?.firstName,
        report.assignedTechnician?.lastName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [filter, reports, search]);

  const counters = useMemo(() => ({
    pending: reports.filter((report) => report.status === 'PENDING').length,
    progress: reports.filter((report) => report.status === 'IN_PROGRESS').length,
    resolved: reports.filter((report) => report.status === 'RESOLVED').length,
  }), [reports]);

  function openDetails(report: Report) {
    setSelectedReportId(report.id);
    setSelectedPriority(report.priority);
    setSelectedTechnicianId(report.assignedTechnicianId ?? '');
    onClearActionError();
  }

  function closeDetails() {
    if (!actionLoading) {
      setSelectedReportId(null);
      onClearActionError();
    }
  }

  async function validateSelected(approved: boolean) {
    if (!selectedReport) return;

    try {
      const updated = await onValidate(selectedReport.id, approved, selectedPriority);
      setSelectedPriority(updated.priority);
    } catch {
      // The shared store exposes the error in the modal.
    }
  }

  async function assignSelected() {
  if (!selectedReport || !selectedTechnicianId) return;

  try {
    const updated = await onAssignTechnician(
      selectedReport.id,
      selectedTechnicianId,
      selectedPriority,
    );

    setSelectedPriority(updated.priority);
    setSelectedTechnicianId(updated.assignedTechnicianId ?? '');

    // La asignación fue persistida correctamente.
    // Cerramos el detalle para volver a la lista general de reportes.
    setSelectedReportId(null);
    onClearActionError();
  } catch {
    // El error queda visible mediante actionError.
  }
}

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(191,219,254,0.52),_transparent_32%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Nexiora Signal · estado compartido</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Reportes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Consulta el avance real de cada incidencia. Los cambios de validación, asignación y atención se reflejan aquí y en el mapa.
            </p>
          </div>

          <button type="button" onClick={onRefresh} className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl border border-white/80 bg-white/80 px-4 text-sm font-bold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:bg-white lg:self-auto">
            <RefreshCw size={17} /> Actualizar
          </button>
        </section>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Pendientes', value: counters.pending, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
            { label: 'En proceso', value: counters.progress, icon: Wrench, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Resultados', value: counters.resolved, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-[22px] border border-white/80 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></div>
              <strong className="text-2xl font-black tracking-[-0.04em] text-slate-900">{value}</strong>
              <span className="ml-2 text-xs font-semibold text-slate-500">{label}</span>
            </div>
          ))}
        </section>

        <section className="mb-5 rounded-[24px] border border-white/80 bg-white/75 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-400 lg:w-[390px]">
              <Search size={17} />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, lugar o responsable..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
              {FILTERS.map((item) => (
                <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${filter === item.value ? 'bg-blue-600 text-white shadow-[0_7px_18px_rgba(37,99,235,0.25)]' : 'bg-slate-100/80 text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {loading && reports.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-white/80 bg-white/80 text-slate-500 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <RefreshCw className="animate-spin text-blue-600" size={28} />
            <p className="mt-3 text-sm font-semibold">Actualizando el tablero de reportes…</p>
          </div>
        ) : error && reports.length === 0 ? (
          <div className="rounded-[28px] border border-red-100 bg-red-50/80 p-6 text-sm text-red-700">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> {error}</div>
            <button type="button" onClick={onRefresh} className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-red-700 shadow-sm">Reintentar</button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-white/80 bg-white/80 p-6 text-center shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
            <FileWarning size={30} className="text-blue-500" />
            <h2 className="mt-4 text-lg font-black text-slate-900">No encontramos reportes</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Prueba con otro filtro o término de búsqueda.</p>
          </div>
        ) : (
          <section className="grid gap-4">
            {filteredReports.map((report) => {
              const failure = getFailureOption(report.failureType);
              const StatusIcon = statusIcon(report.status);

              return (
                <article key={report.id} className="rounded-[26px] border border-white/80 bg-white/85 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.11)] sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-xl">{failure?.icon ?? '📍'}</div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-black text-slate-900">{failure?.label ?? report.title}</h2>
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${priorityStyle(report.priority)}`}>{PRIORITIES.find((item) => item.value === report.priority)?.label}</span>
                          </div>
                          <p className="mt-1 text-[11px] font-bold tracking-wide text-slate-400">{report.reportCode ?? 'Sin radicado'}</p>
                        </div>
                      </div>
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{report.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><MapPin size={13} />{report.address ?? 'Ubicación no disponible'}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5">{formatDate(report.createdAt)}</span>
                        {report.assignedTechnician && <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">Técnico: {report.assignedTechnician.firstName} {report.assignedTechnician.lastName}</span>}
                      </div>
                      <ProgressTrack report={report} />
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 lg:flex-col lg:items-end">
                      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black ${statusStyle(report.status)}`}><StatusIcon size={15} />{STATUS_LABELS_WITH_REJECTED[report.status]}</span>
                      <button type="button" onClick={() => openDetails(report)} className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600">Ver detalle <ChevronRight size={15} /></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="report-detail-title" className="max-h-[calc(100dvh-20px)] w-full overflow-y-auto rounded-t-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96))] p-5 shadow-2xl sm:max-h-[calc(100dvh-48px)] sm:max-w-2xl sm:rounded-[28px] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Detalle y avance</p>
                <h2 id="report-detail-title" className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">{selectedReport.title}</h2>
                <p className="mt-1 text-xs font-bold text-slate-400">{selectedReport.reportCode ?? 'Sin radicado'} · actualizado {formatDate(selectedReport.updatedAt)}</p>
              </div>
              <button type="button" onClick={closeDetails} disabled={actionLoading} aria-label="Cerrar detalle" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/80 text-slate-500 transition hover:text-slate-950 disabled:opacity-50"><X size={19} /></button>
            </div>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black ${statusStyle(selectedReport.status)}`}>{(() => { const Icon = statusIcon(selectedReport.status); return <Icon size={15} />; })()}{STATUS_LABELS_WITH_REJECTED[selectedReport.status]}</span>
                <span className="text-xs font-bold text-slate-500">{selectedReport.assignedTechnician ? `Asignado a ${selectedReport.assignedTechnician.firstName} ${selectedReport.assignedTechnician.lastName}` : 'Sin técnico asignado'}</span>
              </div>
              <ProgressTrack report={selectedReport} />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">{selectedReport.description}</p>
            <dl className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                ['Ubicación', selectedReport.address ?? `${selectedReport.latitude.toFixed(5)}, ${selectedReport.longitude.toFixed(5)}`],
                ['Reportado por', `${selectedReport.user.firstName} ${selectedReport.user.lastName}`],
                ['Severidad', PRIORITIES.find((item) => item.value === selectedReport.severity)?.label ?? selectedReport.severity],
                ['Evidencias', `${selectedReport.evidence?.length ?? 0} adjunta(s)`],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-white bg-white/70 px-3 py-2.5"><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 text-xs font-bold text-slate-700">{value}</dd></div>)}
            </dl>

            {selectedReport.imageUrl && <img src={selectedReport.imageUrl.startsWith('http') ? selectedReport.imageUrl : `/api${selectedReport.imageUrl}`} alt="Evidencia inicial del reporte" className="mt-4 h-48 w-full rounded-2xl object-cover shadow-sm" />}

            {canManage && selectedReport.status === 'PENDING' && (
              <section className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-black text-blue-950">Revisión del líder</p>
                <p className="mt-1 text-xs leading-5 text-blue-800">Define la prioridad y valida el reporte antes de asignarlo.</p>
                <label className="mt-3 block text-xs font-bold text-slate-600">Prioridad
                  <select value={selectedPriority} onChange={(event) => setSelectedPriority(event.target.value as ReportPriority)} disabled={actionLoading} className="mt-1.5 h-10 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500">
                    {PRIORITIES.map((priority) => <option key={priority.value} value={priority.value}>{priority.label}</option>)}
                  </select>
                </label>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={() => void validateSelected(true)} disabled={actionLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-black text-white shadow-[0_8px_18px_rgba(37,99,235,0.24)] disabled:opacity-50"><CheckCircle2 size={15} />Validar reporte</button>
                  <button type="button" onClick={() => void validateSelected(false)} disabled={actionLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-xs font-black text-red-700 disabled:opacity-50"><XCircle size={15} />Rechazar reporte</button>
                </div>
              </section>
            )}

            {canManage && selectedReport.status === 'VERIFIED' && (
              <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-xs font-black text-indigo-950">Asignación técnica</p>
                <p className="mt-1 text-xs leading-5 text-indigo-800">El reporte está validado. Asigna un técnico disponible para que pueda iniciar la atención.</p>
                <label className="mt-3 block text-xs font-bold text-slate-600">Técnico responsable
                  <select value={selectedTechnicianId} onChange={(event) => setSelectedTechnicianId(event.target.value)} disabled={actionLoading || techniciansLoading} className="mt-1.5 h-10 w-full rounded-xl border border-indigo-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500">
                    <option value="">{techniciansLoading ? 'Cargando técnicos…' : 'Selecciona un técnico'}</option>
                    {technicians.map((technician) => <option key={technician.id} value={technician.id}>{technician.firstName} {technician.lastName}</option>)}
                  </select>
                </label>
                {techniciansError && <p className="mt-2 text-xs font-semibold text-red-600">{techniciansError}</p>}
                {!techniciansLoading && technicians.length === 0 && !techniciansError && <p className="mt-2 text-xs font-semibold text-amber-700">No hay técnicos activos disponibles para asignar.</p>}
                <button type="button" onClick={() => void assignSelected()} disabled={actionLoading || !selectedTechnicianId} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-xs font-black text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)] disabled:opacity-50"><UserCheck size={15} />Asignar técnico</button>
              </section>
            )}

            {actionError && <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700"><AlertTriangle size={16} /><span className="flex-1">{actionError}</span><button type="button" onClick={onClearActionError} className="font-black">Cerrar</button></div>}
          </section>
        </div>
      )}
    </main>
  );
}
