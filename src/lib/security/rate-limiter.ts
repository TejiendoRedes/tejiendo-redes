/**
 * Simple in-memory rate limiter for development/single-instance production.
 * Recommended: Replace with Upstash/Redis for multi-instance deployments.
 */

type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const storage = new Map<string, RateLimitRecord>();

interface RateLimitOptions {
    limit: number;
    windowMs: number;
    keyPrefix: string;
}

export async function rateLimit(ip: string, options: RateLimitOptions) {
    const key = `${options.keyPrefix}:${ip}`;
    const now = Date.now();

    let record = storage.get(key);

    if (!record || now > record.resetTime) {
        record = {
            count: 0,
            resetTime: now + options.windowMs,
        };
    }

    record.count++;
    storage.set(key, record);

    const remaining = Math.max(0, options.limit - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    return {
        success: record.count <= options.limit,
        remaining,
        reset: record.resetTime,
        retryAfter,
    };
}

/**
 * Common rate limit configurations
 */
export const LOGIN_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000, keyPrefix: 'login' }; // 5 attempts per 15 mins
export const REGISTER_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000, keyPrefix: 'register' }; // 3 attempts per hour
