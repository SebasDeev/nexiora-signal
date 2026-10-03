import { MapPin, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { FAILURE_OPTIONS, getFailureOption } from '@/features/reports/report-catalog';
import type { Coordinates } from '@/types/location';
import type { CreateReportPayload, FailureType } from '@/types/report';

import { PhotoUploader } from './PhotoUploader';
import './ReportForm.css';

interface ReportFormProps {
  isOpen: boolean;
  location: Coordinates | null;
  onClose: () => void;
  onSubmit: (report: CreateReportPayload) => Promise<void>;
}

export function ReportForm({ isOpen, location, onClose, onSubmit }: ReportFormProps) {
  const [description, setDescription] = useState('');
  const [failureType, setFailureType] = useState<FailureType>('POWER_OFF');
  const [image, setImage] = useState<File | null>(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!isOpen) return;

    setDescription('');
    setFailureType('POWER_OFF');
    setImage(null);
    setAddress('');
    setError(null);

    const timer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const descriptionLength = description.length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!location) {
      setError('Selecciona la ubicación del incidente en el mapa para continuar.');
      return;
    }

    const failure = getFailureOption(failureType);
    if (!failure) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: failure.label,
        description: description.trim(),
        severity: failure.severity,
        latitude: location[0],
        longitude: location[1],
        address: address.trim() || undefined,
        image: image ?? undefined,
        failureType,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No fue posible enviar el reporte. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div
      className="report-form-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) handleClose();
      }}
    >
      <section
        className="report-form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-form-title"
        aria-describedby="report-form-introduction"
      >
        <header className="report-form-header">
          <div className="report-form-heading">
            <p className="report-form-eyebrow"><Sparkles size={13} aria-hidden="true" />Aporta a una ciudad más segura</p>
            <h2 id="report-form-title">Reportar incidente</h2>
            <p id="report-form-introduction">Comparte los detalles para que el Centro de Control pueda actuar con rapidez.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="report-form-close"
            onClick={handleClose}
            aria-label="Cerrar formulario"
            disabled={isSubmitting}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <form className="report-form" onSubmit={handleSubmit}>
          <PhotoUploader image={image} preview={preview} onChange={setImage} disabled={isSubmitting} />

          <fieldset className="failure-type-fieldset" disabled={isSubmitting}>
            <legend className="report-field-heading">
              <span>¿Qué está ocurriendo?</span>
              <span>Selecciona una opción</span>
            </legend>
            <div className="failure-type-grid">
              {FAILURE_OPTIONS.map((option) => {
                const isSelected = failureType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFailureType(option.value)}
                    className={isSelected ? 'failure-type-card is-selected' : 'failure-type-card'}
                    aria-pressed={isSelected}
                  >
                    <span className="failure-type-icon" aria-hidden="true">{option.icon}</span>
                    <span className="failure-type-copy">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                    <span className="failure-type-indicator" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="report-form-field">
            <div className="report-field-heading">
              <label htmlFor="report-description">Descripción</label>
              <span aria-live="polite">{descriptionLength} / 1000</span>
            </div>
            <textarea
              id="report-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Cuéntanos qué ves, desde cuándo ocurre y cómo afecta la movilidad…"
              rows={5}
              minLength={10}
              maxLength={1000}
              required
              disabled={isSubmitting}
              aria-describedby="report-description-hint"
            />
            <p id="report-description-hint" className="report-field-hint">Incluye detalles útiles para facilitar la verificación.</p>
          </div>

          <div className="report-form-field">
            <div className="report-field-heading">
              <label htmlFor="report-address">Dirección o referencia</label>
              <span>Opcional</span>
            </div>
            <div className="report-input-shell">
              <MapPin size={18} aria-hidden="true" />
              <input
                id="report-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Ej.: Carrera 7 con Calle 72, frente al parque"
                maxLength={255}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={location ? 'report-location is-selected' : 'report-location'}>
            <span className="report-location-icon" aria-hidden="true"><MapPin size={19} /></span>
            <div>
              <span>Ubicación {location ? 'seleccionada' : 'pendiente'}</span>
              {location ? (
                <strong>{location[0].toFixed(5)}, {location[1].toFixed(5)}</strong>
              ) : (
                <p>Selecciona un punto en el mapa para poder enviar el reporte.</p>
              )}
            </div>
            <span className="report-location-status" aria-hidden="true" />
          </div>

          {error && <p className="report-form-error" role="alert">{error}</p>}

          <footer className="report-form-actions">
            <p className="report-form-secure-note">Tu información se transmite de forma segura.</p>
            <div>
              <button type="button" className="report-button-secondary" onClick={handleClose} disabled={isSubmitting}>Cancelar</button>
              <button type="submit" className="report-button-primary" disabled={!location || isSubmitting}>
                {isSubmitting ? <span className="report-button-spinner" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                {isSubmitting ? 'Enviando reporte…' : 'Enviar reporte'}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
