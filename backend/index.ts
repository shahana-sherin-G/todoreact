// Imports must use 'type' for type-only imports
import type { TodoDBRaw } from "./db"; 
import {
  FormatToDoClient,
  insert,
  selectAll,
  update,
  remove
} from "./db";

// Define interfaces for expected request bodies
interface NewTodoRequest { text: string; }
interface UpdateTodoRequest { completed: boolean; }

// CORS Headers: Allows communication from the frontend running on port 3000
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000", 
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

console.log("Bun server starting...");

Bun.serve({
  port: 3001,
  async fetch(req: Request) {
    
    // --- 1. Handle OPTIONS (Preflight) Request ---
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    
    const url = new URL(req.url);

    // --- GET /todos ---
    if (req.method === "GET" && url.pathname === "/todos") {
      try {
        const todos = selectAll.all() as TodoDBRaw[];
        return new Response(JSON.stringify(todos.map(FormatToDoClient)), {
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (e) {
         return new Response(JSON.stringify({ error: "Database query failed." }), { 
             status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } 
         });
      }
    }

    // --- POST /todos ---
    if (req.method === "POST" && url.pathname === "/todos") {
      try {
        const body = await req.json() as NewTodoRequest; 
        const { text } = body; 

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return new Response(JSON.stringify({ error: "Invalid input: 'text' must be a non-empty string." }), { 
              status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }

        const result = insert.get(text.trim(), 0) as TodoDBRaw; 

        return new Response(JSON.stringify(FormatToDoClient(result)), {
          status: 201, 
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON format." }), { 
            status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }
    }

    // --- PATCH /todos/:id and DELETE /todos/:id ---
    if (url.pathname.startsWith("/todos/") && url.pathname.split('/').length === 3) {
      const idString = url.pathname.split('/').pop();
      const id = parseInt(idString || '', 10);

      if (isNaN(id)) {
        return new Response(JSON.stringify({ error: `Invalid ID format: "${idString}"` }), { 
            status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }

      if (req.method === "PATCH") {
        try {
          const body = await req.json() as UpdateTodoRequest;
          const { completed } = body; 
  
          if (typeof completed !== 'boolean') {
            return new Response(JSON.stringify({ error: "Invalid input: 'completed' must be a boolean." }), { 
                status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
            });
          }
          
          const completedValue = completed ? 1 : 0; 
          
          const info = update.run(completedValue, id);
          
          if (info.changes === 0) {
             return new Response(JSON.stringify({ error: `Todo with ID ${id} not found.` }), { 
                 status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } 
             });
          }
          
          return new Response(null, { status: 204, headers: corsHeaders }); 
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid JSON or internal server error." }), { 
              status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }
      }

      if (req.method === "DELETE") {
        try {
          const info = remove.run(id);

          if (info.changes === 0) {
             return new Response(JSON.stringify({ error: `Todo with ID ${id} not found.` }), { 
                 status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } 
             });
          }
          
          return new Response(null, { status: 204, headers: corsHeaders }); 
        } catch (e) {
          return new Response(JSON.stringify({ error: "Internal server error during deletion." }), { 
              status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }
      }
    }
    
    // Default fallback response
    return new Response("Route Not Found", { status: 404, headers: corsHeaders });
  },
});

console.log("Bun server running on http://localhost:3001");