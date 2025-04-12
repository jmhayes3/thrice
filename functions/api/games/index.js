// functions/api/games/index.js - For collection operations

export const onRequestGet = async (context) => {
  try {
    const { searchParams } = new URL(context.request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    let games;
    let total;

    // Regular paginated query with clues and rounds
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
      GROUP BY g.game_id
      ORDER BY g.published DESC
      LIMIT ? OFFSET ?
    `;
    games = await context.env.DB.prepare(query).bind(limit, offset).all();

    const countResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as count FROM games",
    ).first();
    total = countResult.count;

    return new Response(
      JSON.stringify({
        games: games.results,
        pagination: {
          total,
          limit,
          offset,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error listing games:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const onRequestPost = async (context) => {
  try {
    const { title, published } = await context.request.json();

    // Validate required fields
    if (!title || !published) {
      return new Response(
        JSON.stringify({ error: "Title and published date are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Insert the game into the database
    const query = `
      INSERT INTO games (title, published, is_active)
      VALUES (?, ?, 0)
      RETURNING game_id
    `;

    const result = await context.env.DB.prepare(query)
      .bind(title, published)
      .first();
    const gameId = result.game_id;

    return new Response(JSON.stringify({ id: gameId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating game:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
