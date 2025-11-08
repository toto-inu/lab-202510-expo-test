/**
 * Data層: ユーザーデータモデル
 * データベースとのマッピングを行う
 */
import { User } from '../../domain/entities/User';

export interface UserModel {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  synced: number; // 0: 未同期, 1: 同期済み
}

export class UserMapper {
  static toDomain(model: UserModel): User {
    return {
      id: model.id,
      name: model.name,
      email: model.email,
      createdAt: new Date(model.created_at),
      updatedAt: new Date(model.updated_at),
    };
  }

  static toModel(domain: User, synced: boolean = false): UserModel {
    return {
      id: domain.id,
      name: domain.name,
      email: domain.email,
      created_at: domain.createdAt.toISOString(),
      updated_at: domain.updatedAt.toISOString(),
      synced: synced ? 1 : 0,
    };
  }
}
