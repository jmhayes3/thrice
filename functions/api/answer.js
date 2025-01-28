export async function onRequestPost(context) {
  const { request } = context;

  const requestData = await request.json();
  console.log(requestData);

  const responseData = { message: "Answer submitted!", answer: 42 };

  return new Response(JSON.stringify(responseData), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
