export async function onRequestPost(context) {
  const requestBody = await context.request.json();
  console.log(requestBody);

  const responseData = { message: "Answer submitted!", answer: 42 };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
