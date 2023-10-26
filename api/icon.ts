export const config = {
  runtime: 'edge',
};
 
export default async function handler(request: Request) {
  const query = request.url.split("?")[1];
  if (!query) return new Response("No query", { status: 400 });
  const iconUrl = `https://icons.popclip.app/icon?${query}`;
  console.log(iconUrl.toString());
  const res = await fetch(iconUrl.toString()); 
  let cacheControl = res.headers.get("Cache-Control") || "public,max-age=1";
  if (res.status < 500) { // only cache in vercel edge if the upstream is healthy
    cacheControl += ",s-maxage=604800,stale-while-revalidate=604800"
  }
  return new Response(
    res.body,
    {
      status: res.status,
      headers: {        
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
        "X-Icon-Cache-Status": res.headers.get("X-Icon-Cache-Status") || "unknown",
        "X-Icon-Color-Mode": res.headers.get("X-Icon-Color-Mode") || "unknown",
        "Cache-Control": cacheControl,
        "Access-Control-Allow-Origin": "*",
      }
    },
  );
}