export const config = {
  runtime: "edge",
};

const healthyCodes = new Set([200, 400, 404]);

export default async function handler(request: Request) {
  // get the query string
  const query = request.url.split("?")[1];
  if (!query) {
    return new Response("No query", { status: 400 });
  }

  // perform the upstream request
  const upstreamUrl = `https://icons.popclip.app/icon?${query}`;
  const res = await fetch(upstreamUrl.toString());

  // add vercel-specific cache headers if the upstream is healthy
  let cacheControl = res.headers.get("Cache-Control") || "public,max-age=1";
  if (healthyCodes.has(res.status)) {
    cacheControl += ",s-maxage=604800,stale-while-revalidate=604800";
  }

  // pass on the response, with CORS and cache headers
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", cacheControl);
  return new Response(res.body, { status: res.status, headers });
}
