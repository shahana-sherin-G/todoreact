import { memo } from "react";
import { Checkbox, ActionIcon, Group, Paper } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

interface Todo {
  id: number;
  text: string;
  completed: number;
}

interface Props {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

const TodoItem = memo(({ todo, onToggle, onDelete }: Props) => (
  <Paper withBorder p="sm" shadow="xs">
    <Group justify="space-between">
      <Checkbox
        checked={Boolean(todo.completed)}
        onChange={() => onToggle(todo)}
        label={todo.text}
        styles={{ label: { cursor: "pointer" } }}
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

export default TodoItem;
