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

    const query = `
      SELECT
        g.*,
        json_group_array(
          json_object(
            'round_id', r.round_id,
            'round_number', r.round_number,
            'answer', r.answer,
            'category', r.category,
            'clues', (
              SELECT json_group_array(
                json_object(
                  'clue_id', c.clue_id,
                  'clue_number', c.clue_number,
                  'clue_text', c.clue_text,
                  'percent_correct', c.percent_correct,
                  'points', c.points
                )
              )
              FROM clues c
              WHERE c.round_id = r.round_id
              ORDER BY c.clue_number
            )
          )
        ) AS rounds
      FROM games g
      LEFT JOIN rounds r ON g.game_id = r.game_id
      WHERE g.game_id = ?
      GROUP BY g.game_id
    `;
    const game = await context.env.DB.prepare(query).bind(id).first();

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the JSON string of rounds back into an array
    if (game.rounds) {
      game.rounds = JSON.parse(game.rounds);
      // Filter out null entries if there are no rounds
      if (game.rounds.length === 1 && !game.rounds[0].round_id) {
        game.rounds = [];
      }
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
    const { title, published, is_active } = await context.request.json();

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!title && published === undefined && is_active === undefined) {
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
    if (published !== undefined) {
      updates.push("published = ?");
      bindings.push(published);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      bindings.push(is_active ? 1 : 0);
    }
    bindings.push(id);

    const query = `UPDATE games SET ${updates.join(", ")} WHERE game_id = ?`;
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

    // First delete related clues and rounds to maintain referential integrity
    await context.env.DB.prepare(`
      DELETE FROM clues
      WHERE round_id IN (
        SELECT round_id FROM rounds WHERE game_id = ?
      )
    `).bind(id).run();

    await context.env.DB.prepare(`
      DELETE FROM rounds WHERE game_id = ?
    `).bind(id).run();

    // Now delete the game
    const query = `DELETE FROM games WHERE game_id = ?`;
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
