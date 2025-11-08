/**
 * Domain層: ユーザーリポジトリインターフェース
 * データアクセスの抽象化。具体的な実装はData層で行う
 */
import { User, CreateUserDTO, UpdateUserDTO } from '../entities/User';

export interface IUserRepository {
  // ローカルDBとクラウドDBの両方からユーザーを取得
  getAll(): Promise<User[]>;

  // IDでユーザーを取得
  getById(id: string): Promise<User | null>;

  // ユーザーを作成（ローカル→クラウドに同期）
  create(user: CreateUserDTO): Promise<User>;

  // ユーザーを更新（ローカル→クラウドに同期）
  update(user: UpdateUserDTO): Promise<User>;

  // ユーザーを削除（ローカル→クラウドに同期）
  delete(id: string): Promise<void>;

  // クラウドDBと同期
  syncWithCloud(): Promise<void>;
}
