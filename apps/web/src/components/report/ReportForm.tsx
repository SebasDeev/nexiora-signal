import { useEffect, useState, type FormEvent } from 'react';
import type { Coordinates } from '../../types/location';
import type { CreateReportPayload, Severity } from '../../types/report';
import './ReportForm.css';

interface ReportFormProps {
  isOpen: boolean;
  location: Coordinates | null;
  onClose: () => void;
  onSubmit: (report: CreateReportPayload) => Promise<void>;
}

const severityOptions: Array<{ value: Severity; label: string }> = [
  { value: 'LOW', label: 'Leve' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

export function ReportForm({
  isOpen,
  location,
  onClose,
  onSubmit,
}: ReportFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setSeverity('MEDIUM');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const hasLocation = location !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!location) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        severity,
        latitude: location[0],
        longitude: location[1],
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No fue posible enviar el reporte.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="report-form-backdrop">
      <section
        className="report-form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-form-title"
      >
        <div className="report-form-header">
          <div>
            <p className="report-form-eyebrow">Nuevo reporte</p>
            <h2 id="report-form-title">Reportar semáforo</h2>
          </div>

          <button
            className="report-form-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          <label>
            Título
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej.: Semáforo apagado"
              minLength={5}
              maxLength={120}
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe brevemente lo que sucede."
              minLength={10}
              maxLength={500}
              rows={4}
              required
            />
          </label>

          <label>
            Gravedad
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
            >
              {severityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="report-location">
            <span>Ubicación del reporte</span>

            {hasLocation ? (
              <strong>
                {location[0].toFixed(6)}, {location[1].toFixed(6)}
              </strong>
            ) : (
              <p>
                Esperando tu ubicación. Debes permitir el acceso a la ubicación
                para poder enviar un reporte.
              </p>
            )}
          </div>

          {error && <p className="report-form-error">{error}</p>}

          <div className="report-form-actions">
            <button className="button-secondary" type="button" onClick={onClose}>
              Cancelar
            </button>

            <button
              className="button-primary"
              type="submit"
              disabled={!hasLocation || isSubmitting}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}