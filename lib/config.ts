// ── API Configuration ─────────────────────────────────────────────────────────
//
// Base URL used by all fetchers.
//
// • Development (Next.js internal routes) : leave NEXT_PUBLIC_API_URL unset
//   → resolves to "/api"  (relative, same-origin)
//
// • Production / external backend         : set in .env.local or CI secrets
//   NEXT_PUBLIC_API_URL=https://api.repaircafe.fr
//   → resolves to "https://api.repaircafe.fr"
//
// The NEXT_PUBLIC_ prefix is required for the variable to be available
// in client-side bundles (hooks, components).
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL: string =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Builds a full API URL from a resource path.
 *
 * Handles trailing slashes on the base and leading slashes on the path
 * so callers never have to think about concatenation edge-cases.
 *
 * @example
 *   apiUrl("/benevoles")           // → "/api/benevoles"
 *   apiUrl("/benevoles/42")        // → "/api/benevoles/42"
 *   apiUrl("/rdvs?evenementId=1")  // → "/api/rdvs?evenementId=1"
 */
export function apiUrl(path: string): string {
    const base = API_BASE_URL.replace(/\/$/, "");
    const segment = path.startsWith("/") ? path : `/${path}`;
    return `${base}${segment}`;
}
