export const API_BASE = (() => {
  let base = process.env.NEXT_PUBLIC_API_URL || "";
  // Trim trailing slashes
  base = base.replace(/\/+$/, "");
  // Ensure it ends with /api
  if (base && !/\/api$/i.test(base)) {
    base += "/api";
  }
  return base;
})();

/**
 * Build a full API URL from a relative path, normalizing slashes
 */
export function buildApiUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  // If API_BASE isn't configured, default to Next.js API routes at /api
  if (!API_BASE) return `/api/${normalizedPath}`;
  return `${API_BASE}/${normalizedPath}`;
}

/**
 * Wrapper around fetch that prefixes the API base and normalizes the URL.
 * Pass the same init options you would to window.fetch.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const url = /^https?:\/\//i.test(input) ? input : buildApiUrl(input);
  return fetch(url, init);
}
