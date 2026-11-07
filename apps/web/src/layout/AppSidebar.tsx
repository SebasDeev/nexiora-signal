import {
  Activity,
  Award,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Star,
  UserCircle2,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import type {
  CitizenReportProgress,
  UserRole,
} from '@nexiora/types';

export type AdminSection =
  | 'CONTROL'
  | 'REPORTS'
  | 'CREATE_REPORT'
  | 'MY_REPORTS'
  | 'TECHNICAL'
  | 'USERS'
  | 'TECHNICIAN_REQUESTS'
  | 'SETTINGS';

interface AppSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    username?: string;
    email?: string;
    role: UserRole;
  };

  citizenProgress?: CitizenReportProgress | null;

  activeSection: AdminSection;

  onSectionChange: (
    section: AdminSection,
  ) => void;

  onSignOut: () => void;

  isOpen: boolean;

  onClose: () => void;
}

interface NavigationItem {
  id: AdminSection;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'CONTROL',
    label: 'Centro de control',
    description: 'Situación operativa',
    icon: LayoutDashboard,
    roles: [
      'CITIZEN',
      'LEADER',
      'TECHNICIAN',
      'ADMIN',
    ],
  },

  {
    id: 'REPORTS',
    label: 'Reportes',
    description: 'Incidentes registrados',
    icon: ClipboardList,
    roles: [
      'CITIZEN',
      'LEADER',
      'TECHNICIAN',
      'ADMIN',
    ],
  },

  {
    id: 'CREATE_REPORT',
    label: 'Crear reporte',
    description: 'Registrar una incidencia',
    icon: FilePlus2,
    roles: [
      'LEADER',
      'CITIZEN',
    ],
  },

  {
    id: 'MY_REPORTS',
    label: 'Mis reportes',
    description: 'Seguimiento de incidencias',
    icon: ClipboardList,
    roles: [
      'CITIZEN',
      'LEADER',
    ]
  },

  {
    id: 'TECHNICAL',
    label: 'Operación técnica',
    description: 'Trabajos asignados',
    icon: Wrench,
    roles: [
      'TECHNICIAN',
      'ADMIN',
    ],
  },

  {
    id: 'USERS',
    label: 'Usuarios',
    description: 'Administración de cuentas',
    icon: Users,
    roles: [
      'ADMIN',
    ],
  },

  {
    id: 'TECHNICIAN_REQUESTS',
    label: 'Solicitudes técnicas',
    description: 'Postulaciones por revisar',
    icon: ShieldCheck,
    roles: [
      'LEADER',
      'ADMIN',
    ],
  },

  {
    id: 'SETTINGS',
    label: 'Configuración',
    description: 'Preferencias del sistema',
    icon: Settings,
    roles: ['CITIZEN', 'LEADER', 'TECHNICIAN', 'ADMIN'],
  },
];

function getInitials(
  firstName: string,
  lastName: string,
) {
  const first =
    firstName?.charAt(0) ?? '';

  const last =
    lastName?.charAt(0) ?? '';

  return `${first}${last}`.toUpperCase();
}

function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';

    case 'LEADER':
      return 'Líder operativo';

    case 'TECHNICIAN':
      return 'Técnico';

    case 'CITIZEN':
      return 'Ciudadano';

    default:
      return 'Usuario';
  }
}

function getRoleDescription(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return 'Control total del sistema';

    case 'LEADER':
      return 'Supervisión operativa';

    case 'TECHNICIAN':
      return 'Gestión técnica';

    case 'CITIZEN':
      return 'Reporte ciudadano';

    default:
      return 'Acceso al sistema';
  }
}

export function AppSidebar({
  user,
  citizenProgress,
  activeSection,
  onSectionChange,
  onSignOut,
  isOpen,
  onClose,
}: AppSidebarProps) {
  const availableItems =
    NAVIGATION_ITEMS.filter((item) =>
      item.roles.includes(user.role),
    );
  const citizenBadge = citizenProgress?.currentBadge ?? citizenProgress?.nextBadge;
  const reportsToNextLevel = citizenProgress?.nextBadge
    ? Math.max(0, citizenProgress.nextBadge.requiredReports - citizenProgress.reportCount)
    : 0;

  return (
    <>
      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[80]
          bg-slate-950/20
          backdrop-blur-[3px]
          transition-opacity
          duration-300
          lg:hidden
          ${
            isOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }
        `}
      />

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-3
          top-3
          bottom-3
          z-[90]
          flex
          w-[calc(100vw-24px)]
          max-w-[300px]
          flex-col
          overflow-hidden
          rounded-[24px]
          border
          border-white/70
          bg-white/90
          shadow-[0_24px_70px_rgba(15,23,42,0.20)]
          backdrop-blur-2xl
          transition-transform
          duration-300
          ease-out
          sm:left-4
          sm:top-4
          sm:bottom-4
          sm:w-[320px]
          sm:max-w-none
          sm:rounded-[30px]
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-[calc(100%+24px)]'
          }
        `}
      >

        {/* HEADER */}

        <div className="border-b border-slate-200/70 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">

          <div className="flex items-center justify-between">

            <button
              type="button"
              onClick={() => {
                onSectionChange('CONTROL');
                onClose();
              }}
              className="flex min-w-0 items-center gap-3 rounded-[15px] text-left transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-label="Ir al mapa principal"
              title="Ir al mapa principal"
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-[13px]
                  bg-blue-600
                  text-white
                  shadow-[0_8px_22px_rgba(37,99,235,0.28)]
                "
              >
                <Activity
                  size={20}
                  strokeWidth={2.4}
                />
              </div>

              <div>

                <p className="text-[14px] font-bold tracking-[-0.02em] text-slate-900 sm:text-[15px]">
                  Nexiora Signal
                </p>

                <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
                  Movilidad urbana
                </p>

              </div>

            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-slate-200
                bg-white/80
                text-slate-500
                shadow-sm
                transition
                hover:bg-slate-50
                hover:text-slate-900
                active:scale-95
              "
            >
              <X size={19} />
            </button>

          </div>

        </div>

        {/* USER */}

        <div className="px-4 pt-4 sm:px-5 sm:pt-5">

          <div
            className="
              flex
              items-center
              gap-2.5
              rounded-[18px]
              border
              border-slate-200/70
              bg-slate-50/80
              p-2.5
              sm:gap-3
              sm:rounded-[22px]
              sm:p-3
            "
          >

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                text-[13px]
                font-bold
                text-white
                shadow-[0_6px_16px_rgba(37,99,235,0.22)]
              "
            >
              {getInitials(
                user.firstName,
                user.lastName,
              )}
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-[13px] font-bold text-slate-900 sm:text-sm">
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                {getRoleLabel(user.role)}{user.username ? ` · @${user.username}` : ''}
              </p>

            </div>

            {user.role === 'CITIZEN' && citizenBadge ? (
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] border border-blue-200 bg-[linear-gradient(145deg,rgba(219,234,254,.96),rgba(255,255,255,.88))] p-1 text-center text-blue-700 shadow-[0_8px_20px_rgba(37,99,235,.16)] sm:h-14 sm:w-14 sm:rounded-[17px]"
                title={citizenProgress?.currentBadge
                  ? `Insignia lograda: ${citizenBadge.name}`
                  : `Próxima insignia: ${citizenBadge.name}`}
              >
                <Award size={20} className="text-blue-600 sm:hidden" fill="currentColor" fillOpacity={0.12} />
                <Award size={22} className="hidden text-blue-600 sm:block" fill="currentColor" fillOpacity={0.12} />
                <span className="-mt-1 max-w-full truncate text-[9px] font-extrabold leading-none">
                  {citizenBadge.name}
                </span>
              </div>
            ) : (
              <UserCircle2
                size={18}
                className="shrink-0 text-slate-400"
              />
            )}

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5">

          <div className="mb-2 px-2 sm:mb-3">

            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[10px]">
              Navegación
            </p>

          </div>

          <nav className="space-y-1 sm:space-y-1.5">

            {availableItems.map((item) => {

              const Icon = item.icon;

              const isActive =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-[16px]
                    px-2.5
                    py-2.5
                    text-left
                    transition-all
                    duration-200
                    sm:rounded-[19px]
                    sm:px-3
                    sm:py-3

                    ${
                      isActive
                        ? `
                          bg-blue-600
                          text-white
                          shadow-[0_9px_25px_rgba(37,99,235,0.24)]
                        `
                        : `
                          text-slate-700
                          hover:bg-slate-100/90
                        `
                    }
                  `}
                >

                  <span
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-[12px]
                      transition

                      ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      strokeWidth={2}
                    />
                  </span>

                  <span className="min-w-0 flex-1">

                    <span
                      className={`
                        block
                        truncate
                        text-[13px]
                        sm:text-sm
                        font-bold

                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-800'
                        }
                      `}
                    >
                      {item.label}
                    </span>

                    <span
                      className={`
                        mt-0.5
                        block
                        truncate
                        text-[10px]
                        sm:text-[11px]

                        ${
                          isActive
                            ? 'text-blue-100'
                            : 'text-slate-400'
                        }
                      `}
                    >
                      {item.description}
                    </span>

                  </span>

                </button>
              );
            })}

          </nav>

          {user.role === 'CITIZEN' && citizenProgress ? (
            <div className="relative mt-4 overflow-hidden rounded-[18px] border border-blue-200/80 bg-[linear-gradient(145deg,rgba(239,246,255,.94),rgba(255,255,255,.78))] p-3 shadow-[0_14px_34px_rgba(37,99,235,.10)] sm:mt-6 sm:rounded-[22px] sm:p-4">
              <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full bg-blue-300/30 blur-2xl" />
              <div className="relative flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,.25)] sm:h-10 sm:w-10 sm:rounded-2xl">
                  <Star size={17} fill="currentColor" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-blue-950 sm:text-sm">
                    ¡Gracias, {user.firstName}!
                  </p>
                  <p className="mt-1 text-[10px] leading-4 text-blue-800 sm:text-[11px] sm:leading-5">
                    Tus reportes ayudan a construir una ciudad más estable y segura para todos.
                  </p>
                </div>
              </div>

              <div className="relative mt-3 rounded-[14px] border border-white/90 bg-white/70 p-2.5 sm:mt-4 sm:rounded-[16px] sm:p-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.1em] text-blue-600">
                      Tu impacto
                    </p>
                    <p className="mt-0.5 text-base font-black tracking-[-.03em] text-slate-900 sm:text-lg">
                      {citizenProgress.reportCount} <span className="text-xs font-bold text-slate-500">reportes</span>
                    </p>
                  </div>
                  {citizenProgress.currentBadge && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-extrabold text-blue-700">
                      {citizenProgress.currentBadge.name}
                    </span>
                  )}
                </div>

                {citizenProgress.nextBadge ? (
                  <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-600 sm:text-[11px] sm:leading-5">
                    Te faltan <strong className="text-blue-700">{reportsToNextLevel} reportes</strong> para alcanzar {citizenProgress.nextBadge.name}.
                  </p>
                ) : (
                  <p className="mt-2 text-[10px] font-semibold leading-4 text-blue-700 sm:text-[11px] sm:leading-5">
                    ¡Alcanzaste Nexpro! Tu apoyo ya deja una huella importante.
                  </p>
                )}
              </div>

              <p className="relative mt-2.5 text-[10px] font-semibold leading-4 text-blue-700 sm:mt-3 sm:text-[11px] sm:leading-5">
                Sigue reportando: cada aviso oportuno mejora la movilidad de tu ciudad.
              </p>
            </div>
          ) : (
            <div
              className="
                mt-4
                rounded-[18px]
                border
                border-blue-100
                bg-blue-50/70
                p-3
                sm:mt-6
                sm:rounded-[20px]
                sm:p-4
              "
            >

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-xs font-bold text-blue-900">
                    {getRoleLabel(user.role)}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700">
                    {getRoleDescription(user.role)}.
                    Las opciones disponibles se
                    adaptan automáticamente a tu perfil.
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-200/70 p-3 sm:p-4">

          <button
            type="button"
            onClick={onSignOut}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-[15px]
              px-2.5
              py-2.5
              text-left
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-red-50
              hover:text-red-600
              active:scale-[0.99]
            "
          >

            <span
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-[12px]
                bg-slate-100
              "
            >
              <LogOut size={18} />
            </span>

            <span>
              Cerrar sesión
            </span>

          </button>

        </div>

      </aside>
    </>
  );
}

/**
 * Botón flotante de tres líneas.
 *
 * Se mantiene separado del panel para que
 * pueda posicionarse sobre el dashboard
 * sin alterar su layout.
 */

interface MenuButtonProps {
  onClick: () => void;
}

export function MenuButton({
  onClick,
}: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir menú"
      className="
        group
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-[16px]
        border
        border-white/80
        bg-white/90
        text-slate-700
        shadow-[0_10px_30px_rgba(15,23,42,0.16)]
        backdrop-blur-xl
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-white
        hover:text-blue-600
        active:scale-95
      "
    >
      <Menu
        size={23}
        strokeWidth={2.3}
        className="transition-transform group-hover:scale-105"
      />
    </button>
  );
}
