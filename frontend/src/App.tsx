import '@mantine/core/styles.css'; // Import Mantine core styles once at the top
import { MantineProvider } from '@mantine/core';
import TodoApp from './TodoApp';




export default function App() {
  return (
    <MantineProvider defaultColorScheme="light">
       <TodoApp />
    </MantineProvider>
  );
}
