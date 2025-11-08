import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('エラー', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.circle"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          プロフィール
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.infoContainer}>
        <ThemedText type="subtitle">ユーザー情報</ThemedText>

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>表示名:</ThemedText>
          <ThemedText>{user?.displayName || '未設定'}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>メールアドレス:</ThemedText>
          <ThemedText>{user?.email}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>ユーザーID:</ThemedText>
          <ThemedText style={styles.userId}>{user?.uid}</ThemedText>
        </View>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={loading}
        >
          <ThemedText style={styles.signOutButtonText}>
            {loading ? 'ログアウト中...' : 'ログアウト'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'column',
    gap: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: '600',
    opacity: 0.7,
  },
  userId: {
    fontSize: 12,
    fontFamily: Fonts.mono,
  },
  buttonContainer: {
    marginTop: 24,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
