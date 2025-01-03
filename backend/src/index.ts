export async function onRequest(context: EventContext<any, any, any>) {
  return new Response("Hello, world!");
}
