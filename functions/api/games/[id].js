// functions/api/games/[id].js - For individual game operations

export async function onRequestGet(context) {
  try {
    const { id } = context.params;

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const query = `SELECT * FROM games WHERE id = ?`;
    const game = await context.env.DB.prepare(query).bind(id).first();

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(game), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPatch(context) {
  try {
    const { id } = context.params;
    const { title, content } = await context.request.json();

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!title && !content) {
      return new Response(
        JSON.stringify({ error: "No valid fields to update" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Build dynamic update query based on provided fields
    const updates = [];
    const bindings = [];
    if (title) {
      updates.push("title = ?");
      bindings.push(title);
    }
    if (content) {
      updates.push("content = ?");
      bindings.push(content);
    }
    bindings.push(id);

    const query = `UPDATE games SET ${updates.join(", ")} WHERE id = ?`;
    const result = await context.env.DB.prepare(query)
      .bind(...bindings)
      .run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error updating game:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { id } = context.params;

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const query = `DELETE FROM games WHERE id = ?`;
    const result = await context.env.DB.prepare(query).bind(id).run();

    if (result.meta.changes === 0) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return no content for successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting game:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
