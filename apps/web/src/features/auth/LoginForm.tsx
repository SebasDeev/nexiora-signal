import { useState, type FormEvent } from 'react';
import type { LoginPayload } from '../../features/auth/types';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ email, password });
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

  return (
    <div className="login-backdrop">
      <section
        className="login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <div className="login-header">
          <div>
            <p className="login-eyebrow">Tu cuenta</p>
            <h2 id="login-title">Iniciar sesión</h2>
          </div>

          <button
            className="login-close"
            type="button"
            onClick={onClose}
            aria-label="Cerrar inicio de sesión"
          >
            ×
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              minLength={6}
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </section>
    </div>
  );
}