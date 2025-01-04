export async function onRequest(context: EventContext<any, any, any>) {
  return new Response("Hello, world!");
  const url = new URL(context.url);
  if (url.pathname.startsWith("/")) {
    return new Response("Ok");
  }
  // Passes the incoming request through to the assets binding.
  // No asset matched this request, so this will evaluate `not_found_handling` behavior.
  return env.ASSETS.fetch(request);
}
