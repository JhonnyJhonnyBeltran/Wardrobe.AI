/**
 * Normalizes a string for brand names:
 * - Trims whitespace
 * - Removes redundant internal spaces
 * - Removes accents (Unicode normalization)
 * - Converts to Title Case (e.g., "zara" -> "Zara")
 */
export function normalizeBrand(name: string): string {
    if (!name) return '';

    // 1. Unicode normalization and removal of accents
    const normalized = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    // 2. Remove special characters (keep spaces and alphanumeric)
    // and replace multiple spaces with a single space
    const cleanChars = normalized
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // 3. Convert to Title Case
    return cleanChars
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Creates a slug from a brand name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
