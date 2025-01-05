export async function onRequestPost(context) {
  // const requestBody = await context.request.json(); // If sending JSON
  const formData = await context.request.formData(); // If sending form data

  // Your API logic here (e.g., process game start request)
  const responseData = { message: "Answer submitted!", requestData: requestBody };
  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestGet(context) {
  return new Response("Use POST to submit answer.", { status: 405 });
}
