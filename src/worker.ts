/**
 * Minimal Cloudflare Worker entry point for QALBIE.
 * This script enables "Variables and Secrets" in the Cloudflare Dashboard
 * by making this a real Worker (not just a static assets-only deployment).
 * All requests are forwarded to the static assets handler (Vite build output).
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Forward semua request ke static assets
    return env.ASSETS.fetch(request);
  },
};

interface Env {
  ASSETS: Fetcher;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_API_BASE_URL: string;
}
