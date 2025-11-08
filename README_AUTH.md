# React Native 認証機能セットアップガイド

このプロジェクトにはFirebase Authenticationを使用した認証機能が統合されています。

## 機能概要

- **Firebase Authentication**: メール/パスワード認証
- **SQLite**: ユーザー情報のローカル保存
- **認証ガード**: 未認証ユーザーのリダイレクト
- **モックAPI**: 将来のNestJSバックエンド連携用

## プロジェクト構成

```
.
├── app/
│   ├── (auth)/               # 認証関連画面
│   │   ├── login.tsx         # ログイン画面
│   │   ├── signup.tsx        # サインアップ画面
│   │   └── _layout.tsx       # 認証レイアウト
│   ├── (tabs)/               # メイン画面（認証後）
│   │   ├── index.tsx         # ホーム画面
│   │   ├── explore.tsx       # プロフィール画面
│   │   └── _layout.tsx       # タブレイアウト
│   └── _layout.tsx           # ルートレイアウト（認証ガード）
├── config/
│   └── firebase.ts           # Firebase設定
├── contexts/
│   └── AuthContext.tsx       # 認証コンテキスト
├── database/
│   ├── schema.ts             # SQLiteスキーマ定義
│   └── db.ts                 # SQLite操作関数
├── services/
│   └── api.ts                # モックAPIサービス
└── .env.example              # 環境変数のサンプル
```

## セットアップ手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト設定で「ウェブアプリを追加」を選択
4. Firebase設定情報をコピー

### 2. 環境変数の設定

`.env.example` をコピーして `.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` ファイルにFirebaseの設定情報を入力：

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Authenticationの有効化

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「メール/パスワード」認証を有効化

### 4. 依存パッケージのインストール

```bash
npm install
```

### 5. アプリの起動

```bash
# 開発サーバー起動
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 使い方

### ユーザー登録

1. アプリを起動すると、ログイン画面が表示されます
2. 「アカウントをお持ちでない方はこちら」をタップ
3. メールアドレスとパスワード（6文字以上）を入力
4. 「登録」ボタンをタップ

### ログイン

1. メールアドレスとパスワードを入力
2. 「ログイン」ボタンをタップ
3. 認証成功後、自動的にホーム画面に遷移

### ログアウト

1. プロフィールタブを開く
2. 「ログアウト」ボタンをタップ
3. 確認ダイアログで「ログアウト」を選択

## 認証フロー

```
起動
  ↓
認証状態チェック
  ↓
├─ 未認証 → ログイン画面
│     ↓
│   ログイン/登録
│     ↓
└─ 認証済み → メイン画面（タブ）
      ↓
    ログアウト
      ↓
    ログイン画面
```

## データベース（SQLite）

### ユーザー情報の保存

認証成功時、以下の情報がSQLiteに保存されます：

- ユーザーID（Firebase UID）
- メールアドレス
- 表示名
- プロフィール画像URL
- 作成日時
- 最終ログイン日時

### データベーステーブル

**users テーブル**
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  displayName TEXT,
  photoURL TEXT,
  createdAt INTEGER NOT NULL,
  lastLoginAt INTEGER NOT NULL
);
```

**auth_tokens テーブル**
```sql
CREATE TABLE auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  token TEXT NOT NULL,
  expiresAt INTEGER,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users (id)
);
```

## モックAPI（将来のNestJS連携）

`services/api.ts` には、将来的にNestJSバックエンドと連携するためのモックAPIが実装されています。

### 実装済みモック関数

- `fetchUserProfile(userId)`: ユーザープロフィール取得
- `updateUserProfileAPI(userId, data)`: プロフィール更新
- `verifyTokenWithBackend()`: トークン検証

### NestJSバックエンドとの連携方法

1. NestJSサーバーで Firebase Admin SDK を設定
2. トークン検証ミドルウェアを実装
3. `.env` の `EXPO_PUBLIC_API_URL` を実際のAPIエンドポイントに変更
4. `services/api.ts` のコメントアウトされたコードを有効化

## トラブルシューティング

### ログインエラー

- **メールアドレスまたはパスワードが正しくありません**
  - 入力内容を確認してください
  - パスワードは6文字以上必要です

- **このメールアドレスは既に使用されています**
  - 別のメールアドレスで登録するか、ログイン画面からログインしてください

### Firebase設定エラー

- **Firebase設定が正しくありません**
  - `.env` ファイルの設定を確認
  - Firebase Consoleの設定と一致しているか確認

### ビルドエラー

```bash
# キャッシュをクリア
npm start -- --clear

# node_modules を再インストール
rm -rf node_modules
npm install
```

## セキュリティに関する注意

- `.env` ファイルは `.gitignore` に追加し、Gitにコミットしないでください
- 本番環境では、環境変数をセキュアに管理してください（Expo Secrets、GitHub Secretsなど）
- Firebase Authenticationのセキュリティルールを適切に設定してください

## 今後の拡張

- [ ] プロフィール編集機能
- [ ] パスワードリセット機能
- [ ] ソーシャルログイン（Google, Apple）
- [ ] 生体認証（指紋、Face ID）
- [ ] メール確認機能
- [ ] NestJSバックエンドとの完全統合

## 参考リンク

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
