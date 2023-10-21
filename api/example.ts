export const config = {
  runtime: 'edge',
};
 
export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const iconUrl = new URL("http://api.pilotmoon.com/frontend/icon");
  iconUrl.search = urlParams.toString();
  const res = await fetch(iconUrl.toString()); 
  return new Response(
    res.body,
    {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "text/plain",
        "Cache-Control": "public, s-maxage=86400, max-age=3600",
      }
    },
  );
}