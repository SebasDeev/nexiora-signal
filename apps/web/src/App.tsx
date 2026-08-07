import { useEffect, useState } from 'react';
import { BogotaMap } from './components/map/BogotaMap';
import { LoginForm } from './features/auth/LoginForm';
import { ReportButton } from './components/report/ReportButton';
import { ReportForm } from './components/report/ReportForm';
import { login } from './features/auth/auth.api';
import {
  clearSession,
  getStoredSession,
  saveSession,
} from './features/auth/auth-storage';
import type { AuthSession, LoginPayload } from './features/auth/types';
import {
  createReport,
  getReports,
} from './features/reports/reports.api';
import type { Coordinates } from './types/location';
import type {
  CreateReportPayload,
  Report,
} from './types/report';

function App() {
  const [session, setSession] = useState<AuthSession | null>(() =>
    getStoredSession(),
  );

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);

  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);

  const [selectedLocation, setSelectedLocation] =
    useState<Coordinates | null>(null);

  const [message, setMessage] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await getReports();
        setReports(data);
      } catch (error) {
        console.error('Error cargando reportes', error);
      }
    }

    loadReports();
  }, []);

  async function handleLogin(payload: LoginPayload) {
    const nextSession = await login(payload);

    saveSession(nextSession);
    setSession(nextSession);
    setIsLoginOpen(false);

    setMessage(`Sesión iniciada. Hola, ${nextSession.user.firstName}.`);
  }

  function handleReportStart() {
    if (!session) {
      setMessage('Inicia sesión para poder enviar un reporte.');
      setIsLoginOpen(true);
      return;
    }

    if (!selectedLocation && userLocation) {
      setSelectedLocation(userLocation);
    }

    setIsReportFormOpen(true);
  }

  async function handleReportSubmit(report: CreateReportPayload) {
    if (!session) {
      throw new Error(
        'Tu sesión no está disponible. Inicia sesión nuevamente.',
      );
    }

    await createReport(session.accessToken, report);

    const updatedReports = await getReports();
    setReports(updatedReports);

    setIsReportFormOpen(false);

    setMessage(
      'Reporte enviado correctamente. Gracias por contribuir.',
    );
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setMessage('Sesión cerrada.');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Movilidad colaborativa</p>
          <h1>Nexiora Signal</h1>
        </div>

        <div className="app-account">
          <p className="app-subtitle">
            {session
              ? `Hola, ${session.user.firstName}`
              : 'Reporta incidencias de semáforos en Bogotá.'}
          </p>

          {session ? (
            <button
              className="header-button"
              type="button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          ) : (
            <button
              className="header-button"
              type="button"
              onClick={() => setIsLoginOpen(true)}
              >
  Iniciar sesión
</button>
)}
        </div>
      </header>

      <div className="map-wrapper">
        <BogotaMap
          onUserLocationChange={setUserLocation}
          selectedLocation={selectedLocation}
          onLocationSelected={setSelectedLocation}
          reports={reports}
        />

        <ReportButton onClick={handleReportStart} />
      </div>

      <LoginForm
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={handleLogin}
      />

      <ReportForm
        isOpen={isReportFormOpen}
        location={selectedLocation}
        onClose={() => setIsReportFormOpen(false)}
        onSubmit={handleReportSubmit}
      />

      {message && <p className="app-message">{message}</p>}
    </main>
  );
}

export default App;