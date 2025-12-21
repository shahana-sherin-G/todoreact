import { serve } from "bun";
import index from "./index.html";
import { insert, selectAll, update, remove, type TodoDBRaw } from "./db";

interface NewTodoRequest { text: string; }
interface UpdateTodoRequest { completed: boolean; }

// server.ts
const PORT = Bun.env.PORTs;
const HOST = process.env.host || "localhost";





   function gettodo( req:Request){
    try {
        const todos = selectAll.all() as TodoDBRaw[];
        return Response.json(todos);
      } catch {
        return Response.json({ error: "Database query failed." }, { status: 500 });
      }

   }
  async function createtodo( req:Request){
    try {
        const body = await req.json() as NewTodoRequest;
        const { text } = body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return Response.json({ error: "Invalid input: 'text' must be a non-empty string." }, { status: 400 });
        }

        const result = insert.get(text.trim(), 0) as TodoDBRaw;
        return Response.json(result, { status: 201 });
      } catch {
        return Response.json({ error: "Invalid JSON format." }, { status: 400 });
      }

  
    
  }

  async function updatetodo( req:Request, id:number){
    try {
          const body = await req.json() as UpdateTodoRequest;
          const { completed } = body;

          if (typeof completed !== 'boolean') {
            return  Response.json({ error: "Invalid input: 'completed' must be a boolean." }, { status: 400 });
          }

          const completedValue = completed ? 1 : 0;
          const info = update.run(completedValue, id);

          if (info.changes === 0) {
            return  Response.json({ error: `Todo with ID ${id} not found.` }, { status: 404 });
          }

          return Response.json(null, { status: 204 });
        } catch {
          return Response.json({ error: "Invalid JSON or internal server error." }, { status: 400 });
        }

  }
  function deletetodo(req:Request, id:number){
    try {
          const info = remove.run(id);

          if (info.changes === 0) {
            return Response.json({ error: `Todo with ID ${id} not found.` }, { status: 404 });
          }

          return Response.json(null, { status: 204 });
        } catch {
          return Response.json({ error: "Internal server error during deletion." }, { status: 500 });
        }

  }

  const server = serve({

  port: PORT,
  hostname: HOST,
  routes: {
    "/": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({ message: "Hello, world!", method: "GET" });
      },
      async PUT(req) {
        return Response.json({ message: "Hello, world!", method: "PUT" });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({ message: `Hello, ${name}!` });
    },
  },

  async fetch(req: Request) {
    const url = new URL(req.url);

    if (url.pathname === "/todos") {

      if (req.method === "GET") { return gettodo(req); }

       if (req.method === "POST") { return createtodo(req); }
    }
    if (url.pathname.startsWith("/todos/")) {
      const idString = url.pathname.split('/').pop();
      const id = Number(idString);

      if (isNaN(id)) {
        return Response.json({ error: `Invalid ID format: "${idString}"` }, { status: 400 });
      }

      if (req.method === "PATCH") { return updatetodo(req, id); }

      if (req.method === "DELETE") { return deletetodo(req, id); }
    }
    

    return new Response("Route Not Found", { status: 404 });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
