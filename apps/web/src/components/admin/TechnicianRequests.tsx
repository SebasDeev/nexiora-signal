import {
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Loader2,
  Mail,
  Phone,
  Send,
  X,
} from 'lucide-react';
import { useState } from 'react';

import type { TechnicianRequest } from '@/features/account/account.api';

interface TechnicianRequestsProps {
  requests: TechnicianRequest[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<unknown>;
  onReview: (
    requestId: string,
    approved: boolean,
    reviewNote?: string,
  ) => Promise<TechnicianRequest>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TechnicianRequests({
  requests,
  loading,
  error,
  onRefresh,
  onReview,
}: TechnicianRequestsProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const pending = requests.filter((request) => request.status === 'PENDING');

  async function review(request: TechnicianRequest, approved: boolean) {
    const reviewNote = notes[request.id]?.trim();
    if (!approved && (!reviewNote || reviewNote.length < 10)) {
      setActionError('Indica un motivo de al menos 10 caracteres para rechazar la solicitud.');
      return;
    }

    setProcessingId(request.id);
    setActionError(null);
    try {
      await onReview(request.id, approved, reviewNote || undefined);
    } catch (reviewError) {
      setActionError(reviewError instanceof Error ? reviewError.message : 'No fue posible revisar la solicitud.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <header className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(239,246,255,.94),rgba(255,255,255,.86))] p-6 shadow-[0_20px_60px_rgba(30,64,175,.12)] backdrop-blur-2xl sm:flex sm:items-end sm:justify-between sm:p-9">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-600"><ClipboardCheck size={15} /> Gestión operativa</p><h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Solicitudes técnicas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Revisa postulaciones ciudadanas. Aprobar una solicitud asigna el rol técnico desde el servidor.</p></div>
        <button type="button" onClick={() => void onRefresh()} className="settings-secondary-button mt-5 sm:mt-0"><Send size={16} />Actualizar lista</button>
      </header>
      {error && <p className="settings-alert settings-alert-error mt-6" role="alert"><CircleAlert size={17} />{error}</p>}
      {actionError && <p className="settings-alert settings-alert-error mt-6" role="alert"><CircleAlert size={17} />{actionError}</p>}
      {loading ? <div className="settings-loading mt-6 rounded-[28px] bg-white/75 py-12"><Loader2 className="animate-spin" size={23} />Cargando solicitudes…</div> : pending.length === 0 ? <div className="mt-6 rounded-[28px] border border-white/80 bg-white/75 p-8 text-center shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur-2xl"><CheckCircle2 className="mx-auto text-blue-600" size={30} /><h2 className="mt-3 text-lg font-extrabold text-slate-900">No hay solicitudes pendientes</h2><p className="mt-1 text-sm text-slate-500">Las nuevas postulaciones aparecerán aquí para su revisión.</p></div> : <div className="mt-6 grid gap-5 xl:grid-cols-2">{pending.map((request) => {
        const isProcessing = processingId === request.id;
        return <article key={request.id} className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Postulación ciudadana</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">{request.user?.firstName} {request.user?.lastName}</h2><p className="mt-1 text-sm text-slate-500">Enviada {formatDate(request.createdAt)}</p></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Pendiente</span></div><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">{request.user?.email && <span className="inline-flex items-center gap-1.5"><Mail size={15} />{request.user.email}</span>}{request.user?.phone && <span className="inline-flex items-center gap-1.5"><Phone size={15} />{request.user.phone}</span>}</div><div className="mt-5 rounded-2xl bg-blue-50/80 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-blue-700">Experiencia o conocimientos</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.experience}</p>{request.motivation && <><p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-blue-700">Motivación</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{request.motivation}</p></>}</div><label className="settings-field mt-5"><span>Nota de revisión <em>Obligatoria al rechazar</em></span><textarea rows={3} value={notes[request.id] ?? ''} onChange={(event) => setNotes((value) => ({ ...value, [request.id]: event.target.value }))} maxLength={1000} placeholder="Agrega una observación para la persona solicitante…" /></label><div className="mt-5 grid gap-3 sm:grid-cols-2"><button disabled={isProcessing} type="button" onClick={() => void review(request, true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,.25)] transition hover:bg-blue-700 disabled:opacity-60">{isProcessing ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />}Aprobar y habilitar</button><button disabled={isProcessing} type="button" onClick={() => void review(request, false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">{isProcessing ? <Loader2 className="animate-spin" size={17} /> : <X size={17} />}Rechazar</button></div></article>;
      })}</div>}
    </section>
  );
}
