import { auth } from '../config/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * APIリクエストのヘッダーを取得（認証トークン含む）
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (user) {
    // Firebase IDトークンを取得
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * モックAPI: ユーザープロフィールを取得
 * 将来的にNestJSバックエンドに置き換え
 */
export async function fetchUserProfile(userId: string): Promise<any> {
  try {
    const headers = await getAuthHeaders();

    // TODO: 実際のAPIエンドポイントに置き換え
    // const response = await fetch(`${API_URL}/users/${userId}`, { headers });
    // return await response.json();

    // モックレスポンス
    console.log('[MOCK API] Fetching user profile for:', userId);
    return {
      id: userId,
      email: auth.currentUser?.email,
      displayName: auth.currentUser?.displayName,
      photoURL: auth.currentUser?.photoURL,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * モックAPI: ユーザープロフィールを更新
 * 将来的にNestJSバックエンドに置き換え
 */
export async function updateUserProfileAPI(userId: string, data: any): Promise<any> {
  try {
    const headers = await getAuthHeaders();

    // TODO: 実際のAPIエンドポイントに置き換え
    // const response = await fetch(`${API_URL}/users/${userId}`, {
    //   method: 'PATCH',
    //   headers,
    //   body: JSON.stringify(data),
    // });
    // return await response.json();

    // モックレスポンス
    console.log('[MOCK API] Updating user profile for:', userId, data);
    return {
      ...data,
      id: userId,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * モックAPI: Firebase IDトークンをバックエンドで検証
 * 将来的にNestJSバックエンドに置き換え
 */
export async function verifyTokenWithBackend(): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();

    // TODO: 実際のAPIエンドポイントに置き換え
    // const response = await fetch(`${API_URL}/auth/verify`, {
    //   method: 'POST',
    //   headers,
    // });
    // return response.ok;

    // モックレスポンス
    console.log('[MOCK API] Verifying token with backend');
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}
