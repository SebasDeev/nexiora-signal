import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import type { Report } from '@/types/report';

interface StatsBarProps {
  reports: Report[];
}

export function StatsBar({ reports }: StatsBarProps) {
  const stats = [
    { icon: AlertTriangle, value: reports.filter((report) => report.status === 'PENDING').length, label: 'Pendientes', color: '#d97706' },
    { icon: Clock3, value: reports.filter((report) => report.status === 'IN_PROGRESS').length, label: 'En proceso', color: '#0f8a8a' },
    { icon: CheckCircle2, value: reports.filter((report) => report.status === 'RESOLVED').length, label: 'Resultados', color: '#16834f' },
  ];

  return (
    <div className="map-stats-bar">
      {stats.map(({ icon: Icon, value, label, color }) => (
        <div key={label} className="map-stat">
          <Icon size={17} color={color} />
          <div><strong>{value}</strong><span>{label}</span></div>
        </div>
      ))}
    </div>
  );
}
