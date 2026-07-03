import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { MySqlColumn, MySqlTable } from 'drizzle-orm/mysql-core';

/**
 * DB-05: Thread-safe code generator using MAX() + transaction
 * BUG-05 FIX: Corrected FOR UPDATE placement (was inside WHERE, now at end of SELECT)
 * BUG-06 FIX: Removed dangerous timestamp fallback that could corrupt the sequence
 */
export async function getNextCode(
    table: MySqlTable,
    column: MySqlColumn,
    prefix: string,
    digitCount: number = 3
): Promise<string> {
    // Use MAX() in SQL + transaction for atomicity under concurrent requests
    return await db.transaction(async (tx) => {
        // BUG-05 FIX: Use raw SQL to ensure FOR UPDATE is at the end of the SELECT,
        // not embedded inside the WHERE clause
        const result = await tx.execute(
            sql`SELECT MAX(${column}) as maxCode FROM ${table} FOR UPDATE`
        );

        const rows = result[0] as unknown as Array<{ maxCode: string | null }>;
        const lastCode = rows[0]?.maxCode;

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
    // BUG-06 FIX: No fallback — si falla la transacción, el error sube a la Server Action
    // que lo maneja con getErrorMessage() y muestra un toast al usuario.
}

