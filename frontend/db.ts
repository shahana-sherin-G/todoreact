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
  completed: boolean; 
}

// Prepare SQL statements once for efficiency and EXPORT them
export const insert = db.prepare("INSERT INTO todos (text, completed) VALUES (?, ?) RETURNING id, text, completed");
export const selectAll = db.prepare("SELECT * FROM todos ORDER BY id DESC");
export const update = db.prepare("UPDATE todos SET completed = ? WHERE id = ?");
export const remove = db.prepare("DELETE FROM todos WHERE id = ?");

console.log("Database and table prepared successfully.");


const myVar = 0;

if (myVar) {
  console.log("My variable is truthy.");
} else {
  console.log("My variable is falsy.");
}