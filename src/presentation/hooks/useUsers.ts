/**
 * Presentation層: ユーザー管理カスタムフック
 * コンポーネントで使用するビジネスロジックを提供
 */
import { useState, useEffect, useCallback } from 'react';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';
import DIContainer from '../../di/container';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const userRepository = DIContainer.getInstance().getUserRepository();

  /**
   * ユーザー一覧を読み込む
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await userRepository.getAll();
      setUsers(fetchedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, [userRepository]);

  /**
   * ユーザーを作成
   */
  const createUser = useCallback(
    async (userDTO: CreateUserDTO): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const newUser = await userRepository.create(userDTO);
        setUsers((prev) => [newUser, ...prev]);
        return newUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create user');
        console.error('Error creating user:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userRepository]
  );

  /**
   * ユーザーを更新
   */
  const updateUser = useCallback(
    async (userDTO: UpdateUserDTO): Promise<User | null> => {
      try {
        setLoading(true);
        setError(null);
        const updatedUser = await userRepository.update(userDTO);
        setUsers((prev) =>
          prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
        return updatedUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update user');
        console.error('Error updating user:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userRepository]
  );

  /**
   * ユーザーを削除
   */
  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await userRepository.delete(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
        console.error('Error deleting user:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userRepository]
  );

  /**
   * クラウドと同期
   */
  const syncWithCloud = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      await userRepository.syncWithCloud();
      await loadUsers(); // 同期後に再読み込み
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync with cloud');
      console.error('Error syncing with cloud:', err);
    } finally {
      setSyncing(false);
    }
  }, [userRepository, loadUsers]);

  /**
   * 初回ロード
   */
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    syncing,
    createUser,
    updateUser,
    deleteUser,
    syncWithCloud,
    refreshUsers: loadUsers,
  };
};
