// データベーススキーマ定義

export interface User {
  id: string; // Firebase UID
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  lastLoginAt: number;
}

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    displayName TEXT,
    photoURL TEXT,
    createdAt INTEGER NOT NULL,
    lastLoginAt INTEGER NOT NULL
  );
`;

export const CREATE_AUTH_TOKENS_TABLE = `
  CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    token TEXT NOT NULL,
    expiresAt INTEGER,
    createdAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
  );
`;
