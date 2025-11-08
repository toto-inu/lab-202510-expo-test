import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { saveUser, updateLastLogin, deleteUser, initDatabase } from '../database/db';
import { User } from '../database/schema';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // データベース初期化
    initDatabase();

    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // ユーザー情報をSQLiteに保存
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: firebaseUser.metadata.creationTime
            ? new Date(firebaseUser.metadata.creationTime).getTime()
            : Date.now(),
          lastLoginAt: Date.now(),
        };

        await saveUser(userData);
        await updateLastLogin(firebaseUser.uid);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * メール・パスワードでサインイン
   */
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  /**
   * メール・パスワードでサインアップ
   */
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 表示名を設定
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  /**
   * サインアウト
   */
  const signOut = async () => {
    try {
      if (user) {
        await deleteUser(user.uid);
      }
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('サインアウトに失敗しました');
    }
  };

  /**
   * プロフィール更新
   */
  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    try {
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }

      await updateProfile(user, {
        displayName: displayName !== undefined ? displayName : user.displayName,
        photoURL: photoURL !== undefined ? photoURL : user.photoURL,
      });

      // SQLiteも更新
      const userData: User = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName !== undefined ? displayName : user.displayName,
        photoURL: photoURL !== undefined ? photoURL : user.photoURL,
        createdAt: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).getTime()
          : Date.now(),
        lastLoginAt: Date.now(),
      };

      await saveUser(userData);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('プロフィールの更新に失敗しました');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Firebaseエラーコードを日本語メッセージに変換
 */
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません';
    case 'auth/operation-not-allowed':
      return 'この操作は許可されていません';
    case 'auth/weak-password':
      return 'パスワードが弱すぎます（6文字以上推奨）';
    case 'auth/user-disabled':
      return 'このアカウントは無効化されています';
    case 'auth/user-not-found':
      return 'ユーザーが見つかりません';
    case 'auth/wrong-password':
      return 'パスワードが正しくありません';
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません';
    default:
      return '認証エラーが発生しました';
  }
}
