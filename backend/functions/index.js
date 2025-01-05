export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare("SELECT * FROM Customers WHERE CompanyName = ?",).bind("Bs Beverages").all();
  return Response.json(results);
}
