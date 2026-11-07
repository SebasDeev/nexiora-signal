import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import type { AuthSession, AuthUser } from '@/features/auth/types';
import type {
  CreateTechnicianRequestPayload,
  TechnicianRequest,
  UpdateProfilePayload,
} from '@/features/account/account.api';
import type { CitizenReportProgress } from '@nexiora/types';
import { CitizenBadges } from './CitizenBadges';

interface AccountSettingsProps {
  user: AuthUser;
  currentRequest: TechnicianRequest | null;
  requestLoading: boolean;
  requestError: string | null;
  citizenProgress: CitizenReportProgress | null;
  citizenProgressLoading: boolean;
  onSaveProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<AuthSession>;
  onSubmitTechnicianRequest: (
    payload: CreateTechnicianRequestPayload,
  ) => Promise<TechnicianRequest>;
  onCancelTechnicianRequest: () => Promise<TechnicianRequest>;
  onRefreshUser: () => Promise<AuthUser | null>;
}

const ROLE_CONTENT = {
  CITIZEN: {
    label: 'Ciudadano',
    description: 'Puedes registrar y seguir tus reportes ciudadanos.',
  },
  LEADER: {
    label: 'Líder operativo',
    description: 'Puedes validar, priorizar y revisar solicitudes técnicas.',
  },
  TECHNICIAN: {
    label: 'Técnico',
    description: 'Puedes atender los trabajos técnicos que te sean asignados.',
  },
  ADMIN: {
    label: 'Administrador',
    description: 'Tienes acceso a la gestión integral de la plataforma.',
  },
} as const;

const REQUEST_STATUS = {
  PENDING: {
    label: 'En revisión',
    detail: 'Tu solicitud fue enviada y está pendiente de la revisión operativa.',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    Icon: Clock3,
  },
  APPROVED: {
    label: 'Aprobada',
    detail: 'Tu solicitud fue aprobada. Actualiza tu sesión para cargar tus nuevos permisos.',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: 'No aprobada',
    detail: 'Puedes revisar las observaciones y enviar una nueva solicitud cuando estés listo.',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
    Icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelada',
    detail: 'La solicitud fue cancelada. Puedes volver a postularte cuando lo necesites.',
    className: 'border-slate-200 bg-slate-50 text-slate-700',
    Icon: CircleAlert,
  },
} as const;

function initialProfile(user: AuthUser): UpdateProfilePayload {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    phone: user.phone ?? '',
  };
}

export function AccountSettings({
  user,
  currentRequest,
  requestLoading,
  requestError,
  citizenProgress,
  citizenProgressLoading,
  onSaveProfile,
  onChangePassword,
  onSubmitTechnicianRequest,
  onCancelTechnicianRequest,
  onRefreshUser,
}: AccountSettingsProps) {
  const [profile, setProfile] = useState<UpdateProfilePayload>(() => initialProfile(user));
  const [profileState, setProfileState] = useState<{ loading: boolean; message: string | null; error: string | null }>({
    loading: false,
    message: null,
    error: null,
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [passwordState, setPasswordState] = useState<{ loading: boolean; message: string | null; error: string | null }>({
    loading: false,
    message: null,
    error: null,
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [requestForm, setRequestForm] = useState<CreateTechnicianRequestPayload>({ experience: '', motivation: '' });
  const [requestState, setRequestState] = useState<{ loading: boolean; message: string | null; error: string | null }>({
    loading: false,
    message: null,
    error: null,
  });

  useEffect(() => {
    setProfile(initialProfile(user));
  }, [user]);

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileState({ loading: true, message: null, error: null });

    try {
      await onSaveProfile({
        ...profile,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        username: profile.username.trim().toLowerCase(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone?.trim() || null,
      });
      setProfileState({ loading: false, message: 'Tus datos se actualizaron correctamente.', error: null });
    } catch (error) {
      setProfileState({
        loading: false,
        message: null,
        error: error instanceof Error ? error.message : 'No fue posible actualizar tu perfil.',
      });
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmation) {
      setPasswordState({ loading: false, message: null, error: 'La confirmación no coincide con la nueva contraseña.' });
      return;
    }

    setPasswordState({ loading: true, message: null, error: null });
    try {
      await onChangePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmation: '' });
      setPasswordState({ loading: false, message: 'Contraseña actualizada. Las demás sesiones anteriores se cerraron por seguridad.', error: null });
    } catch (error) {
      setPasswordState({
        loading: false,
        message: null,
        error: error instanceof Error ? error.message : 'No fue posible cambiar la contraseña.',
      });
    }
  }

  async function submitTechnicianRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestState({ loading: true, message: null, error: null });
    try {
      await onSubmitTechnicianRequest({
        experience: requestForm.experience.trim(),
        motivation: requestForm.motivation?.trim() || undefined,
      });
      setRequestForm({ experience: '', motivation: '' });
      setRequestState({ loading: false, message: 'Tu solicitud fue enviada para revisión.', error: null });
    } catch (error) {
      setRequestState({
        loading: false,
        message: null,
        error: error instanceof Error ? error.message : 'No fue posible enviar la solicitud.',
      });
    }
  }

  async function cancelTechnicianRequest() {
    setRequestState({ loading: true, message: null, error: null });
    try {
      await onCancelTechnicianRequest();
      setRequestState({ loading: false, message: 'La solicitud pendiente fue cancelada.', error: null });
    } catch (error) {
      setRequestState({
        loading: false,
        message: null,
        error: error instanceof Error ? error.message : 'No fue posible cancelar la solicitud.',
      });
    }
  }

  const hasRequestForm = user.role === 'CITIZEN' && (
    !currentRequest ||
    currentRequest.status === 'REJECTED' ||
    currentRequest.status === 'CANCELLED'
  );
  const status = currentRequest ? REQUEST_STATUS[currentRequest.status] : null;
  const StatusIcon = status?.Icon;

  return (
    <section className="mx-auto w-full max-w-[1150px] px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(239,246,255,.94),rgba(255,255,255,.86)_52%,rgba(219,234,254,.86))] p-6 shadow-[0_20px_60px_rgba(30,64,175,.12)] backdrop-blur-2xl sm:p-9">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              <ShieldCheck size={15} /> Mi cuenta
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">Configuración</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Administra tu perfil, seguridad y acceso a Nexiora Signal.</p>
          </div>
          <div className="inline-flex items-center gap-3 self-start rounded-2xl border border-blue-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-[0_8px_18px_rgba(37,99,235,.28)]">
              {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs font-semibold text-blue-700">{ROLE_CONTENT[user.role].label}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <div className="space-y-6">
          <form onSubmit={submitProfile} className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><UserRound size={20} /></span>
              <div>
                <h2 className="text-lg font-extrabold tracking-[-.02em] text-slate-900">Información personal</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">Estos datos identifican tu cuenta y se guardan directamente en tu perfil.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="settings-field"><span>Nombre</span><input value={profile.firstName} onChange={(event) => setProfile((value) => ({ ...value, firstName: event.target.value }))} minLength={2} maxLength={80} required /></label>
              <label className="settings-field"><span>Apellido</span><input value={profile.lastName} onChange={(event) => setProfile((value) => ({ ...value, lastName: event.target.value }))} minLength={2} maxLength={80} required /></label>
              <label className="settings-field"><span>Nombre de usuario</span><input value={profile.username} onChange={(event) => setProfile((value) => ({ ...value, username: event.target.value }))} pattern="[A-Za-z0-9._-]{3,32}" minLength={3} maxLength={32} required /></label>
              <label className="settings-field"><span className="flex items-center gap-1.5"><Mail size={14} /> Correo electrónico</span><input type="email" value={profile.email} onChange={(event) => setProfile((value) => ({ ...value, email: event.target.value }))} required /></label>
              <label className="settings-field sm:col-span-2"><span className="flex items-center gap-1.5"><Phone size={14} /> Teléfono <em>Opcional</em></span><input type="tel" value={profile.phone ?? ''} onChange={(event) => setProfile((value) => ({ ...value, phone: event.target.value }))} maxLength={30} /></label>
            </div>
            {profileState.error && <p className="settings-alert settings-alert-error" role="alert"><CircleAlert size={17} />{profileState.error}</p>}
            {profileState.message && <p className="settings-alert settings-alert-success" role="status"><CheckCircle2 size={17} />{profileState.message}</p>}
            <div className="mt-6 flex justify-end"><button disabled={profileState.loading} className="settings-primary-button" type="submit">{profileState.loading ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}Guardar cambios</button></div>
          </form>

          <form onSubmit={submitPassword} className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><KeyRound size={20} /></span><div><h2 className="text-lg font-extrabold tracking-[-.02em] text-slate-900">Seguridad</h2><p className="mt-1 text-sm leading-5 text-slate-500">Verificamos tu contraseña actual antes de guardar una nueva.</p></div></div>
              <button type="button" onClick={() => setShowPasswords((value) => !value)} className="settings-icon-button" aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}>{showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <div className="mt-6 grid gap-4">
              <label className="settings-field"><span>Contraseña actual</span><input type={showPasswords ? 'text' : 'password'} value={passwords.currentPassword} onChange={(event) => setPasswords((value) => ({ ...value, currentPassword: event.target.value }))} minLength={8} maxLength={128} autoComplete="current-password" required /></label>
              <label className="settings-field"><span>Nueva contraseña</span><input type={showPasswords ? 'text' : 'password'} value={passwords.newPassword} onChange={(event) => setPasswords((value) => ({ ...value, newPassword: event.target.value }))} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
              <label className="settings-field"><span>Confirmar nueva contraseña</span><input type={showPasswords ? 'text' : 'password'} value={passwords.confirmation} onChange={(event) => setPasswords((value) => ({ ...value, confirmation: event.target.value }))} minLength={8} maxLength={128} autoComplete="new-password" required /></label>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Usa al menos 8 caracteres, incluyendo una letra y un número. Al actualizarla, las sesiones anteriores se invalidan.</p>
            {passwordState.error && <p className="settings-alert settings-alert-error" role="alert"><CircleAlert size={17} />{passwordState.error}</p>}
            {passwordState.message && <p className="settings-alert settings-alert-success" role="status"><CheckCircle2 size={17} />{passwordState.message}</p>}
            <div className="mt-6 flex justify-end"><button disabled={passwordState.loading} className="settings-primary-button" type="submit">{passwordState.loading ? <Loader2 className="animate-spin" size={17} /> : <KeyRound size={17} />}Actualizar contraseña</button></div>
          </form>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-blue-100 bg-[linear-gradient(145deg,rgba(239,246,255,.88),rgba(255,255,255,.76))] p-5 shadow-[0_18px_55px_rgba(37,99,235,.10)] backdrop-blur-2xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Tu acceso</p>
            <div className="mt-3 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,.28)]"><ShieldCheck size={21} /></span><div><h2 className="text-lg font-extrabold text-slate-900">{ROLE_CONTENT[user.role].label}</h2><p className="mt-0.5 text-sm leading-5 text-slate-600">{ROLE_CONTENT[user.role].description}</p></div></div>
          </section>

          <CitizenBadges
            progress={citizenProgress}
            loading={citizenProgressLoading}
          />

          {user.role === 'CITIZEN' && (
            <section className="rounded-[28px] border border-white/80 bg-white/75 p-5 shadow-[0_18px_55px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:p-6">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700"><BriefcaseBusiness size={20} /></span><div><h2 className="text-lg font-extrabold tracking-[-.02em] text-slate-900">Solicitud para ser técnico</h2><p className="mt-1 text-sm leading-5 text-slate-500">La solicitud no cambia tu rol automáticamente: un líder o administrador debe revisarla.</p></div></div>

              {requestLoading && <div className="settings-loading"><Loader2 className="animate-spin" size={18} />Consultando tu solicitud…</div>}
              {requestError && <p className="settings-alert settings-alert-error" role="alert"><CircleAlert size={17} />{requestError}</p>}
              {currentRequest && status && StatusIcon && (
                <div className={`mt-5 rounded-2xl border p-4 ${status.className}`}>
                  <div className="flex items-start gap-2"><StatusIcon className="mt-0.5 shrink-0" size={18} /><div><p className="font-bold">{status.label}</p><p className="mt-1 text-sm leading-5 opacity-90">{status.detail}</p></div></div>
                  {currentRequest.reviewNote && <p className="mt-3 rounded-xl bg-white/60 p-3 text-sm leading-5 text-slate-700"><strong>Observación:</strong> {currentRequest.reviewNote}</p>}
                  {currentRequest.status === 'PENDING' && <button type="button" onClick={() => void cancelTechnicianRequest()} disabled={requestState.loading} className="mt-4 text-sm font-bold text-amber-900 underline decoration-amber-400 underline-offset-4">Cancelar solicitud</button>}
                  {currentRequest.status === 'APPROVED' && <button type="button" onClick={() => void onRefreshUser()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"><RefreshCw size={15} />Actualizar sesión</button>}
                </div>
              )}

              {hasRequestForm && !requestLoading && (
                <form onSubmit={submitTechnicianRequest} className="mt-5 space-y-4">
                  <label className="settings-field"><span>Experiencia o conocimientos técnicos</span><textarea value={requestForm.experience} onChange={(event) => setRequestForm((value) => ({ ...value, experience: event.target.value }))} minLength={20} maxLength={2000} rows={5} placeholder="Describe tu experiencia, formación o conocimientos relacionados…" required /></label>
                  <label className="settings-field"><span>Motivación <em>Opcional</em></span><textarea value={requestForm.motivation ?? ''} onChange={(event) => setRequestForm((value) => ({ ...value, motivation: event.target.value }))} maxLength={1000} rows={3} placeholder="¿Por qué quieres apoyar la operación técnica?" /></label>
                  {requestState.error && <p className="settings-alert settings-alert-error" role="alert"><CircleAlert size={17} />{requestState.error}</p>}
                  {requestState.message && <p className="settings-alert settings-alert-success" role="status"><CheckCircle2 size={17} />{requestState.message}</p>}
                  <button disabled={requestState.loading} className="settings-primary-button w-full justify-center" type="submit">{requestState.loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}Enviar solicitud</button>
                </form>
              )}
            </section>
          )}
        </aside>
      </div>
    </section>
  );
}
