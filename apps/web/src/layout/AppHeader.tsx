import { Bell, Search } from 'lucide-react';
import type { AuthUser } from '@/features/auth/types';

interface AppHeaderProps {
  user: AuthUser;
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="control-topbar">
      <label className="control-search">
        <Search size={18} />
        <input
          placeholder="Buscar reporte, dirección o código…"
          aria-label="Buscar reporte, dirección o código"
        />
      </label>

      <div className="control-topbar-actions">
        <button type="button" className="control-notification" aria-label="Notificaciones">
          <Bell size={19} />
        </button>

        <div className="control-user">
          <span className="control-avatar">{user.firstName.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <span>{user.role === 'ADMIN' ? 'Administrador' : 'Operación'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
