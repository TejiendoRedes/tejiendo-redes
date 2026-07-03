/**
 * Strips HTML tags to prevent XSS.
 * BUG-09 FIX: Removed HTML entity encoding that was corrupting stored data
 * (e.g., "D'Ávila" was saved as "D&#39;Ávila").
 * 
 * Drizzle ORM uses prepared statements (SQL injection safe).
 * React auto-escapes JSX output (XSS safe for rendering).
 * Only tag stripping is needed here.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove all HTML tags using a robust regex
    let clean = input.replace(/<[^>]*>?/gm, '');

    return clean.trim();
}

/**
 * Sanitizes object values recursively (shallow)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = { ...obj };
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeInput(sanitized[key]);
        }
    }
    return sanitized;
}
