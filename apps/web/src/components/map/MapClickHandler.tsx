import { useMapEvents } from 'react-leaflet';
import type { Coordinates } from '../../types/location';

interface Props {
  onSelect(position: Coordinates): void;
}

export function MapClickHandler({ onSelect }: Props) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}