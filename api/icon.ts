export const config = {
  runtime: 'edge',
};
 
export default async function handler(request: Request) {
  const query = request.url.split("?")[1];
  if (!query) return new Response("No query", { status: 400 });
  const iconUrl = `https://api.pilotmoon.com/frontend/icon?${query}`;
  console.log(iconUrl.toString());
  const res = await fetch(iconUrl.toString()); 
  return new Response(
    res.body,
    {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
        "X-Icon-Color-Mode": res.headers.get("X-Icon-Color-Mode") || "unknown",
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=604800",
      }
    },
  );
}