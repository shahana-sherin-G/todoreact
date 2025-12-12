import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  TextInput,
  Button,
  List,
  ThemeIcon,
  Checkbox,
  ActionIcon,
  Group,
  Paper,
  Text,
  Loader,
} from '@mantine/core';
import { IconCircleCheck, IconTrash } from '@tabler/icons-react';

// Define the type for a Todo item
interface TodoItemType {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  // Use a more standard variable name
  const API_URL = 'http://localhost:3001/todos'; 
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState(''); // Moved input state here

  const fetchTodos = async () => {
    setLoading(true);
    setError(null); // Reset error before new fetch
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTodos();
  }, []);

  // CORRECTED: Added 'async', fixed the fetch call, corrected braces.
  const addTodo = async () => { 
    if (input.trim() === '') return;
    
    try {
      // Use the global fetch function
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const newTodo = await response.json();
      setTodos((prev) => [newTodo, ...prev]); // Use functional update
      setInput('');

    } catch (error) {
      setError((error as Error).message);
    }
  };

  // CORRECTED: Added 'async', fixed the try/catch brace placement.
  const toggleTodo = async (id: number, currentcompleted: boolean) => {
    // Optimistic Update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentcompleted }),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      
    } catch (error) { // Correct catch placement
      setError((error as Error).message);
      console.error(error);
      // Revert UI on failure
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: currentcompleted } : todo
        )
      );
    }
  };

  // CORRECTED: Ensure 'async' is present.
  const deleteTodo = async (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id)); // Use functional update
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
    } catch (error) {
      setError((error as Error).message);
      console.error(error);
      fetchTodos(); // Re-fetch todos to restore deleted item
    } 
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={1} ta="center" mb="lg">Mantine Todo List</Title>
      
      <Paper shadow="xs" p="md" mb="md">
        <Group>
          <TextInput
            style={{ flexGrow: 1 }}
            placeholder="Enter a new task"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={(event) => event.key === 'Enter' && addTodo()}
          />
          <Button onClick={addTodo}>Add Todo</Button>
        </Group>
      </Paper>
      {loading && <Group justify="center"><Loader size="md" /></Group>}
      {error && <Text color="red" ta="center">{error}</Text>}
      {!loading && !error && todos.length === 0 && <Text ta="center">No tasks yet! Add one above.</Text>}

      {!loading && !error && (
        <List
          spacing="xs"
          size="sm"
          center
          icon={
            <ThemeIcon color="teal" size={24} radius="xl">
              <IconCircleCheck style={{ width: '70%', height: '70%' }} />
            </ThemeIcon>
          }
        >
          {todos.map((todo) => (
            <List.Item key={todo.id}>
              <Group justify="space-between" align="center" style={{ width: '100%' }}>
                <Checkbox
                  label={todo.text}
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  styles={{ label: { textDecoration: todo.completed ? 'line-through' : 'none' } }}
                />
                <ActionIcon color="red" onClick={() => deleteTodo(todo.id)} variant="light">
                  <IconTrash style={{ width: '70%', height: '70%' }} />
                </ActionIcon>
              </Group>
            </List.Item>
          ))}
        </List>
      )}
    </Container>
  );
};

export default TodoApp;