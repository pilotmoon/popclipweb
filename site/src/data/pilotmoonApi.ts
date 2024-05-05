import axios from "axios";

// prepare api access
const PILOTMOON_API_KEY = process.env.PILOTMOON_API_KEY;
if (!PILOTMOON_API_KEY) {
  throw new Error("Missing PILOTMOON_API_KEY");
}
export const api = axios.create({
  baseURL: "https://pltmn-rolo.eu.ngrok.io",
  headers: {
    Authorization: `Bearer ${PILOTMOON_API_KEY}`,
  },
});
