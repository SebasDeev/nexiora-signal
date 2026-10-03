import { useEffect, useMemo, useState } from 'react';

import { UserManagement } from '@/components/admin/UserManagement';
import { CitizenMapView } from '@/components/citizen/CitizenMapView';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportForm } from '@/components/report/ReportForm';
import { ReportSuccessModal } from '@/components/report/ReportSuccessModal';
import MyReportsView from '@/components/reports/MyReportsView';
import { ReportsView } from '@/components/reports/ReportsView';
import TechnicalOperationsView from '@/components/reports/TechnicalOperationsView';
import { LoginForm } from '@/features/auth/LoginForm';
import type {
  CreateManagedUserPayload,
  ManagedUserRole,
} from '@/features/users/users.api';
import { useUsers } from '@/features/users/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableTechnicians } from '@/hooks/useAvailableTechnicians';
import { useLocation } from '@/hooks/useLocation';
import { useReports } from '@/hooks/useReports';
import type { CreateReportPayload, Report } from '@/types/report';
import type { AdminSection } from '@/layout/AppSidebar';

function SectionPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Nexiora Signal
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { session, signIn, signOut } = useAuth();
  const {
    reports,
    loading: reportsLoading,
    error: reportsError,
    actionLoading,
    actionError,
    refresh: refreshReports,
    addReport,
    validate,
    assignTechnician,
    updateWork,
    uploadEvidence,
    clearActionError,
  } = useReports(session?.accessToken);

  const isReportManager =
    session?.user.role === 'LEADER' || session?.user.role === 'ADMIN';

  const {
    technicians,
    loading: techniciansLoading,
    error: techniciansError,
  } = useAvailableTechnicians(
    isReportManager ? session?.accessToken : undefined,
  );

  const {
    users,
    loading: usersLoading,
    error: usersError,
    mutationError: usersMutationError,
    createUser,
    changeRole,
    toggleUserStatus,
    removeUser,
    clearMutationError,
  } = useUsers(
    session?.user.role === 'ADMIN' ? session.accessToken : undefined,
  );

  const {
    userLocation,
    selectedLocation,
    setSelectedLocation,
    setUserLocation,
  } = useLocation();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [createdReport, setCreatedReport] = useState<Report | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>('CONTROL');

  const myReports = useMemo(
    () =>
      session
        ? reports.filter((report) => report.userId === session.user.id)
        : [],
    [reports, session],
  );

  const technicalReports = useMemo(() => {
    if (!session) {
      return [];
    }

    if (session.user.role === 'ADMIN') {
      return reports;
    }

    return reports.filter(
      (report) => report.assignedTechnicianId === session.user.id,
    );
  }, [reports, session]);

  useEffect(() => {
    if (
      activeSection === 'CREATE_REPORT' &&
      session &&
      (session.user.role === 'CITIZEN' || session.user.role === 'LEADER')
    ) {
      if (!selectedLocation && userLocation) {
        setSelectedLocation(userLocation);
      }

      setIsReportOpen(true);
    }
  }, [
    activeSection,
    selectedLocation,
    session,
    setSelectedLocation,
    userLocation,
  ]);

  useEffect(() => {
    if (session) {
      void refreshReports();
    }
  }, [activeSection, refreshReports, session]);

  async function handleCreateReport(report: CreateReportPayload) {
    const created = await addReport(report);

    setCreatedReport(created);
    setIsReportOpen(false);
    setActiveSection('MY_REPORTS');
  }

  function handleStartReport() {
    if (!session) {
      setIsLoginOpen(true);
      return;
    }

    if (!selectedLocation && userLocation) {
      setSelectedLocation(userLocation);
    }

    setActiveSection('CREATE_REPORT');
    setIsReportOpen(true);
  }

  function handleSectionChange(section: AdminSection) {
    setActiveSection(section);
  }

  function handleSignOut() {
    setActiveSection('CONTROL');
    signOut();
  }

  async function handleCreateUser(payload: CreateManagedUserPayload) {
    return createUser(payload);
  }

  async function handleChangeRole(userId: string, role: ManagedUserRole) {
    return changeRole(userId, role);
  }

  function isSectionAllowed(section: AdminSection) {
    if (!session) {
      return false;
    }

    switch (section) {
      case 'CONTROL':
      case 'REPORTS':
        return true;
      case 'CREATE_REPORT':
      case 'MY_REPORTS':
        return session.user.role === 'CITIZEN' || session.user.role === 'LEADER';
      case 'TECHNICAL':
        return session.user.role === 'TECHNICIAN' || session.user.role === 'ADMIN';
      case 'USERS':
      case 'SETTINGS':
        return session.user.role === 'ADMIN';
      default:
        return false;
    }
  }

  function renderMap(openMenu: () => void) {
    return (
      <CitizenMapView
        reports={reports}
        selectedLocation={selectedLocation}
        userLocation={userLocation}
        isSignedIn={Boolean(session)}
        onLocationSelected={setSelectedLocation}
        onUserLocationChange={setUserLocation}
        onLocate={() => {
          if (userLocation) {
            setSelectedLocation(userLocation);
          }
        }}
        onReport={handleStartReport}
        onSignIn={() => setIsLoginOpen(true)}
        onMenuOpen={openMenu}
      />
    );
  }

  function renderAuthenticatedSection(openMenu: () => void) {
    if (!session || !isSectionAllowed(activeSection)) {
      return (
        <SectionPlaceholder
          title="Sección no disponible"
          description="Tu usuario no tiene acceso a esta sección."
        />
      );
    }

    switch (activeSection) {
      case 'CONTROL':
      case 'CREATE_REPORT':
        return renderMap(openMenu);
      case 'REPORTS':
        return (
          <ReportsView
            reports={reports}
            loading={reportsLoading}
            error={reportsError}
            role={session.user.role}
            technicians={technicians}
            techniciansLoading={techniciansLoading}
            techniciansError={techniciansError}
            actionLoading={actionLoading}
            actionError={actionError}
            onRefresh={refreshReports}
            onValidate={validate}
            onAssignTechnician={assignTechnician}
            onClearActionError={clearActionError}
          />
        );
      case 'MY_REPORTS':
        return (
          <MyReportsView
            reports={myReports}
            loading={reportsLoading}
            error={reportsError}
            onRefresh={refreshReports}
          />
        );
      case 'TECHNICAL':
        return (
          <TechnicalOperationsView
            reports={technicalReports}
            loading={reportsLoading}
            error={reportsError}
            actionLoading={actionLoading}
            actionError={actionError}
            onRefresh={refreshReports}
            onUpdateWork={updateWork}
            onUploadEvidence={uploadEvidence}
            onClearActionError={clearActionError}
          />
        );
      case 'USERS':
        return (
          <section className="mx-auto w-full max-w-[1500px] px-4 pb-8 pt-20 sm:px-6 lg:px-8">
            <UserManagement
              users={users}
              loading={usersLoading}
              error={usersError}
              mutationError={usersMutationError}
              onCreateUser={handleCreateUser}
              onChangeRole={handleChangeRole}
              onToggleStatus={toggleUserStatus}
              onDeleteUser={removeUser}
              onClearMutationError={clearMutationError}
            />
          </section>
        );
      case 'SETTINGS':
        return (
          <SectionPlaceholder
            title="Configuración"
            description="Configuración general de la plataforma Nexiora Signal."
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      {session ? (
        <AppLayout
          user={session.user}
          onSignOut={handleSignOut}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          renderContent={renderAuthenticatedSection}
        />
      ) : (
        renderMap(() => {})
      )}

      <ReportSuccessModal
        isOpen={Boolean(createdReport)}
        reportCode={createdReport?.reportCode ?? ''}
        onClose={() => setCreatedReport(null)}
      />

      <LoginForm
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSubmit={async (payload) => {
          await signIn(payload);
          setIsLoginOpen(false);
          setActiveSection('CONTROL');
        }}
      />

      <ReportForm
        isOpen={isReportOpen}
        location={selectedLocation}
        onClose={() => {
          setIsReportOpen(false);
          setActiveSection('CONTROL');
        }}
        onSubmit={handleCreateReport}
      />
    </>
  );
}
