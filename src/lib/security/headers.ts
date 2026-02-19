/**
 * Strict Content Security Policy configuration
 */
export const CSP_HEADER = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline often needed for Next.js hydration, eval for some libs
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join('; ');

/**
 * Standard Security Headers
 */
export const SECURITY_HEADERS = {
    'Content-Security-Policy': CSP_HEADER,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
};

/**
 * Function to apply headers to a response
 */
export function applySecurityHeaders(headers: Headers) {
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        headers.set(key, value);
    });
    return headers;
}
