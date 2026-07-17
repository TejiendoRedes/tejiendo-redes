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
        // Extraemos solo el número para calcular el MAX correctamente.
        // SUBSTRING en SQL es 1-indexed. Si prefix="SAB-", length=4, el número arranca en 5.
        const startIdx = prefix.length + 1;
        
        const result = await tx.execute(
            sql`SELECT MAX(CAST(SUBSTRING(${column}, ${startIdx}) AS UNSIGNED)) as maxNum FROM ${table} FOR UPDATE`
        );

        const rows = result[0] as unknown as Array<{ maxNum: number | null }>;
        const maxNum = rows[0]?.maxNum;

        if (maxNum === null || maxNum === undefined) {
            return `${prefix}${'1'.padStart(digitCount, '0')}`;
        }

        const nextNumber = maxNum + 1;

        if (isNaN(nextNumber)) {
            console.warn(`Formato numérico inválido detectado. Empezando desde 001.`);
            return `${prefix}${'1'.padStart(digitCount, '0')}`;
        }

        return `${prefix}${nextNumber.toString().padStart(digitCount, '0')}`;
    });
    // BUG-06 FIX: No fallback — si falla la transacción, el error sube a la Server Action
    // que lo maneja con getErrorMessage() y muestra un toast al usuario.
}

