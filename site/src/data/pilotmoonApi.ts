import axios from "axios";
import config from "../config/config.json";

// prepare api access
const PILOTMOON_API_KEY = process.env.PILOTMOON_API_KEY;
if (!PILOTMOON_API_KEY) {
  throw new Error("Missing PILOTMOON_API_KEY");
}
// PILOTMOON_API_ROOT overrides the configured api root, for developing
// against a local backend (pair it with a PILOTMOON_API_KEY for that
// backend)
const baseURL = process.env.PILOTMOON_API_ROOT || config.pilotmoon.apiRoot;
if (baseURL !== config.pilotmoon.apiRoot) {
  console.warn(`Using API root override: ${baseURL}`);
}
export const api = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${PILOTMOON_API_KEY}`,
  },
});
