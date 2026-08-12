export const STORE_URL =
  (process.env.NEXT_PUBLIC_STORE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:3000";