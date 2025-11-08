/**
 * DI Container: 依存性注入コンテナ
 * Repository、DataSourceのインスタンスを管理
 */
import DatabaseService from '../data/database/DatabaseService';
import { LocalUserDataSource } from '../data/datasources/LocalUserDataSource';
import { RemoteUserDataSource } from '../data/datasources/RemoteUserDataSource';
import { UserRepository } from '../data/repositories/UserRepository';
import { IUserRepository } from '../domain/repositories/IUserRepository';

class DIContainer {
  private static instance: DIContainer;
  private userRepository: IUserRepository | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // データベースを初期化
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();

    // データソースを作成
    const localDataSource = new LocalUserDataSource();
    const remoteDataSource = new RemoteUserDataSource();

    // リポジトリを作成
    this.userRepository = new UserRepository(localDataSource, remoteDataSource);

    this.isInitialized = true;
    console.log('[DIContainer] Initialized successfully');
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      throw new Error('DIContainer not initialized. Call initialize() first.');
    }
    return this.userRepository;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export default DIContainer;
