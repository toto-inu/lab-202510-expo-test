/**
 * Data層: ローカルユーザーデータソース
 * SQLiteデータベースへの直接アクセスを担当
 */
import DatabaseService from '../database/DatabaseService';
import { UserModel, UserMapper } from '../models/UserModel';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/User';

export class LocalUserDataSource {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  async getAll(): Promise<User[]> {
    const db = this.dbService.getDatabase();
    const result = await db.getAllAsync<UserModel>('SELECT * FROM users ORDER BY created_at DESC');
    return result.map(UserMapper.toDomain);
  }

  async getById(id: string): Promise<User | null> {
    const db = this.dbService.getDatabase();
    const result = await db.getFirstAsync<UserModel>('SELECT * FROM users WHERE id = ?', [id]);
    return result ? UserMapper.toDomain(result) : null;
  }

  async getUnsyncedUsers(): Promise<User[]> {
    const db = this.dbService.getDatabase();
    const result = await db.getAllAsync<UserModel>('SELECT * FROM users WHERE synced = 0');
    return result.map(UserMapper.toDomain);
  }

  async create(user: CreateUserDTO): Promise<User> {
    const db = this.dbService.getDatabase();
    const id = this.generateId();
    const now = new Date().toISOString();

    await db.runAsync(
      'INSERT INTO users (id, name, email, created_at, updated_at, synced) VALUES (?, ?, ?, ?, ?, ?)',
      [id, user.name, user.email, now, now, 0]
    );

    const createdUser: User = {
      id,
      name: user.name,
      email: user.email,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    return createdUser;
  }

  async update(user: UpdateUserDTO): Promise<User> {
    const db = this.dbService.getDatabase();
    const now = new Date().toISOString();

    const existing = await this.getById(user.id);
    if (!existing) {
      throw new Error(`User with id ${user.id} not found`);
    }

    const updatedName = user.name ?? existing.name;
    const updatedEmail = user.email ?? existing.email;

    await db.runAsync(
      'UPDATE users SET name = ?, email = ?, updated_at = ?, synced = 0 WHERE id = ?',
      [updatedName, updatedEmail, now, user.id]
    );

    return {
      id: user.id,
      name: updatedName,
      email: updatedEmail,
      createdAt: existing.createdAt,
      updatedAt: new Date(now),
    };
  }

  async delete(id: string): Promise<void> {
    const db = this.dbService.getDatabase();
    await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = this.dbService.getDatabase();
    await db.runAsync('UPDATE users SET synced = 1 WHERE id = ?', [id]);
  }

  async upsert(user: User, synced: boolean = true): Promise<void> {
    const db = this.dbService.getDatabase();
    const model = UserMapper.toModel(user, synced);

    await db.runAsync(
      `INSERT OR REPLACE INTO users (id, name, email, created_at, updated_at, synced)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [model.id, model.name, model.email, model.created_at, model.updated_at, model.synced]
    );
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
