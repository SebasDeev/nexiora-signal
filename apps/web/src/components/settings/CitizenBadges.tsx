import { Award, LockKeyhole, Star } from 'lucide-react';

import type { CitizenReportProgress } from '@nexiora/types';

interface CitizenBadgesProps {
  progress: CitizenReportProgress | null;
  loading: boolean;
}

export function CitizenBadges({ progress, loading }: CitizenBadgesProps) {
  if (loading) {
    return (
      <section className="citizen-badges-card">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Reconocimientos</p>
        <p className="mt-3 text-sm text-slate-500">Consultando tus insignias…</p>
      </section>
    );
  }

  if (!progress) return null;

  return (
    <section className="citizen-badges-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Reconocimientos</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">Tus insignias</h2>
        </div>
        <span className="citizen-badge-star-count"><Star size={15} fill="currentColor" />{progress.stars}</span>
      </div>
      <p className="mt-2 text-sm leading-5 text-slate-500">Cada reporte registrado suma una estrella para desbloquear el siguiente nivel.</p>
      <div className="mt-5 grid gap-2">
        {progress.badges.map((badge) => (
          <div
            key={badge.id}
            className={`citizen-badge-item ${badge.unlocked ? 'is-unlocked' : ''}`}
          >
            <span className="citizen-badge-icon">
              {badge.unlocked ? <Award size={18} /> : <LockKeyhole size={17} />}
            </span>
            <div>
              <strong>{badge.name}</strong>
              <span>Nivel {badge.level} · {badge.requiredReports} reportes</span>
            </div>
            {badge.unlocked && <span className="citizen-badge-earned">Lograda</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
