import axios from "axios";
import config from "../config/config.json";

// prepare api access
const PILOTMOON_API_KEY = process.env.PILOTMOON_API_KEY;
if (!PILOTMOON_API_KEY) {
  throw new Error("Missing PILOTMOON_API_KEY");
}
export const api = axios.create({
  baseURL: `${config.pilotmoon.apiRoot}`,
  headers: {
    Authorization: `Bearer ${PILOTMOON_API_KEY}`,
  },
});
