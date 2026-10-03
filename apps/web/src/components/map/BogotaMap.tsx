import { useEffect, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

import { MapClickHandler } from './MapClickHandler';
import { SelectedLocation } from './SelectedLocation';
import { getMarkerIcon } from './icons/reportIcons';
import { ReportPopup } from './ReportPopup';
import type { Coordinates } from '@/types/location';
import type { Report } from '@/types/report';
import './BogotaMap.css';

const BOGOTA_CENTER: Coordinates = [4.711, -74.0721];

interface BogotaMapProps {
  onUserLocationChange: (position: Coordinates) => void;
  selectedLocation: Coordinates | null;
  onLocationSelected: (position: Coordinates) => void;
  reports: Report[];
}

interface UserLocationProps {
  onLocationChange: (position: Coordinates) => void;
  onLocationError: (message: string | null) => void;
}

function UserLocation({ onLocationChange, onLocationError }: UserLocationProps) {
  const map = useMap();
  const [position, setPosition] = useState<Coordinates | null>(null);
  const hasCenteredMap = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      onLocationError('Tu navegador no permite obtener la ubicación.');
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextPosition: Coordinates = [coords.latitude, coords.longitude];
        setPosition(nextPosition);
        onLocationChange(nextPosition);
        onLocationError(null);

        if (!hasCenteredMap.current) {
          map.setView(nextPosition, 16);
          hasCenteredMap.current = true;
        }
      },
      () => onLocationError('No pudimos obtener tu ubicación. Mostramos Bogotá como referencia.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, onLocationChange, onLocationError]);

  if (!position) return null;

  return (
    <CircleMarker center={position} radius={10} pathOptions={{ color: '#ffffff', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}>
      <Popup>Esta es tu ubicación actual.</Popup>
    </CircleMarker>
  );
}

export function BogotaMap({ onUserLocationChange, selectedLocation, onLocationSelected, reports }: BogotaMapProps) {
  const [locationError, setLocationError] = useState<string | null>(null);

  return (
    <section className="map-section" aria-label="Mapa de reportes">
      <MapContainer center={BOGOTA_CENTER} zoom={13} scrollWheelZoom className="map">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <UserLocation onLocationChange={onUserLocationChange} onLocationError={setLocationError} />
        <MapClickHandler onSelect={onLocationSelected} />
        {reports.map((report) => (
          <Marker key={report.id} position={[report.latitude, report.longitude]} icon={getMarkerIcon(report.severity)}>
            <Popup maxWidth={320} className="report-popup"><ReportPopup report={report} /></Popup>
          </Marker>
        ))}
        <SelectedLocation position={selectedLocation} />
      </MapContainer>
      {locationError && <p className="map-location-message">{locationError}</p>}
    </section>
  );
}
