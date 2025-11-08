/**
 * Presentation層: ユーザー管理コンポーネント
 * ローカルDB + クラウドDB連携のデモ
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUsers } from '../hooks/useUsers';
import { User } from '../../domain/entities/User';

export const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    error,
    syncing,
    createUser,
    updateUser,
    deleteUser,
    syncWithCloud,
    refreshUsers,
  } = useUsers();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('エラー', '名前とメールアドレスを入力してください');
      return;
    }

    const result = await createUser({ name: name.trim(), email: email.trim() });
    if (result) {
      setName('');
      setEmail('');
      Alert.alert('成功', 'ユーザーを作成しました');
    }
  };

  const handleUpdate = async (user: User) => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('エラー', '名前とメールアドレスを入力してください');
      return;
    }

    const result = await updateUser({
      id: user.id,
      name: name.trim(),
      email: email.trim(),
    });

    if (result) {
      setEditingId(null);
      setName('');
      setEmail('');
      Alert.alert('成功', 'ユーザーを更新しました');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      '確認',
      'このユーザーを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUser(id);
            if (success) {
              Alert.alert('成功', 'ユーザーを削除しました');
            }
          },
        },
      ]
    );
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setEmail('');
  };

  const handleSync = async () => {
    Alert.alert(
      '確認',
      'クラウドと同期しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '同期',
          onPress: async () => {
            await syncWithCloud();
            Alert.alert('成功', 'クラウドとの同期が完了しました');
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userDate}>
          作成: {item.createdAt.toLocaleDateString('ja-JP')}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => startEdit(item)}
        >
          <Text style={styles.buttonText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ユーザー管理デモ</Text>
      <Text style={styles.subtitle}>
        ローカルDB（SQLite）+ クラウドDB（モック）連携
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 入力フォーム */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="名前"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.formButtons}>
          {editingId ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={() => {
                  const user = users.find((u) => u.id === editingId);
                  if (user) handleUpdate(user);
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>更新</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelEdit}
              >
                <Text style={styles.buttonText}>キャンセル</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.createButton]}
              onPress={handleCreate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>作成</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.syncButton]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>クラウド同期</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={refreshUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>更新</Text>
        </TouchableOpacity>
      </View>

      {/* ユーザーリスト */}
      {loading && !syncing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ユーザーがいません</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncButton: {
    backgroundColor: '#FF9800',
  },
  refreshButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 16,
  },
});
