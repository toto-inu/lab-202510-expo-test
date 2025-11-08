import * as SQLite from 'expo-sqlite';
import { CREATE_USERS_TABLE, CREATE_AUTH_TOKENS_TABLE, User } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * データベースを初期化
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('app.db');

  // テーブル作成
  await db.execAsync(CREATE_USERS_TABLE);
  await db.execAsync(CREATE_AUTH_TOKENS_TABLE);

  return db;
}

/**
 * データベースインスタンスを取得
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

/**
 * ユーザー情報を保存または更新
 */
export async function saveUser(user: User): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT OR REPLACE INTO users (id, email, displayName, photoURL, createdAt, lastLoginAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.id, user.email, user.displayName, user.photoURL, user.createdAt, user.lastLoginAt]
  );
}

/**
 * ユーザーIDでユーザー情報を取得
 */
export async function getUserById(userId: string): Promise<User | null> {
  const database = await getDatabase();

  const result = await database.getFirstAsync<User>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );

  return result || null;
}

/**
 * ユーザー情報を削除
 */
export async function deleteUser(userId: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync('DELETE FROM users WHERE id = ?', [userId]);
}

/**
 * 最終ログイン時刻を更新
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const database = await getDatabase();

  await database.runAsync(
    'UPDATE users SET lastLoginAt = ? WHERE id = ?',
    [Date.now(), userId]
  );
}

/**
 * 全ユーザーを取得（デバッグ用）
 */
export async function getAllUsers(): Promise<User[]> {
  const database = await getDatabase();

  const results = await database.getAllAsync<User>('SELECT * FROM users');

  return results;
}
