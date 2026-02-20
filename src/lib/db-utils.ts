/**
 * Database Utilities
 * Focused on performance monitoring and timeout handling
 */

/**
 * Executes an asynchronous operation with a timeout notice.
 * If the operation takes longer than the threshold, it logs a "message" (warning).
 */
export async function withPerformanceCheck<T>(
    operationName: string,
    operation: () => Promise<T>,
    thresholdMs: number = 5000
): Promise<T> {
    const start = Date.now();

    // Create a timer to log if it's taking too long
    const timeoutNotice = setTimeout(() => {
        console.warn(`⏳ [DB PERFORMANCE] Operation "${operationName}" is taking longer than ${thresholdMs}ms...`);
    }, thresholdMs);

    try {
        const result = await operation();
        const duration = Date.now() - start;

        if (duration > thresholdMs) {
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error(`❌ [DB ERROR] Operation "${operationName}" failed after ${duration}ms:`, error);
        throw error;
    } finally {
        clearTimeout(timeoutNotice);
    }
}
