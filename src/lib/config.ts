/** Single source for the API origin, on both server and client. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5002";
