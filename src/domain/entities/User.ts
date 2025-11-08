/**
 * Domain層: ユーザーエンティティ
 * ビジネスロジックの中心となるドメインモデル
 */
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  id: string;
  name?: string;
  email?: string;
}
