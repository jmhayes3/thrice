// functions/api/play/[id].js - For tracking game play session with a specific game

export async function onRequestPost(context) {
  try {
    const { id } = context.params;
    const { userId } = await context.request.json();

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid game ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate that the game exists and is active
    const gameQuery = `
      SELECT game_id, title, is_active
      FROM games
      WHERE game_id = ?
    `;
    const game = await context.env.DB.prepare(gameQuery).bind(id).first();

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!game.is_active) {
      return new Response(JSON.stringify({ error: "Game is not active" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch the game's rounds and clues
    const gameDataQuery = `
      SELECT
        r.round_id,
        r.round_number,
        r.category,
        json_group_array(
          json_object(
            'clue_id', c.clue_id,
            'clue_number', c.clue_number,
            'clue_text', c.clue_text,
            'points', c.points
          )
        ) AS clues
      FROM rounds r
      JOIN clues c ON r.round_id = c.round_id
      WHERE r.game_id = ?
      GROUP BY r.round_id
      ORDER BY r.round_number
    `;

    const rounds = await context.env.DB.prepare(gameDataQuery).bind(id).all();

    if (!rounds || !rounds.results || rounds.results.length === 0) {
      return new Response(JSON.stringify({ error: "No rounds found for this game" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse clues JSON for each round
    const formattedRounds = rounds.results.map(round => {
      return {
        ...round,
        clues: JSON.parse(round.clues).map(clue => ({
          ...clue,
          clue_number: Number(clue.clue_number),
          points: Number(clue.points)
        }))
      };
    });

    // Create response with game information and structured rounds
    const response = {
      game_id: Number(game.game_id),
      title: game.title,
      user_id: userId,
      timestamp: new Date().toISOString(),
      rounds: formattedRounds,
      current_round: 1,
      score: 0,
      status: "active"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error starting game play:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Endpoint to get current game state
export async function onRequestGet(context) {
  try {
    const { id } = context.params;
    const url = new URL(context.request.url);
    const userId = url.searchParams.get("userId");

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "Invalid game ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if game exists
    const gameQuery = `
      SELECT game_id, title, is_active
      FROM games
      WHERE game_id = ?
    `;
    const game = await context.env.DB.prepare(gameQuery).bind(id).first();

    if (!game) {
      return new Response(JSON.stringify({ error: "Game not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // In a real application, you would fetch the user's saved game state from a database
    // For this example, we'll simulate a game in progress
    const roundsQuery = `
      SELECT
        r.round_id,
        r.round_number,
        r.category,
        json_group_array(
          json_object(
            'clue_id', c.clue_id,
            'clue_number', c.clue_number,
            'clue_text', c.clue_text,
            'points', c.points
          )
        ) AS clues
      FROM rounds r
      JOIN clues c ON r.round_id = c.round_id
      WHERE r.game_id = ?
      GROUP BY r.round_id
      ORDER BY r.round_number
      LIMIT 1
    `;

    const currentRound = await context.env.DB.prepare(roundsQuery).bind(id).first();

    if (!currentRound) {
      return new Response(JSON.stringify({ error: "No rounds found for this game" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse clues JSON
    currentRound.clues = JSON.parse(currentRound.clues).map(clue => ({
      ...clue,
      clue_number: Number(clue.clue_number),
      points: Number(clue.points)
    }));

    // Simulated game state response
    const response = {
      game_id: Number(game.game_id),
      title: game.title,
      user_id: userId,
      current_round: {
        round_id: currentRound.round_id,
        round_number: currentRound.round_number,
        category: currentRound.category,
        clues: currentRound.clues.filter(clue => clue.clue_number <= 1) // Only show first clue initially
      },
      score: 0,
      revealed_clues: 1,
      status: "active"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching game state:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Endpoint to reveal next clue
export async function onRequestPatch(context) {
  try {
    const { id } = context.params;
    const { userId, action, roundId, clueNumber } = await context.request.json();

    if (!id || !userId || !action) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (action === "reveal_clue") {
      if (!roundId || !clueNumber || clueNumber < 1 || clueNumber > 3) {
        return new Response(JSON.stringify({ error: "Invalid round or clue parameters" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get the next clue
      const nextClueNumber = clueNumber + 1;
      if (nextClueNumber > 3) {
        return new Response(JSON.stringify({ error: "All clues already revealed" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const clueQuery = `
        SELECT clue_id, clue_text, points
        FROM clues
        WHERE round_id = ? AND clue_number = ?
      `;

      const clue = await context.env.DB.prepare(clueQuery)
        .bind(roundId, nextClueNumber)
        .first();

      if (!clue) {
        return new Response(JSON.stringify({ error: "Clue not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        revealed_clue: {
          clue_id: clue.clue_id,
          clue_number: nextClueNumber,
          clue_text: clue.clue_text,
          points: clue.points
        },
        revealed_clues: nextClueNumber
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (action === "next_round") {
      // Logic for advancing to the next round would go here
      // For this example, we'll just return a success message
      return new Response(JSON.stringify({
        message: "Advanced to next round",
        current_round: parseInt(roundId) + 1
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error updating game state:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
