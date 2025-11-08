# モバイルアプリケーション アーキテクチャドキュメント

## 概要

このプロジェクトは、**Clean Architecture + Repository パターン**を採用したReact Native（Expo）アプリケーションです。ローカルDB（SQLite）とクラウドDB（モックアップAPI）の連携を実装しています。

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation層                         │
│  ┌─────────────┐         ┌──────────────────┐          │
│  │ Components  │ ◄────── │  Custom Hooks    │          │
│  └─────────────┘         └──────────────────┘          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     Domain層                             │
│  ┌─────────────┐         ┌──────────────────┐          │
│  │  Entities   │         │  Repository I/F  │          │
│  └─────────────┘         └──────────────────┘          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                      Data層                              │
│  ┌──────────────────────────────────────────┐           │
│  │         Repository Implementation         │           │
│  └──────┬──────────────────────────┬────────┘           │
│         │                          │                     │
│  ┌──────▼──────────┐      ┌───────▼─────────┐          │
│  │ LocalDataSource │      │ RemoteDataSource │          │
│  │   (SQLite)      │      │   (Mock API)     │          │
│  └─────────────────┘      └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

## ディレクトリ構造

```
src/
├── domain/                    # ドメイン層（ビジネスロジック）
│   ├── entities/              # エンティティ
│   │   └── User.ts            # ユーザーエンティティ
│   └── repositories/          # リポジトリインターフェース
│       └── IUserRepository.ts # ユーザーリポジトリI/F
│
├── data/                      # データ層（データアクセス）
│   ├── database/              # データベース管理
│   │   └── DatabaseService.ts # SQLite初期化・管理
│   ├── models/                # データモデル
│   │   └── UserModel.ts       # ユーザーDBモデル & マッパー
│   ├── datasources/           # データソース
│   │   ├── LocalUserDataSource.ts   # ローカルDB操作
│   │   └── RemoteUserDataSource.ts  # クラウドAPI操作
│   └── repositories/          # リポジトリ実装
│       └── UserRepository.ts  # ユーザーリポジトリ実装
│
├── presentation/              # プレゼンテーション層（UI）
│   ├── hooks/                 # カスタムフック
│   │   └── useUsers.ts        # ユーザー管理フック
│   └── components/            # UIコンポーネント
│       └── UserManagement.tsx # ユーザー管理画面
│
└── di/                        # 依存性注入
    └── container.ts           # DIコンテナ
```

## 各層の役割

### 1. Domain層（ドメイン層）

**責務**: ビジネスロジックとビジネスルールの定義

- **Entities**: ビジネスの中核となるデータモデル
  - フレームワークやDBに依存しない純粋なビジネスモデル
  - 例: `User`エンティティ

- **Repository Interfaces**: データアクセスの抽象化
  - 具体的な実装に依存しないインターフェース
  - Data層がこのインターフェースを実装

### 2. Data層（データ層）

**責務**: データの永続化と取得

- **DataSources**: データの入出力を担当
  - `LocalUserDataSource`: SQLiteへの直接アクセス
  - `RemoteUserDataSource`: クラウドAPIへのアクセス（モック）

- **Repositories**: データソースを統合し、Domain層のインターフェースを実装
  - ローカルとリモートのデータを統合
  - オフラインファースト戦略の実装
  - データ同期ロジック

- **Models**: DBとドメインモデルのマッピング
  - `UserModel`: DB格納用のモデル
  - `UserMapper`: DB ⇔ Domain エンティティの変換

- **Database**: データベース管理
  - SQLiteの初期化とテーブル作成

### 3. Presentation層（プレゼンテーション層）

**責務**: UIとユーザーインタラクション

- **Hooks**: ビジネスロジックとUIを繋ぐ
  - `useUsers`: ユーザーCRUD操作とState管理
  - Repositoryを使ってデータ操作

- **Components**: React コンポーネント
  - `UserManagement`: ユーザー管理UI

### 4. DI（依存性注入）

**責務**: 各層の依存関係を管理

- `DIContainer`: シングルトンパターンでインスタンスを管理
  - データベース初期化
  - DataSourceとRepositoryの生成

## 主要な機能

### 1. オフラインファースト戦略

- データはまずローカルDB（SQLite）に保存
- ローカルでの操作は即座に完了
- バックグラウンドでクラウドに同期

### 2. データ同期

```typescript
// 未同期データをマーク
synced: 0  // 未同期
synced: 1  // 同期済み

// 同期フロー
1. ローカルで作成/更新 → synced = 0
2. バックグラウンドでクラウドに送信
3. 成功したら synced = 1 に更新
```

### 3. CRUD操作

- **Create**: ローカル → クラウド（非同期）
- **Read**: ローカルから読み込み
- **Update**: ローカル → クラウド（非同期）
- **Delete**: ローカル & クラウド両方から削除

### 4. クラウド同期

- 手動同期トリガー
- 未同期データをクラウドに送信
- クラウドから最新データを取得
- ローカルDBを更新

## データフロー例

### ユーザー作成の流れ

```
[UI Component]
    │
    ▼
[useUsers Hook]
    │
    ▼
[UserRepository]
    │
    ├─► [LocalUserDataSource]  ← ローカルに保存（即座に完了）
    │       │
    │       ▼
    │   [SQLite DB]
    │
    └─► [RemoteUserDataSource] ← クラウドに同期（バックグラウンド）
            │
            ▼
        [Mock API]
```

### データ取得の流れ

```
[UI Component]
    │
    ▼
[useUsers Hook]
    │
    ▼
[UserRepository]
    │
    ▼
[LocalUserDataSource]
    │
    ▼
[SQLite DB] ← オフラインでも動作
```

## 使用方法

### 1. アプリ起動時

```typescript
// app/_layout.tsx
const container = DIContainer.getInstance();
await container.initialize(); // DBとリポジトリを初期化
```

### 2. コンポーネントでの使用

```typescript
import { useUsers } from '@/src/presentation/hooks/useUsers';

function MyComponent() {
  const { users, createUser, updateUser, deleteUser, syncWithCloud } = useUsers();

  // ユーザー作成
  const handleCreate = async () => {
    await createUser({ name: 'John', email: 'john@example.com' });
  };

  // クラウド同期
  const handleSync = async () => {
    await syncWithCloud();
  };

  return (
    // UI
  );
}
```

## テスト戦略

### 単体テスト

- **Domain層**: ビジネスロジックのテスト
- **Data層**: 各DataSourceとRepositoryのテスト
- **Presentation層**: Hooksとコンポーネントのテスト

### モック

- `RemoteUserDataSource`は既にモック実装
- 本番環境では実際のAPIエンドポイントに置き換え

## 拡張方法

### 新しいエンティティを追加する場合

1. `src/domain/entities/`にエンティティを作成
2. `src/domain/repositories/`にリポジトリインターフェースを作成
3. `src/data/models/`にモデルとマッパーを作成
4. `src/data/datasources/`にLocalとRemoteのDataSourceを作成
5. `src/data/repositories/`にリポジトリ実装を作成
6. `src/di/container.ts`にインスタンス生成ロジックを追加
7. `src/presentation/hooks/`にカスタムフックを作成

## アーキテクチャの利点

1. **関心の分離**: 各層が明確な責務を持つ
2. **テスタビリティ**: インターフェースによる依存性の抽象化
3. **保守性**: 変更の影響範囲が限定的
4. **拡張性**: 新機能追加が容易
5. **独立性**: UIやDBを変更しても他の層に影響しない

## 技術スタック

- **フレームワーク**: React Native (Expo)
- **言語**: TypeScript
- **ローカルDB**: SQLite (expo-sqlite)
- **状態管理**: React Hooks
- **アーキテクチャ**: Clean Architecture + Repository Pattern

## 参考資料

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
