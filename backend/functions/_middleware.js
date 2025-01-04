async function errorHandling(context) {
  try {
    return await context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}

// function authentication(context) {
//   if (context.request.headers.get("x-email") != "admin@example.com") {
//     return new Response("Unauthorized", { status: 403 });
//   }
//
//   return context.next();
// }

// export const onRequest = [errorHandling, authentication];
export const onRequest = [errorHandling];
