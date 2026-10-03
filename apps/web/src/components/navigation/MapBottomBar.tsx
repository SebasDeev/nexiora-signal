import { Crosshair, Layers3, TriangleAlert } from 'lucide-react';

interface MapBottomBarProps {
  onLocate: () => void;
  onReport: () => void;
}

export function MapBottomBar({ onLocate, onReport }: MapBottomBarProps) {
  return (
    <nav className="map-bottom-bar" aria-label="Acciones del mapa">
      <button type="button" className="map-action-button" aria-label="Capas del mapa">
        <Layers3 size={18} />
        <span>Capas</span>
      </button>
      <button type="button" className="map-report-button" onClick={onReport}>
        <TriangleAlert size={19} />
        <span>Reportar incidente</span>
      </button>
      <button type="button" className="map-action-button" onClick={onLocate}>
        <Crosshair size={18} />
        <span>Mi ubicación</span>
      </button>
    </nav>
  );
}
