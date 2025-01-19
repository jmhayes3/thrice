// functions/api/games/index.js - For collection operations

export const onRequestGet = async (context) => {
  try {
    const { searchParams } = new URL(context.request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let games;
    let total;

    if (search) {
      // Use vector search if search parameter is provided
      const results = await context.env.VECTOR_INDEX.query(search, {
        limit,
        offset
      });

      // Fetch full game details for the matching IDs
      const ids = results.matches.map(match => match.id);
      const query = `SELECT * FROM games WHERE id IN (${ids.map(() => '?').join(',')})`;
      games = await context.env.DB.prepare(query)
        .bind(...ids)
        .all();
      total = results.total;
    } else {
      // Regular paginated query
      const query = `
        SELECT * FROM games
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      games = await context.env.DB.prepare(query)
        .bind(limit, offset)
        .all();

      const countResult = await context.env.DB.prepare('SELECT COUNT(*) as count FROM games')
        .first();
      total = countResult.count;
    }

    return new Response(
      JSON.stringify({
        games: games.results,
        pagination: {
          total,
          limit,
          offset
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error listing games:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

export const onRequestPost = async (context) => {
  try {
    const { title, content } = await context.request.json();

    // Validate required fields
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a UUID for the new game
    const id = crypto.randomUUID();

    // Insert the game into the database
    const query = `
      INSERT INTO games (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;

    await context.env.DB.prepare(query)
      .bind(id, title, content)
      .run();

    // Add to vector index
    await context.env.VECTOR_INDEX.upsert({
      id,
      content
    });

    return new Response(
      JSON.stringify({ id }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error creating game:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
