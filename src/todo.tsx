import React, { useState } from 'react';
import { useLocalStorage } from '@mantine/hooks'; // Import the Mantine hook
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
} from '@mantine/core';
import { IconCircleCheck, IconTrash } from '@tabler/icons-react';

// Define the type for a Todo item
interface TodoItemType {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  // Replace useState with useLocalStorage
  // 'mantine-todos' is the key under which data will be stored in localStorage
  const [todos, setTodos] = useLocalStorage<TodoItemType[]>({
    key: 'mantine-todos',
    defaultValue: [], // Default value if nothing is found in local storage
  });
  
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim() === '') return;
    const newTodo: TodoItemType = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };
    // Updating 'todos' automatically updates local storage
    setTodos([...todos, newTodo]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
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
            <Group p="apart">
              <Checkbox
                label={todo.text}
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                styles={{ label: { textDecoration: todo.completed ? 'line-through' : 'none' } }}
              />
              <ActionIcon color="red" onClick={() => deleteTodo(todo.id)} variant="light">
                <IconTrash style={{ width: '70%', height: '70%' }} />
              </ActionIcon>
            </Group>
          </List.Item>
        ))}
      </List>
    </Container>
  );
};

export default TodoApp;
