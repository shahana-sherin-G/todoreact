import { serve } from "bun";
import index from "./index.html";
import { insert, selectAll, update, remove, type TodoDBRaw } from "./db";

interface NewTodoRequest { text: string; }
interface UpdateTodoRequest { completed: boolean; }

const server = serve({
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

   
    if (req.method === "GET" && url.pathname === "/todos") {
      try {
        const todos = selectAll.all() as TodoDBRaw[];
        return Response.json(todos);
      } catch {
        return Response.json({ error: "Database query failed." }, { status: 500 });
      }
    }

    if (req.method === "POST" && url.pathname === "/todos") {
      try {
        const body = await req.json() as NewTodoRequest;
        const { text } = body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return new Response(JSON.stringify({ error: "Invalid input: 'text' must be a non-empty string." }), { status: 400 });
        }

        const result = insert.get(text.trim(), 0) as TodoDBRaw;
        return Response.json(result, { status: 201 });
      } catch {
        return Response.json({ error: "Invalid JSON format." }, { status: 400 });
      }
    }

    if (url.pathname.startsWith("/todos/") && url.pathname.split('/').length === 3) {
      const idString = url.pathname.split('/').pop();
      const id = parseInt(idString || '', 10);

      if (isNaN(id)) {
        return new Response(JSON.stringify({ error: `Invalid ID format: "${idString}"` }), { status: 400 });
      }

      // PATCH (update completed)
      if (req.method === "PATCH") {
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

     
      if (req.method === "DELETE") {
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
    }

    // --- Fallback ---
    return new Response("Route Not Found", { status: 404 });
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
