import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { UserManagement } from '@/src/presentation/components/UserManagement';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <UserManagement />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
