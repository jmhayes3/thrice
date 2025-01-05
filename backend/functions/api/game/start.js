export async function onRequestPost(context) {
  const requestBody = await context.request.json();

  // Your API logic here (e.g., process game start request)
  const responseData = { message: "Game started!", requestData: requestBody };
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  return new Response("Use POST to start a game.", { status: 405 });
}
