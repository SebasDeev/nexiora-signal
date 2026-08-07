import { CircleMarker, Popup } from 'react-leaflet';
import type { Coordinates } from '../../types/location';

interface Props {
  position: Coordinates | null;
}

export function SelectedLocation({ position }: Props) {
  if (!position) return null;

  return (
    <CircleMarker
      center={position}
      radius={10}
      pathOptions={{
        color: '#ffffff',
        fillColor: '#ef4444',
        fillOpacity: 1,
        weight: 3,
      }}
    >
      <Popup>Ubicación del reporte</Popup>
    </CircleMarker>
  );
}