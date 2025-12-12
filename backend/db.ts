import { Database } from "bun:sqlite";

// Connect to the database file named "mydb.sqlite"
const db = new Database("mydb.sqlite", { create: true });

// Create the table structure if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0
  );
`);

// Interface matching the raw data structure in SQLite
export interface TodoDBRaw {
  id: number;
  text: string;
  completed: number; 
}

// Function to convert DB integer (0/1) to client boolean (true/false)
export const FormatToDoClient = (todo: TodoDBRaw) => {
  return {
    id: todo.id,
    text: todo.text,
    completed: Boolean(todo.completed),
  };
}

// Prepare SQL statements once for efficiency and EXPORT them
export const insert = db.prepare("INSERT INTO todos (text, completed) VALUES (?, ?) RETURNING id, text, completed");
export const selectAll = db.prepare("SELECT * FROM todos ORDER BY id DESC");
export const update = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
export const remove = db.prepare("DELETE FROM todos WHERE id = ?");

console.log("Database and table prepared successfully.");