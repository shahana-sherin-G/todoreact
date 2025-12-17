import { useEffect, useState, useCallback, memo } from "react";
import {
  Container,
  Title,
  TextInput,
  Button,
  Checkbox,
  ActionIcon,
  Group,
  Paper,
  Loader,
  Text,
  Stack,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

const API_URL = "http://localhost:3000";

interface Todo {
  id: number;
  text: string;
  completed: number; 
}
const TodoItem = memo(({ 
  todo, 
  onToggle, 
  onDelete 
}: { 
  todo: Todo; 
  onToggle: (todo: Todo) => void; 
  onDelete: (id: number) => void; 
}) => (
  <Paper withBorder p="sm" shadow="xs">
    <Group justify="space-between">
      <Checkbox
        checked={Boolean(todo.completed)}
        onChange={() => onToggle(todo)}
        label={todo.text}
        styles={{ label: { cursor: 'pointer' } }}
      />
      <ActionIcon
        color="red"
        variant="subtle"
        onClick={() => onDelete(todo.id)}
      >
        <IconTrash size={18} />
      </ActionIcon>
    </Group>
  </Paper>
));

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setTodos)
      .catch(() => setError("Failed to load todos"))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input.trim() }),
      });
      if (!res.ok) throw new Error();
      const newTodo: Todo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setInput("");
      setError(null);
    } catch {
      setError("Failed to add todo");
    }
  };

  const toggleTodo = useCallback(async (todo: Todo) => {
    const originalTodos = [...todos];
    setTodos(prev =>
      prev.map(t =>
        t.id === todo.id ? { ...t, completed: t.completed ? 0 : 1 } : t
      )
    );

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Backend expects 'boolean', frontend state uses 'number'
        body: JSON.stringify({ completed: todo.completed === 0 }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTodos(originalTodos); 
      setError("Failed to update status");
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: number) => {
    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setTodos(originalTodos); 
      setError("Failed to delete item");
    }
  }, [todos]);

  if (loading) return <Container mt="xl" ta="center"><Loader size="lg" /></Container>;

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="md">Bun SQLite Todo</Title>
      {error && <Text c="red" mb="sm" size="sm">{error}</Text>}
      
      <Group mb="md">
        <TextInput
          placeholder="Add new todo"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          style={{ flex: 1 }}
        />
        <Button onClick={addTodo}>Add</Button>
      </Group>

      
      <Stack gap="sm">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </Stack>
    </Container>
  );
}