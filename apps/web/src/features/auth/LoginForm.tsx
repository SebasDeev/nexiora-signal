import { useState, type FormEvent } from 'react';
import type { LoginPayload } from './types';
import './LoginForm.css';

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: LoginPayload) => Promise<void>;
}

export function LoginForm({
  isOpen,
  onClose,
  onSubmit,
}: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password) {
      setError('Ingresa tu usuario o correo y contraseña.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        identifier: cleanIdentifier,
        password,
      });

      setIdentifier('');
      setPassword('');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No fue posible iniciar sesión.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (event.currentTarget === event.target && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      className="login-backdrop"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <div className="login-header">
          <div>
            <p className="login-eyebrow">
              Nexiora Signal
            </p>

            <h2 id="login-title">
              Iniciar sesión
            </h2>

            <p className="login-subtitle">
              Accede a tu cuenta para continuar.
            </p>
          </div>

          <button
            className="login-close"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar inicio de sesión"
          >
            ×
          </button>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <label>
            Usuario o correo electrónico

            <input
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
              placeholder="Usuario o correo"
              autoComplete="username"
              autoFocus
              required
              disabled={isSubmitting}
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              minLength={6}
              required
              disabled={isSubmitting}
            />
          </label>

          {error && (
            <p
              className="login-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Ingresando…'
              : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </div>
  );
}