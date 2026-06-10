/**
 * API base URL.
 * - Dev: leave VITE_API_URL unset → uses "/api" (Vite proxies to :8080).
 * - Prod (frontend on Vercel, backend hosted elsewhere): set
 *   VITE_API_URL=https://your-backend.example.com/api
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api";
