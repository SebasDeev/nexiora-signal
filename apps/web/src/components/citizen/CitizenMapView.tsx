import {
  Bell,
  LogIn,
  MapPin,
  Menu,
  ShieldCheck,
} from 'lucide-react';

import { BogotaMap } from '@/components/map/BogotaMap';
import { StatsBar } from '@/components/map/hud/StatsBar';
import { MapBottomBar } from '@/components/navigation/MapBottomBar';

import type { Coordinates } from '@/types/location';
import type { Report } from '@/types/report';

interface CitizenMapViewProps {
  reports: Report[];
  selectedLocation: Coordinates | null;
  userLocation: Coordinates | null;
  isSignedIn: boolean;

  onLocationSelected: (
    location: Coordinates,
  ) => void;

  onUserLocationChange: (
    location: Coordinates,
  ) => void;

  onLocate: () => void;
  onReport: () => void;
  onSignIn: () => void;
  onMenuOpen: () => void;
}

export function CitizenMapView({
  reports,
  selectedLocation,
  userLocation,
  isSignedIn,
  onLocationSelected,
  onUserLocationChange,
  onLocate,
  onReport,
  onSignIn,
  onMenuOpen,
}: CitizenMapViewProps) {
  const selectedLabel = selectedLocation
    ? `${selectedLocation[0].toFixed(4)}, ${selectedLocation[1].toFixed(4)}`
    : 'Toca el mapa para elegir el punto';

  return (
    <main className="citizen-map-view">
      <BogotaMap
        reports={reports}
        selectedLocation={selectedLocation}
        onLocationSelected={onLocationSelected}
        onUserLocationChange={onUserLocationChange}
      />

      <header className="citizen-map-header">
        <div className="citizen-brand">
          {/* ÚNICO botón de menú */}
          <button
            type="button"
            className="citizen-menu-button"
            onClick={onMenuOpen}
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            <Menu
              size={21}
              aria-hidden="true"
            />
          </button>

          <span
            className="citizen-brand-mark"
            aria-hidden="true"
          >
            N
          </span>

          <div>
            <strong>Nexiora Signal</strong>
            <span>
              Movilidad urbana en tiempo real
            </span>
          </div>
        </div>

        <div
          className="citizen-search"
          aria-label="Ubicación seleccionada"
        >
          <MapPin
            size={18}
            aria-hidden="true"
          />

          <span>
            {selectedLabel}
          </span>
        </div>

        <div className="citizen-header-actions">
          <button
            className="citizen-icon-button"
            type="button"
            aria-label="Notificaciones"
          >
            <Bell size={19} />
          </button>

          {isSignedIn ? (
            <span className="citizen-session">
              <ShieldCheck size={17} />
              Sesión activa
            </span>
          ) : (
            <button
              className="citizen-sign-in"
              type="button"
              onClick={onSignIn}
            >
              <LogIn size={17} />
              Ingresar
            </button>
          )}
        </div>
      </header>

      <section
        className="citizen-map-guide"
        aria-label="Guía para reportar"
      >
        <span className="guide-step">
          1
        </span>

        <p>
          Selecciona el punto exacto en el mapa
        </p>

        <span className="guide-step">
          2
        </span>

        <p>
          Describe el incidente y envíalo
        </p>
      </section>

      <div className="citizen-map-stats">
        <StatsBar reports={reports} />
      </div>

      <MapBottomBar
        onLocate={() => {
          if (userLocation) {
            onLocate();
          }
        }}
        onReport={onReport}
      />
    </main>
  );
}
