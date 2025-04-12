export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { roundId, answer, clueNumber } = await request.json();
    console.log("Answer submission:", { roundId, answer, clueNumber });

    // Would normally validate the answer against the database
    // For now, mocking a response
    const isCorrect = true; // In a real app, this would be determined by DB check

    // Return response matching AnswerResult interface
    const responseData = {
      correct: isCorrect,
      answer: answer, // Would normally return the correct answer if wrong
      message: isCorrect ? "Correct answer!" : "That's not right, try again.",
      points: isCorrect ? 4 - clueNumber : 0, // Points decrease with each clue
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
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
