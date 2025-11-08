/**
 * Data層: ユーザーリポジトリ実装
 * ローカルDBとリモートDBを統合し、データの一貫性を保証
 */
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';
import { LocalUserDataSource } from '../datasources/LocalUserDataSource';
import { RemoteUserDataSource } from '../datasources/RemoteUserDataSource';

export class UserRepository implements IUserRepository {
  private localDataSource: LocalUserDataSource;
  private remoteDataSource: RemoteUserDataSource;

  constructor(
    localDataSource: LocalUserDataSource,
    remoteDataSource: RemoteUserDataSource
  ) {
    this.localDataSource = localDataSource;
    this.remoteDataSource = remoteDataSource;
  }

  /**
   * ローカルDBからユーザーを取得
   * オフラインファーストアプローチ
   */
  async getAll(): Promise<User[]> {
    try {
      // まずローカルから取得
      const localUsers = await this.localDataSource.getAll();
      console.log(`[Repository] Fetched ${localUsers.length} users from local DB`);

      return localUsers;
    } catch (error) {
      console.error('[Repository] Error fetching users:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const user = await this.localDataSource.getById(id);
      return user;
    } catch (error) {
      console.error(`[Repository] Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * ユーザーを作成
   * 1. ローカルDBに保存
   * 2. バックグラウンドでクラウドに同期
   */
  async create(userDTO: CreateUserDTO): Promise<User> {
    try {
      // ローカルに作成
      const user = await this.localDataSource.create(userDTO);
      console.log('[Repository] User created in local DB:', user.id);

      // バックグラウンドでクラウドに同期（非同期）
      this.syncUserToCloud(user).catch((error) => {
        console.error('[Repository] Failed to sync user to cloud:', error);
      });

      return user;
    } catch (error) {
      console.error('[Repository] Error creating user:', error);
      throw error;
    }
  }

  /**
   * ユーザーを更新
   * 1. ローカルDBを更新
   * 2. バックグラウンドでクラウドに同期
   */
  async update(userDTO: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.localDataSource.update(userDTO);
      console.log('[Repository] User updated in local DB:', user.id);

      // バックグラウンドでクラウドに同期
      this.syncUserToCloud(user).catch((error) => {
        console.error('[Repository] Failed to sync updated user to cloud:', error);
      });

      return user;
    } catch (error) {
      console.error('[Repository] Error updating user:', error);
      throw error;
    }
  }

  /**
   * ユーザーを削除
   * 1. ローカルDBから削除
   * 2. クラウドからも削除
   */
  async delete(id: string): Promise<void> {
    try {
      await this.localDataSource.delete(id);
      console.log('[Repository] User deleted from local DB:', id);

      // クラウドからも削除
      await this.remoteDataSource.delete(id);
      console.log('[Repository] User deleted from cloud:', id);
    } catch (error) {
      console.error('[Repository] Error deleting user:', error);
      throw error;
    }
  }

  /**
   * クラウドDBと同期
   * 双方向同期を実装
   */
  async syncWithCloud(): Promise<void> {
    try {
      console.log('[Repository] Starting cloud synchronization...');

      // 1. 未同期のローカルデータを取得
      const unsyncedUsers = await this.localDataSource.getUnsyncedUsers();
      console.log(`[Repository] Found ${unsyncedUsers.length} unsynced users`);

      // 2. 未同期データをクラウドに送信
      if (unsyncedUsers.length > 0) {
        await this.remoteDataSource.syncUsers(unsyncedUsers);

        // 同期完了のマークを付ける
        for (const user of unsyncedUsers) {
          await this.localDataSource.markAsSynced(user.id);
        }
        console.log('[Repository] Local changes synced to cloud');
      }

      // 3. クラウドから最新データを取得
      const cloudUsers = await this.remoteDataSource.getAll();
      console.log(`[Repository] Fetched ${cloudUsers.length} users from cloud`);

      // 4. ローカルDBを更新
      for (const cloudUser of cloudUsers) {
        await this.localDataSource.upsert(cloudUser, true);
      }

      console.log('[Repository] Cloud synchronization completed');
    } catch (error) {
      console.error('[Repository] Error during cloud sync:', error);
      throw error;
    }
  }

  /**
   * 個別のユーザーをクラウドに同期（プライベートメソッド）
   */
  private async syncUserToCloud(user: User): Promise<void> {
    try {
      const userDTO: CreateUserDTO = {
        name: user.name,
        email: user.email,
      };

      await this.remoteDataSource.create(userDTO);
      await this.localDataSource.markAsSynced(user.id);
      console.log('[Repository] User synced to cloud:', user.id);
    } catch (error) {
      console.error('[Repository] Failed to sync user to cloud:', error);
      throw error;
    }
  }
}
