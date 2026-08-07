import { useEffect, useRef, useState } from 'react';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

import { MapClickHandler } from './MapClickHandler';
import { SelectedLocation } from './SelectedLocation';

import type { Coordinates } from '../../types/location';
import type { Report } from '../../types/report';
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
}

function UserLocation({ onLocationChange }: UserLocationProps) {
  const map = useMap();

  const [position, setPosition] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasCenteredMap = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite obtener la ubicación.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextPosition: Coordinates = [
          coords.latitude,
          coords.longitude,
        ];

        setPosition(nextPosition);
        onLocationChange(nextPosition);
        setError(null);

        if (!hasCenteredMap.current) {
          map.setView(nextPosition, 16);
          hasCenteredMap.current = true;
        }
      },
      () => {
        setError(
          'No pudimos obtener tu ubicación. Mostramos Bogotá como referencia.',
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [map, onLocationChange]);

  return (
    <>
      {position && (
        <CircleMarker
          center={position}
          radius={10}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#2563eb',
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>Esta es tu ubicación actual.</Popup>
        </CircleMarker>
      )}

      {error && <p className="map-location-message">{error}</p>}
    </>
  );
}

export function BogotaMap({
  onUserLocationChange,
  selectedLocation,
  onLocationSelected,
  reports,
}: BogotaMapProps) {
  return (
    <section className="map-section" aria-label="Mapa de reportes">
      <MapContainer
        center={BOGOTA_CENTER}
        zoom={13}
        scrollWheelZoom
        className="map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <UserLocation onLocationChange={onUserLocationChange} />

        <MapClickHandler onSelect={onLocationSelected} />
{reports.map((report) => (
  <Marker
    key={report.id}
    position={[report.latitude, report.longitude]}
  >
    <Popup>
      <strong>{report.title}</strong>

      <br />

      {report.description}

      <br />
      <br />

      <strong>Gravedad:</strong> {report.severity}

      <br />

      <strong>Estado:</strong> {report.status}

      <br />

      <strong>Reportado por:</strong>{' '}
      {report.user.firstName} {report.user.lastName}
    </Popup>
  </Marker>
))}
        <SelectedLocation position={selectedLocation} />
      </MapContainer>
    </section>
  );
}