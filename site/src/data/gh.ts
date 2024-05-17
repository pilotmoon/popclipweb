import axios from "axios";

const GH_API_KEY = process.env.GH_API_KEY;
if (!GH_API_KEY) {
  throw new Error("Missing GH_API_KEY");
}
export const gh = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${GH_API_KEY}`,
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
  },
});
