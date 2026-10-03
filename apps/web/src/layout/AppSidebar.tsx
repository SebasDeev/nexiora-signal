import {
  Activity,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import type { UserRole } from '@nexiora/types';

export type AdminSection =
  | 'CONTROL'
  | 'REPORTS'
  | 'CREATE_REPORT'
  | 'MY_REPORTS'
  | 'TECHNICAL'
  | 'USERS'
  | 'SETTINGS';

interface AppSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    role: UserRole;
  };

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
    id: 'SETTINGS',
    label: 'Configuración',
    description: 'Preferencias del sistema',
    icon: Settings,
    roles: [
      'ADMIN',
    ],
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
          left-4
          top-4
          bottom-4
          z-[90]
          flex
          w-[320px]
          flex-col
          overflow-hidden
          rounded-[30px]
          border
          border-white/70
          bg-white/90
          shadow-[0_24px_70px_rgba(15,23,42,0.20)]
          backdrop-blur-2xl
          transition-transform
          duration-300
          ease-out
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-[calc(100%+24px)]'
          }
        `}
      >

        {/* HEADER */}

        <div className="border-b border-slate-200/70 px-5 pb-5 pt-5">

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
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-[15px]
                  bg-blue-600
                  text-white
                  shadow-[0_8px_22px_rgba(37,99,235,0.28)]
                "
              >
                <Activity
                  size={22}
                  strokeWidth={2.4}
                />
              </div>

              <div>

                <p className="text-[15px] font-bold tracking-[-0.02em] text-slate-900">
                  Nexiora Signal
                </p>

                <p className="text-[11px] font-medium text-slate-500">
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
                h-10
                w-10
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

        <div className="px-5 pt-5">

          <div
            className="
              flex
              items-center
              gap-3
              rounded-[22px]
              border
              border-slate-200/70
              bg-slate-50/80
              p-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                text-sm
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

              <p className="truncate text-sm font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                {getRoleLabel(user.role)}
              </p>

            </div>

            <UserCircle2
              size={18}
              className="shrink-0 text-slate-400"
            />

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">

          <div className="mb-3 px-2">

            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Navegación
            </p>

          </div>

          <nav className="space-y-1.5">

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
                    rounded-[19px]
                    px-3
                    py-3
                    text-left
                    transition-all
                    duration-200

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
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-[14px]
                      transition

                      ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={2}
                    />
                  </span>

                  <span className="min-w-0 flex-1">

                    <span
                      className={`
                        block
                        truncate
                        text-sm
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
                        text-[11px]

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

          {/* ROLE CARD */}

          <div
            className="
              mt-6
              rounded-[20px]
              border
              border-blue-100
              bg-blue-50/70
              p-4
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

        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-200/70 p-4">

          <button
            type="button"
            onClick={onSignOut}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-[18px]
              px-3
              py-3
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
                h-10
                w-10
                items-center
                justify-center
                rounded-[13px]
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
