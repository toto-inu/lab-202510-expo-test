/**
 * Data層: リモートユーザーデータソース（モックアップ）
 * クラウドDBへのAPIアクセスを担当
 * 実際の環境では、ここでREST APIやGraphQLを呼び出す
 */
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';

export class RemoteUserDataSource {
  private baseUrl: string;
  private mockDelay: number = 500; // ネットワーク遅延をシミュレート

  constructor(baseUrl: string = 'https://api.example.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * モックAPIレスポンスをシミュレート
   */
  private async mockApiCall<T>(response: T): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, this.mockDelay));
    console.log('[Mock API] Request completed');
    return response;
  }

  async getAll(): Promise<User[]> {
    console.log(`[Mock API] GET ${this.baseUrl}/users`);

    // モックデータ
    const mockUsers: User[] = [
      {
        id: 'cloud-1',
        name: 'Cloud User 1',
        email: 'cloud1@example.com',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'cloud-2',
        name: 'Cloud User 2',
        email: 'cloud2@example.com',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      },
    ];

    return this.mockApiCall(mockUsers);
  }

  async getById(id: string): Promise<User | null> {
    console.log(`[Mock API] GET ${this.baseUrl}/users/${id}`);

    const mockUser: User = {
      id,
      name: `Cloud User ${id}`,
      email: `cloud-${id}@example.com`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.mockApiCall(mockUser);
  }

  async create(user: CreateUserDTO): Promise<User> {
    console.log(`[Mock API] POST ${this.baseUrl}/users`, user);

    const newUser: User = {
      id: `cloud-${Date.now()}`,
      name: user.name,
      email: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.mockApiCall(newUser);
  }

  async update(user: UpdateUserDTO): Promise<User> {
    console.log(`[Mock API] PUT ${this.baseUrl}/users/${user.id}`, user);

    const updatedUser: User = {
      id: user.id,
      name: user.name || 'Updated Name',
      email: user.email || 'updated@example.com',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date(),
    };

    return this.mockApiCall(updatedUser);
  }

  async delete(id: string): Promise<void> {
    console.log(`[Mock API] DELETE ${this.baseUrl}/users/${id}`);
    await this.mockApiCall(undefined);
  }

  /**
   * クラウドDBとの同期処理
   * 実際の環境では、差分同期や競合解決のロジックを実装
   */
  async syncUsers(localUsers: User[]): Promise<User[]> {
    console.log(`[Mock API] POST ${this.baseUrl}/users/sync`, {
      count: localUsers.length,
    });

    // モック: ローカルのユーザーをクラウドに送信し、
    // クラウドから最新のデータを受信
    const syncedUsers = localUsers.map(user => ({
      ...user,
      updatedAt: new Date(), // 同期時刻を更新
    }));

    return this.mockApiCall(syncedUsers);
  }
}
