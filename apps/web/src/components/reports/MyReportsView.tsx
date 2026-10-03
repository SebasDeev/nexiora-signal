import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';

import type { Report, ReportStatus } from '@/types/report';

interface MyReportsViewProps {
  reports: Report[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

type Filter = 'ALL' | ReportStatus;

const STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: 'Pendiente de revisión',
  VERIFIED: 'Validado y listo',
  IN_PROGRESS: 'En atención',
  RESOLVED: 'Resultado confirmado',
  REJECTED: 'No aprobado',
};

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'VERIFIED', label: 'Validados' },
  { value: 'IN_PROGRESS', label: 'En atención' },
  { value: 'RESOLVED', label: 'Resultados' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusIcon(status: ReportStatus) {
  switch (status) {
    case 'PENDING': return Clock3;
    case 'VERIFIED': return ShieldCheck;
    case 'IN_PROGRESS': return Wrench;
    case 'RESOLVED': return CheckCircle2;
    case 'REJECTED': return XCircle;
  }
}

function statusStyle(status: ReportStatus) {
  switch (status) {
    case 'PENDING': return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'VERIFIED': return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'IN_PROGRESS': return 'border-indigo-200 bg-indigo-50 text-indigo-700';
    case 'RESOLVED': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'REJECTED': return 'border-red-200 bg-red-50 text-red-700';
  }
}

function progressPercent(status: ReportStatus) {
  switch (status) {
    case 'PENDING': return 25;
    case 'VERIFIED': return 50;
    case 'IN_PROGRESS': return 75;
    case 'RESOLVED': return 100;
    case 'REJECTED': return 100;
  }
}

function ReportJourney({ report, compact = false }: { report: Report; compact?: boolean }) {
  const progress = progressPercent(report.status);
  const rejected = report.status === 'REJECTED';
  const steps = ['Recibido', 'Validado', 'Atención', 'Resultado'];

  return (
    <div className={compact ? 'mt-4' : 'mt-5'}>
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => {
          const done = !rejected && (index + 1) * 25 <= progress;
          return (
            <div className="flex min-w-0 flex-1 items-center gap-1.5" key={step}>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-black ${done ? 'bg-blue-600 text-white shadow-[0_3px_10px_rgba(37,99,235,0.30)]' : rejected && index === 0 ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-400'}`}>
                {done && index < 3 ? '✓' : index + 1}
              </span>
              {index < 3 && <span className={`h-1 min-w-2 flex-1 rounded-full ${done && index < 3 && progress > (index + 1) * 25 ? 'bg-blue-500' : 'bg-blue-100'}`} />}
            </div>
          );
        })}
      </div>
      {!compact && <div className="mt-1.5 grid grid-cols-4 gap-1 text-[9px] font-bold text-blue-400"><span>Recibido</span><span>Validado</span><span>Atención</span><span>Resultado</span></div>}
    </div>
  );
}

export default function MyReportsView({
  reports,
  loading,
  error,
  onRefresh,
}: MyReportsViewProps) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) ?? null,
    [reports, selectedReportId],
  );
  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (filter !== 'ALL' && report.status !== filter) return false;
      if (!query) return true;

      return [report.reportCode, report.title, report.description, report.address, report.failureType]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [filter, reports, search]);
  const counters = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((report) => report.status === 'PENDING' || report.status === 'VERIFIED').length,
    progress: reports.filter((report) => report.status === 'IN_PROGRESS').length,
    resolved: reports.filter((report) => report.status === 'RESOLVED').length,
  }), [reports]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_0%,rgba(147,197,253,0.65),transparent_28%),radial-gradient(circle_at_0%_30%,rgba(219,234,254,0.82),transparent_35%),linear-gradient(180deg,#f8fbff_0%,#eaf3ff_100%)] px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(125deg,rgba(8,47,119,0.97),rgba(37,99,235,0.94)_54%,rgba(96,165,250,0.90))] px-5 py-6 shadow-[0_24px_60px_rgba(30,64,175,0.25)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-52 w-52 rounded-full bg-cyan-200/20 blur-2xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-blue-50 backdrop-blur-xl"><ShieldCheck size={13} /> Seguimiento conectado</div>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Mis reportes</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">Cada actualización del líder o del técnico se refleja en tu seguimiento y en el estado de la ciudad.</p>
            </div>
            <button type="button" onClick={onRefresh} className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-2xl border border-white/25 bg-white/15 px-4 text-sm font-black text-white shadow-lg backdrop-blur-xl transition hover:bg-white/25 md:self-auto"><RefreshCw size={17} /> Actualizar ahora</button>
          </div>
        </section>

        <section className="-mt-3 relative z-10 grid gap-3 px-1 sm:grid-cols-2 lg:grid-cols-4 sm:px-4">
          {[
            { label: 'Reportes creados', value: counters.total, icon: FileText, color: 'bg-blue-600' },
            { label: 'En revisión', value: counters.pending, icon: Clock3, color: 'bg-amber-500' },
            { label: 'En atención', value: counters.progress, icon: Wrench, color: 'bg-indigo-600' },
            { label: 'Resultados', value: counters.resolved, icon: CheckCircle2, color: 'bg-emerald-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 rounded-[20px] border border-white/80 bg-white/85 p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <span className={`grid h-10 w-10 place-items-center rounded-[14px] text-white shadow-sm ${color}`}><Icon size={18} /></span>
              <div><strong className="block text-xl font-black tracking-[-0.04em] text-slate-950">{value}</strong><span className="block text-[11px] font-bold text-slate-500">{label}</span></div>
            </div>
          ))}
        </section>

        {error && <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/90 p-4 text-sm font-semibold text-red-700"><TriangleAlert size={18} /><span className="flex-1">{error}</span><button type="button" onClick={onRefresh} className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-red-700">Reintentar</button></div>}

        <section className="mt-6 rounded-[24px] border border-white/80 bg-white/75 p-3 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex h-11 items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 px-4 text-blue-400 lg:w-[390px]"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, título o ubicación…" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400" /></label>
            <div className="flex gap-2 overflow-x-auto pb-1 lg:justify-end">
              {FILTERS.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black transition ${filter === item.value ? 'bg-blue-600 text-white shadow-[0_7px_18px_rgba(37,99,235,0.25)]' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>{item.label}</button>)}
            </div>
          </div>
        </section>

        {loading && reports.length === 0 ? (
          <div className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-white/80 bg-white/80 text-slate-500 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl"><RefreshCw size={28} className="animate-spin text-blue-600" /><strong className="mt-3 text-sm">Actualizando tu seguimiento…</strong></div>
        ) : filteredReports.length > 0 ? (
          <section className="mt-5 grid gap-4">
            {filteredReports.map((report) => {
              const StatusIcon = statusIcon(report.status);
              return (
                <article key={report.id} className="group overflow-hidden rounded-[26px] border border-white/85 bg-white/88 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.075)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(30,64,175,0.13)] sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    {report.imageUrl ? <img src={report.imageUrl.startsWith('http') ? report.imageUrl : `/api${report.imageUrl}`} alt="Evidencia inicial" className="h-28 w-full rounded-2xl object-cover shadow-sm lg:h-32 lg:w-40" /> : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 lg:h-32 lg:w-32"><FileText size={27} /></div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><p className="font-mono text-[10px] font-black tracking-wide text-blue-500">{report.reportCode ?? 'SIN RADICADO'}</p><h2 className="mt-1 text-lg font-black tracking-[-0.025em] text-slate-950">{report.title}</h2></div>
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wide ${statusStyle(report.status)}`}><StatusIcon size={14} />{STATUS_LABELS[report.status]}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{report.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5"><MapPin size={13} />{report.address ?? 'Ubicación registrada'}</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5"><CalendarDays size={13} />{formatDate(report.createdAt)}</span></div>
                      <ReportJourney report={report} compact />
                    </div>
                    <button type="button" onClick={() => setSelectedReportId(report.id)} className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-600 hover:text-white">Ver avance <ChevronRight size={16} /></button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="mt-5 flex min-h-72 flex-col items-center justify-center rounded-[28px] border border-white/80 bg-white/80 p-6 text-center shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl"><span className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-blue-600"><FileText size={28} /></span><h2 className="mt-4 text-lg font-black text-slate-950">{reports.length ? 'No encontramos reportes' : 'Aún no tienes reportes'}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{reports.length ? 'Prueba con otro filtro o término de búsqueda.' : 'Cuando registres una incidencia podrás seguir cada etapa desde aquí.'}</p></section>
        )}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedReportId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="my-report-detail-title" className="max-h-[calc(100dvh-20px)] w-full overflow-y-auto rounded-t-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(239,246,255,0.96))] p-5 shadow-2xl sm:max-h-[calc(100dvh-48px)] sm:max-w-2xl sm:rounded-[28px] sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">Seguimiento de incidencia</p><h2 id="my-report-detail-title" className="mt-1 text-xl font-black tracking-[-0.03em] text-slate-950">{selectedReport.title}</h2><p className="mt-1 font-mono text-[10px] font-black tracking-wide text-blue-500">{selectedReport.reportCode ?? 'SIN RADICADO'}</p></div><button type="button" onClick={() => setSelectedReportId(null)} aria-label="Cerrar detalle" className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-white/80 text-slate-500 hover:text-slate-950"><X size={19} /></button></div>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black ${statusStyle(selectedReport.status)}`}>{(() => { const Icon = statusIcon(selectedReport.status); return <Icon size={15} />; })()}{STATUS_LABELS[selectedReport.status]}</span><span className="text-xs font-bold text-blue-800">Actualizado {formatDate(selectedReport.updatedAt)}</span></div><ReportJourney report={selectedReport} /></div>
            <p className="mt-5 text-sm leading-6 text-slate-600">{selectedReport.description}</p>
            <dl className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-white bg-white/75 p-3"><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">Ubicación</dt><dd className="mt-1 text-xs font-bold text-slate-700">{selectedReport.address ?? `${selectedReport.latitude.toFixed(5)}, ${selectedReport.longitude.toFixed(5)}`}</dd></div><div className="rounded-xl border border-white bg-white/75 p-3"><dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">Responsable técnico</dt><dd className="mt-1 text-xs font-bold text-slate-700">{selectedReport.assignedTechnician ? `${selectedReport.assignedTechnician.firstName} ${selectedReport.assignedTechnician.lastName}` : 'Pendiente de asignación'}</dd></div></dl>
            {selectedReport.imageUrl && <img src={selectedReport.imageUrl.startsWith('http') ? selectedReport.imageUrl : `/api${selectedReport.imageUrl}`} alt="Evidencia inicial del reporte" className="mt-4 h-48 w-full rounded-2xl object-cover shadow-sm" />}
            {selectedReport.evidence && selectedReport.evidence.length > 0 && <section className="mt-5"><h3 className="text-sm font-black text-slate-900">Evidencias de atención</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{selectedReport.evidence.map((evidence) => <article key={evidence.id} className="overflow-hidden rounded-2xl border border-blue-100 bg-white/75"><img src={evidence.imageUrl.startsWith('http') ? evidence.imageUrl : `/api${evidence.imageUrl}`} alt="Evidencia técnica" className="h-32 w-full object-cover" /><div className="p-3"><p className="text-[11px] font-black text-slate-700">{evidence.uploadedBy ? `${evidence.uploadedBy.firstName} ${evidence.uploadedBy.lastName}` : 'Equipo técnico'}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{formatDate(evidence.createdAt)}</p>{evidence.note && <p className="mt-2 text-xs leading-5 text-slate-600">{evidence.note}</p>}</div></article>)}</div></section>}
          </section>
        </div>
      )}
    </main>
  );
}
