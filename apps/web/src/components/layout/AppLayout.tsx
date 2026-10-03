import { ArrowLeft, Bell } from 'lucide-react';

import { useState } from 'react';

import type { UserRole } from '@nexiora/types';

import { AppSidebar } from '@/layout/AppSidebar';

import type { AdminSection } from '@/layout/AppSidebar';

interface AppLayoutProps {
  user: {
    firstName: string;
    lastName: string;
    email?: string;
    role: UserRole;
  };

  onSignOut: () => void;

  activeSection: AdminSection;

  onSectionChange: (
    section: AdminSection,
  ) => void;

  children?: React.ReactNode;
    onMenuOpen?: () => void;
     renderContent?: (
    openMenu: () => void,
  ) => React.ReactNode;

}

export function AppLayout({
  user,
  onSignOut,
  activeSection,
  onSectionChange,
  children,
  renderContent,
}: AppLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      {/* Main application */}

      <div className="relative z-0 min-h-screen">
  {renderContent
    ? renderContent(() => setIsMenuOpen(true))
    : children}
</div>

      {activeSection !== 'CONTROL' && (
        <button
          type="button"
          onClick={() => onSectionChange('CONTROL')}
          className="
            fixed
            left-4
            top-4
            z-[60]
            inline-flex
            h-12
            items-center
            justify-center
            gap-2
            rounded-[16px]
            border
            border-white/80
            bg-white/90
            px-4
            text-sm
            font-bold
            text-slate-600
            shadow-[0_10px_30px_rgba(15,23,42,0.12)]
            backdrop-blur-xl
            transition
            hover:bg-white
            hover:text-blue-600
            active:scale-95
          "
          aria-label="Volver al mapa principal"
        >
          <ArrowLeft size={19} aria-hidden="true" />
          Volver al mapa
        </button>
      )}

      {/* Notifications */}

      <button
        type="button"
        aria-label="Notificaciones"
        className="
          fixed
          right-4
          top-4
          z-[60]
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-[16px]
          border
          border-white/80
          bg-white/90
          text-slate-600
          shadow-[0_10px_30px_rgba(15,23,42,0.12)]
          backdrop-blur-xl
          transition
          hover:bg-white
          hover:text-blue-600
          active:scale-95
        "
      >
        <Bell size={19} />

        <span
          className="
            absolute
            right-[9px]
            top-[9px]
            h-2
            w-2
            rounded-full
            bg-red-500
            ring-2
            ring-white
          "
        />
      </button>

      {/* Sidebar */}

      <AppSidebar
        user={user}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onSignOut={onSignOut}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  );
}
