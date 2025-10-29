import { useState } from 'react';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface UseTodoReturn {
  todos: Todo[];
  inputText: string;
  setInputText: (text: string) => void;
  editingId: string | null;
  editText: string;
  setEditText: (text: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  startEdit: (todo: Todo) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
}

export function useTodo(): UseTodoReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: inputText.trim(),
          completed: false,
        },
      ]);
      setInputText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return {
    todos,
    inputText,
    setInputText,
    editingId,
    editText,
    setEditText,
    addTodo,
    toggleTodo,
    deleteTodo,
    startEdit,
    saveEdit,
    cancelEdit,
  };
}
