import { useAuthStore } from "@/store/auth";

/**
 * Wrapper autour de fetch qui injecte automatiquement le header
 * Authorization: Bearer <token> depuis le store d'auth.
 */
export async function apiFetch(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    const token = useAuthStore.getState().token;
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
    };
    return fetch(url, { ...options, headers });
}

/**
 * Parse le corps JSON d'une réponse de façon défensive :
 * - Corps vide (204, 201 sans body) → retourne `fallback`
 * - Enveloppe Laravel `{ data: ... }` → désenveloppe automatiquement
 * - Tableau direct `[...]` → retourné tel quel
 * - Erreur de parsing → retourne `fallback` sans lever d'exception
 */
export async function safeParseJson<T>(res: Response, fallback: T): Promise<T> {
    try {
        const text = await res.text();
        if (!text.trim()) return fallback;
        const parsed: unknown = JSON.parse(text);
        // Désenvelopper { data: ... } uniquement si c'est un objet non-tableau
        if (
            parsed !== null &&
            typeof parsed === "object" &&
            !Array.isArray(parsed) &&
            "data" in (parsed as Record<string, unknown>)
        ) {
            return (parsed as Record<string, unknown>).data as T;
        }
        return parsed as T;
    } catch {
        return fallback;
    }
}
