import {
  CheckCircle2,
  Loader2,
  Plus,
  Shield,
  Trash2,
  UserRound,
  UserX,
  X,
} from 'lucide-react';

import {
  useState,
  type FormEvent,
} from 'react';

import type {
  CreateManagedUserPayload,
  ManagedUser,
  ManagedUserRole,
} from '@/features/users/users.api';



interface UserManagementProps {
  users: ManagedUser[];
  loading: boolean;
  error: string | null;
  mutationError: string | null;

  onCreateUser: (
    payload: CreateManagedUserPayload,
  ) => Promise<ManagedUser>;

  onChangeRole: (
    userId: string,
    role: ManagedUserRole,
  ) => Promise<ManagedUser>;

  onToggleStatus: (
    user: ManagedUser,
  ) => Promise<ManagedUser>;

  onDeleteUser: (
    userId: string,
  ) => Promise<void>;

  onClearMutationError: () => void;
}

const ROLE_LABELS: Record<
  ManagedUserRole,
  string
> = {
  CITIZEN: 'Ciudadano',
  LEADER: 'Líder',
  TECHNICIAN: 'Técnico',
};

const ROLE_OPTIONS: ManagedUserRole[] = [
  'CITIZEN',
  'LEADER',
  'TECHNICIAN',
];

export function UserManagement({
  users,
  loading,
  error,
  mutationError,
  onCreateUser,
  onChangeRole,
  onToggleStatus,
  onDeleteUser,
  onClearMutationError,
}: UserManagementProps) {
  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);
    
  const [userPendingDelete, setUserPendingDelete] =
  useState<ManagedUser | null>(null);

  const [form, setForm] =
    useState<CreateManagedUserPayload>({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      role: 'CITIZEN',
    });

  const [formError, setFormError] =
    useState<string | null>(null);

  function updateField(
    field: keyof CreateManagedUserPayload,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setFormError(
        'Completa todos los campos obligatorios.',
      );
      return;
    }

    try {
      await onCreateUser({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username
          .trim()
          .toLowerCase(),
        email: form.email
          .trim()
          .toLowerCase(),
        phone:
          form.phone?.trim() || undefined,
      });

      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'CITIZEN',
      });

      setIsCreateOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible crear el usuario.',
      );
    }
  }

  async function handleRoleChange(
    user: ManagedUser,
    role: ManagedUserRole,
  ) {
    if (user.role === role) {
      return;
    }

    setProcessingId(user.id);

    try {
        onClearMutationError();
      await onChangeRole(user.id, role);
    } catch {
        // El error ya fue almacenado por useUsers.
    } finally {
      setProcessingId(null);
    }
  }

  async function handleToggleStatus(
    user: ManagedUser,
  ) {
    setProcessingId(user.id);

    try {
        onClearMutationError();
      await onToggleStatus(user);
    } catch {
        // El error ya fue almacenado por useUsers.
    } finally {
      setProcessingId(null);
    }
  }

  function handleDelete(user: ManagedUser) {
  onClearMutationError();
  setUserPendingDelete(user);
}

async function confirmDeleteUser() {
  if (!userPendingDelete) {
    return;
  }

  const user = userPendingDelete;

  setProcessingId(user.id);
  onClearMutationError();

  try {
    await onDeleteUser(user.id);
    setUserPendingDelete(null);
  } catch {
    // El error ya fue almacenado por useUsers.
  } finally {
    setProcessingId(null);
  }
}

  return (
    <section className="control-center">
      <section className="control-center-intro">
        <div>
          <p className="control-center-eyebrow">
            <Shield size={15} />
            Administración
          </p>

          <h1>Gestión de usuarios</h1>

          <p>
            Administra las cuentas y asigna los
            roles operativos de Nexiora Signal.
          </p>
        </div>

        <button
          type="button"
          className="control-primary-button"
          onClick={() => {
            setFormError(null);
            setIsCreateOpen(true);
          }}
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </section>

      {error && (
        <div className="control-error-state">
          <UserX size={18} />
          <span>{error}</span>
        </div>
      )}
      {mutationError && (
  <div className="admin-mutation-error" role="alert">
    <UserX size={18} />

    <div>
      <strong>No se pudo completar la operación</strong>
      <span>{mutationError}</span>
    </div>

    <button
      type="button"
      onClick={onClearMutationError}
      aria-label="Cerrar mensaje de error"
    >
      <X size={16} />
    </button>
  </div>
)}

      <section className="admin-users-card">
        <div className="control-card-heading">
          <div>
            <p>Directorio</p>
            <h2>Usuarios registrados</h2>
          </div>

          <span className="admin-users-count">
            {users.length} usuarios
          </span>
        </div>

        {loading ? (
          <div className="control-loading-state">
            <Loader2
              className="animate-spin"
              size={24}
            />
            <span>
              Cargando usuarios...
            </span>
          </div>
        ) : users.length === 0 ? (
          <div className="control-empty-state">
            <UserRound size={30} />
            <p>
              No hay usuarios registrados.
            </p>
          </div>
        ) : (
          <div className="admin-users-list">
            {users.map((user) => {
              const isAdmin =
                user.role === 'ADMIN';

              const processing =
                processingId === user.id;

              return (
                <article
                  key={user.id}
                  className="admin-user-row"
                >
                  <div className="admin-user-identity">
                    <div className="admin-user-avatar">
                      {user.firstName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {user.firstName}{' '}
                        {user.lastName}
                      </strong>

                      <span>
                        @{user.username}
                      </span>

                      <small>
                        {user.email}
                      </small>
                    </div>
                  </div>

                  <div className="admin-user-role">
                    {isAdmin ? (
                      <span className="admin-role-badge">
                        <Shield size={14} />
                        Administrador
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        disabled={processing}
                        onChange={(event) =>
                          void handleRoleChange(
                            user,
                            event.target
                              .value as ManagedUserRole,
                          )
                        }
                      >
                        {ROLE_OPTIONS.map(
                          (role) => (
                            <option
                              key={role}
                              value={role}
                            >
                              {
                                ROLE_LABELS[
                                  role
                                ]
                              }
                            </option>
                          ),
                        )}
                      </select>
                    )}
                  </div>

                  <div className="admin-user-status">
                    {user.isActive ? (
                      <span className="admin-status-active">
                        <CheckCircle2
                          size={14}
                        />
                        Activo
                      </span>
                    ) : (
                      <span className="admin-status-inactive">
                        Inactivo
                      </span>
                    )}
                  </div>

                  {!isAdmin && (
                    <div className="admin-user-actions">
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          void handleToggleStatus(
                            user,
                          )
                        }
                      >
                        {processing ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : user.isActive ? (
                          'Desactivar'
                        ) : (
                          'Activar'
                        )}
                      </button>

                      <button
                        type="button"
                        className="is-danger"
                        disabled={processing}
                        onClick={() =>
                          void handleDelete(
                            user,
                          )
                        }
                        aria-label={`Eliminar a ${user.firstName}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isCreateOpen && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsCreateOpen(false);
            }
          }}
        >
          <div className="admin-user-modal">
            <div className="admin-modal-header">
              <div>
                <p>Nuevo registro</p>
                <h2>Crear usuario</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(false)
                }
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-user-form"
              onSubmit={handleCreateUser}
            >
              <div className="admin-form-grid">
                <label>
                  Nombre
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      updateField(
                        'firstName',
                        event.target.value,
                      )
                    }
                    placeholder="Nombre"
                  />
                </label>

                <label>
                  Apellido
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      updateField(
                        'lastName',
                        event.target.value,
                      )
                    }
                    placeholder="Apellido"
                  />
                </label>

                <label>
                  Usuario
                  <input
                    value={form.username}
                    onChange={(event) =>
                      updateField(
                        'username',
                        event.target.value,
                      )
                    }
                    placeholder="usuario"
                    autoComplete="off"
                  />
                </label>

                <label>
                  Correo electrónico
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="correo@ejemplo.com"
                  />
                </label>

                <label>
                  Contraseña
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField(
                        'password',
                        event.target.value,
                      )
                    }
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    value={form.phone ?? ''}
                    onChange={(event) =>
                      updateField(
                        'phone',
                        event.target.value,
                      )
                    }
                    placeholder="Opcional"
                  />
                </label>

                <label>
                  Rol inicial
                  <select
                    value={form.role}
                    onChange={(event) =>
                      updateField(
                        'role',
                        event.target
                          .value as ManagedUserRole,
                      )
                    }
                  >
                    {ROLE_OPTIONS.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {
                            ROLE_LABELS[
                              role
                            ]
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              {formError && (
                <div className="control-error-state">
                  <UserX size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="control-secondary-button"
                  onClick={() =>
                    setIsCreateOpen(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="control-primary-button"
                >
                  <Plus size={17} />
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {userPendingDelete && (
  <div
    className="admin-delete-backdrop"
    role="presentation"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setUserPendingDelete(null);
      }
    }}
  >
    <div
      className="admin-delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-user-title"
    >
      <div className="admin-delete-icon">
        <Trash2 size={22} />
      </div>

      <div className="admin-delete-content">
        <p>Eliminar usuario</p>

        <h2 id="delete-user-title">
          ¿Eliminar esta cuenta?
        </h2>

        <span>
          Estás a punto de eliminar a{' '}
          <strong>
            {userPendingDelete.firstName}{' '}
            {userPendingDelete.lastName}
          </strong>
          .
        </span>

        <small>
          Esta acción eliminará permanentemente
          la cuenta y no se puede deshacer.
        </small>
      </div>

      <div className="admin-delete-actions">
        <button
          type="button"
          className="control-secondary-button"
          disabled={
            processingId ===
            userPendingDelete.id
          }
          onClick={() =>
            setUserPendingDelete(null)
          }
        >
          Cancelar
        </button>

        <button
          type="button"
          className="admin-delete-confirm"
          disabled={
            processingId ===
            userPendingDelete.id
          }
          onClick={() =>
            void confirmDeleteUser()
          }
        >
          {processingId ===
          userPendingDelete.id ? (
            <>
              <Loader2
                size={16}
                className="animate-spin"
              />
              Eliminando...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Eliminar usuario
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}
