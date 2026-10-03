import { useCallback, useEffect, useState } from 'react';

import {
  createManagedUser,
  deleteManagedUser,
  getUsers,
  updateManagedUser,
} from './users.api';

import type {
  CreateManagedUserPayload,
  ManagedUser,
  ManagedUserRole,
  UpdateManagedUserPayload,
} from './users.api';

export function useUsers(accessToken?: string) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!accessToken) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUsers(accessToken);
      setUsers(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar los usuarios.',
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const createUser = useCallback(
    async (payload: CreateManagedUserPayload) => {
      if (!accessToken) {
        throw new Error('La sesión no es válida.');
      }

      setMutationError(null);

      try {
        const user = await createManagedUser(
          accessToken,
          payload,
        );

        setUsers((current) => [user, ...current]);

        return user;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible crear el usuario.';

        setMutationError(message);
        throw error;
      }
    },
    [accessToken],
  );

  const updateUser = useCallback(
    async (
      userId: string,
      payload: UpdateManagedUserPayload,
    ) => {
      if (!accessToken) {
        throw new Error('La sesión no es válida.');
      }

      setMutationError(null);

      try {
        const updatedUser = await updateManagedUser(
          accessToken,
          userId,
          payload,
        );

        setUsers((current) =>
          current.map((user) =>
            user.id === userId
              ? updatedUser
              : user,
          ),
        );

        return updatedUser;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible actualizar el usuario.';

        setMutationError(message);
        throw error;
      }
    },
    [accessToken],
  );

  const changeRole = useCallback(
    async (
      userId: string,
      role: ManagedUserRole,
    ) => {
      return updateUser(userId, { role });
    },
    [updateUser],
  );

  const toggleUserStatus = useCallback(
    async (user: ManagedUser) => {
      return updateUser(user.id, {
        isActive: !user.isActive,
      });
    },
    [updateUser],
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (!accessToken) {
        throw new Error('La sesión no es válida.');
      }

      setMutationError(null);

      try {
        await deleteManagedUser(
          accessToken,
          userId,
        );

        setUsers((current) =>
          current.filter(
            (user) => user.id !== userId,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No fue posible eliminar el usuario.';

        setMutationError(message);
        throw error;
      }
    },
    [accessToken],
  );

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  return {
    users,
    loading,
    error,
    mutationError,
    loadUsers,
    createUser,
    updateUser,
    changeRole,
    toggleUserStatus,
    removeUser,
    clearMutationError,
  };
}