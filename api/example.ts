export const config = {
  runtime: 'edge',
};
 
export default async function handler(request: Request) {
  const urlParams = new URL(request.url).searchParams;
  const query = Object.fromEntries(urlParams);
  const cookies = request.headers.get('cookie');
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = null;
  }

  const iconUrl = new URL("http://api.pilotmoon.com/frontend/icon");
  iconUrl.search = urlParams.toString();

  const res = await fetch(iconUrl.toString());
 
  return new Response(
    res.body,
    // JSON.stringify({
    //   body,
    //   query,
    //   cookies,
    //   it: iconUrl.toString(),
    // }),
    {
      status: res.status,
      headers: res.headers
    },
  );
}