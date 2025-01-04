export async function onRequestPost(context) {
  const requestBody = await context.request.json(); // If sending JSON
  // const formData = await context.request.formData(); // If sending form data

  // Your API logic here (e.g., process game start request)
  const responseData = { message: "Game started!", requestData: requestBody };
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Example for GET requests to the same route
export async function onRequestGet(context) {
  return new Response("Use POST to start a game.", { status: 405 });
}
