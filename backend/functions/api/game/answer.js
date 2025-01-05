// api/game/answer.js

export async function onRequestPost(context) {
  const requestBody = await context.request.json();

  // Your API logic here (e.g., process game start request)
  const responseData = { message: "Answer submitted!", requestData: requestBody };
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
