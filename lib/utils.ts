import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/** Returns up to 2 uppercase initials from a full name string */
export function initials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/** Returns up to 2 uppercase initials from separate first/last name */
export function initialsFromParts(
    prenom?: string | null,
    nom?: string | null,
): string {
    const a = prenom?.[0] ?? "";
    const b = nom?.[0] ?? "";
    return (a + b).toUpperCase() || "?";
}

/** Formats a date string to French locale (e.g. "15 mars 2024") */
export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

/** Formats a date string to short French locale (e.g. "15/03/2024") */
export function formatDateShort(iso: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(iso));
}

/** Formats a date string to include time (e.g. "15 mars 2024 à 09:00") */
export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

/** Returns whether a date string is in the future */
export function isFuture(iso: string): boolean {
    return new Date(iso) > new Date();
}

/** Returns whether a date string is in the past */
export function isPast(iso: string): boolean {
    return new Date(iso) < new Date();
}

/**
 * Formats a French phone number with spaces every 2 digits.
 * Input: "0612345678" or "06 12 34 56 78"
 * Output: "06 12 34 56 78"
 */
export function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

/** Returns the full display name: "Civilité Prénom NOM" */
export function fullName(
    prenom: string,
    nom: string,
    civilite?: string,
): string {
    const parts = [civilite, prenom, nom.toUpperCase()].filter(Boolean);
    return parts.join(" ");
}

/** Truncates a string to the given length, appending "…" if needed */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + "…";
}

let _id = 100;
export const nextId = (): number => ++_id;
