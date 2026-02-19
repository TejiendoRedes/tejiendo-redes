/**
 * Escapes HTML and removes all tags to prevent XSS.
 * A lightweight, server-safe replacement for DOMPurify when only basic tag stripping is needed.
 * This avoids the complex JSDOM dependencies that cause ERR_REQUIRE_ESM in Next.js environments.
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove all HTML tags using a robust regex
    let clean = input.replace(/<[^>]*>?/gm, '');

    // Escape sensitive characters for additional security
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
    };

    clean = clean.replace(/[&<>"'/]/g, (match) => map[match]);

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
