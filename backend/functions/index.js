// index.js

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare("SELECT * FROM sensor_readings WHERE event_id = ?",).bind(1).all();
  return Response.json(results);
}
