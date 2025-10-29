import { StyleSheet, TextInput, Pressable, FlatList, View } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTodo, type Todo } from '@/hooks/use-todo';

export default function TodoScreen() {
  const {
    todos,
    inputText,
    editingId,
    editText,
    addTodo,
    updateInputText,
    updateEditText,
    toggleTodo,
    deleteTodo,
    startEdit,
    saveEdit,
    cancelEdit,
  } = useTodo();

  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'icon');

  const renderTodo = ({ item }: { item: Todo }) => {
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <ThemedView style={[styles.todoItem, { borderColor }]}>
          <TextInput
            style={[styles.editInput, { color: textColor, borderColor }]}
            value={editText}
            onChangeText={updateEditText}
            autoFocus
          />
          <View style={styles.editActions}>
            <Pressable onPress={saveEdit} style={[styles.button, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.buttonText}>保存</ThemedText>
            </Pressable>
            <Pressable onPress={cancelEdit} style={[styles.button, styles.cancelButton]}>
              <ThemedText style={styles.buttonText}>キャンセル</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={[styles.todoItem, { borderColor }]}>
        <Pressable onPress={() => toggleTodo(item.id)} style={styles.todoContent}>
          <View style={[styles.checkbox, { borderColor }]}>
            {item.completed && <View style={[styles.checkboxInner, { backgroundColor: tintColor }]} />}
          </View>
          <ThemedText style={[
            styles.todoText,
            item.completed && styles.completedText
          ]}>
            {item.text}
          </ThemedText>
        </Pressable>
        <View style={styles.actions}>
          <Pressable onPress={() => startEdit(item)} style={styles.actionButton}>
            <ThemedText style={{ color: tintColor }}>編集</ThemedText>
          </Pressable>
          <Pressable onPress={() => deleteTodo(item.id)} style={styles.actionButton}>
            <ThemedText style={{ color: '#ff4444' }}>削除</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Todo App' }} />
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Todo リスト</ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            value={inputText}
            onChangeText={updateInputText}
            placeholder="新しいTodoを入力..."
            placeholderTextColor={borderColor}
            onSubmitEditing={addTodo}
          />
          <Pressable onPress={addTodo} style={[styles.addButton, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.addButtonText}>追加</ThemedText>
          </Pressable>
        </ThemedView>

        <FlatList
          data={todos}
          renderItem={renderTodo}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Todoがありません</ThemedText>
            </ThemedView>
          }
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  todoItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 4,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    opacity: 0.5,
  },
});
