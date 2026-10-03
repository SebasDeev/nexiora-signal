import { Check, ClipboardCheck, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

import './ReportSuccessModal.css';

interface ReportSuccessModalProps {
  isOpen: boolean;
  reportCode: string;
  onClose: () => void;
}

export function ReportSuccessModal({ isOpen, reportCode, onClose }: ReportSuccessModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="report-success-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section
        className="report-success-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-success-title"
        aria-describedby="report-success-description"
      >
        <button ref={closeButtonRef} type="button" className="report-success-close" onClick={onClose} aria-label="Cerrar confirmación">
          <X size={19} aria-hidden="true" />
        </button>

        <div className="report-success-orbit" aria-hidden="true">
          <span className="report-success-check"><Check size={38} strokeWidth={2.7} /></span>
        </div>
        <p className="report-success-eyebrow">Reporte registrado</p>
        <h2 id="report-success-title">Gracias por alertar a tu ciudad</h2>
        <p id="report-success-description" className="report-success-description">
          Recibimos tu reporte y el Centro de Control lo revisará para coordinar la atención necesaria.
        </p>

        <div className="report-success-code" aria-label={`Código de reporte ${reportCode || 'asignado'}`}>
          <ClipboardCheck size={18} aria-hidden="true" />
          <div>
            <span>Tu número de seguimiento</span>
            <strong>{reportCode || 'Código asignado'}</strong>
          </div>
        </div>
        <p className="report-success-note">Podrás usar este código para consultar el estado de la incidencia.</p>
        <button type="button" className="report-success-action" onClick={onClose}>Entendido</button>
      </section>
    </div>
  );
}
