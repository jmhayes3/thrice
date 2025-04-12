export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { roundId, answer, clueNumber } = await request.json();
    console.log("Answer submission:", { roundId, answer, clueNumber });

    // Validate roundId format to prevent SQL injection
    if (!roundId || isNaN(parseInt(roundId))) {
      return new Response(
        JSON.stringify({
          correct: false,
          message: "Invalid round ID",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Query the correct answer from the database
    const query = `
      SELECT r.answer, c.points
      FROM rounds r
      JOIN clues c ON c.round_id = r.round_id
      WHERE r.round_id = ? AND c.clue_number = ?
    `;

    const result = await env.DB.prepare(query)
      .bind(roundId, clueNumber)
      .first();

    if (!result) {
      return new Response(
        JSON.stringify({
          correct: false,
          message: "Round or clue not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if the submitted answer is correct (case-insensitive comparison)
    const correctAnswer = result.answer;
    const isCorrect =
      answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    // Calculate points based on the clue number
    const points = isCorrect ? result.points : 0;

    // Return response matching AnswerResult interface
    const responseData = {
      correct: isCorrect,
      answer: isCorrect ? answer : correctAnswer,
      message: isCorrect ? "Correct answer!" : "That's not right, try again.",
      points: points,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing answer:", error);

    return new Response(
      JSON.stringify({
        correct: false,
        message: "Error processing your answer",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
