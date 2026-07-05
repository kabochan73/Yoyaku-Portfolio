import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  withXSRFToken: true,
});

export async function getCsrfCookie() {
  const origin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "");
  await axios.get(`${origin}/sanctum/csrf-cookie`, { withCredentials: true });
}
