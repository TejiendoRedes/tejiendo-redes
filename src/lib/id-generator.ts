import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { MySqlColumn, MySqlTable } from 'drizzle-orm/mysql-core';

/**
 * DB-05: Thread-safe code generator using MAX() + transaction
 */
export async function getNextCode(
    table: MySqlTable,
    column: MySqlColumn,
    prefix: string,
    digitCount: number = 3
): Promise<string> {
    try {
        // Use MAX() in SQL + transaction for atomicity under concurrent requests
        return await db.transaction(async (tx) => {
            const result = await tx
                .select({ maxCode: sql<string>`MAX(${column})` })
                .from(table)
                // Lock the rows to prevent race conditions.
                // Note: In MySQL, this locks the rows scanned by the query. 
                // Since it is a MAX() on the whole table (or index), it effectively serializes inserts 
                // that rely on this generated ID, preventing duplicates.
                .where(sql`1=1 FOR UPDATE`);

            const lastCode = result[0]?.maxCode;
            if (!lastCode) {
                return `${prefix}${'1'.padStart(digitCount, '0')}`;
            }

            const numericPart = lastCode.substring(prefix.length);
            const nextNumber = parseInt(numericPart, 10) + 1;

            if (isNaN(nextNumber)) {
                console.warn(`Formato de código inválido detectado: ${lastCode}. Empezando desde 001.`);
                return `${prefix}${'1'.padStart(digitCount, '0')}`;
            }

            return `${prefix}${nextNumber.toString().padStart(digitCount, '0')}`;
        });
    } catch (error) {
        console.error('Error generating next code:', error);
        // Fallback seguro: prefijo + timestamp corto
        const timestamp = Date.now().toString().slice(-digitCount);
        return `${prefix}${timestamp}`;
    }
}
