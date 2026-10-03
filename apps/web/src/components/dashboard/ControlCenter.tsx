import { Activity, ArrowUpRight, RadioTower } from 'lucide-react';

import { MapPanel } from './MapPanel';
import { RecentReports } from './RecentReports';
import { StatsCards } from './StatsCards';
import type { Coordinates } from '@/types/location';
import type { Report } from '@/types/report';

interface ControlCenterProps {
  reports: Report[];
  selectedLocation: Coordinates | null;
  onLocationSelected: (location: Coordinates) => void;
  onUserLocationChange: (location: Coordinates) => void;
}

export function ControlCenter({
  reports,
  selectedLocation,
  onLocationSelected,
  onUserLocationChange,
}: ControlCenterProps) {
  const activeReports = reports.filter((report) => report.status !== 'RESOLVED').length;

  return (
    <div className="control-center">
      <section className="control-center-intro">
        <div>
          <p className="control-center-eyebrow"><RadioTower size={15} /> Centro de control</p>
          <h1>Situación operativa</h1>
          <p>Monitorea, prioriza y responde a los incidentes urbanos desde un único lugar.</p>
        </div>
        <div className="control-center-live">
          <Activity size={18} />
          <span>{activeReports} incidentes activos</span>
        </div>
      </section>

      <StatsCards reports={reports} />

      <section className="control-center-grid">
        <div className="control-map-card">
          <div className="control-card-heading">
            <div>
              <p>Vista territorial</p>
              <h2>Mapa de incidentes</h2>
            </div>
            <button type="button" className="control-link-button">
              Abrir mapa <ArrowUpRight size={16} />
            </button>
          </div>
          <MapPanel
            reports={reports}
            selectedLocation={selectedLocation}
            onLocationSelected={onLocationSelected}
            onUserLocationChange={onUserLocationChange}
          />
        </div>

        <aside className="control-recent-card">
          <div className="control-card-heading">
            <div>
              <p>Priorización</p>
              <h2>Reportes recientes</h2>
            </div>
          </div>
          <RecentReports reports={reports.slice(0, 6)} />
        </aside>
      </section>
    </div>
  );
}
