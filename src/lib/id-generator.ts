import { db } from '@/db';
import { sql, desc, eq } from 'drizzle-orm';
import { MySqlColumn } from 'drizzle-orm/mysql-core';

/**
 * Utilidad para generar códigos secuenciales (ej: COM-001, ABD-001)
 */
export async function getNextCode(
    table: any,
    column: MySqlColumn,
    prefix: string,
    digitCount: number = 3
): Promise<string> {
    try {
        // Buscar el último registro insertado por ese campo
        const result = await db
            .select({ code: column })
            .from(table)
            .orderBy(desc(column))
            .limit(1);

        if (!result || result.length === 0) {
            // Si no hay registros, empezar con el 1
            const numberPart = '1'.padStart(digitCount, '0');
            return `${prefix}${numberPart}`;
        }

        const lastCode = result[0].code as string;
        // Extraer la parte numérica (todo después del prefijo)
        const numericPart = lastCode.substring(prefix.length);
        const nextNumber = parseInt(numericPart, 10) + 1;

        if (isNaN(nextNumber)) {
            // Si falla la extracción, por seguridad devolvemos un código basado en el tiempo
            // o lanzamos un error, pero aquí optamos por empezar de nuevo si el formato no es válido
            console.warn(`Formato de código inválido detectado: ${lastCode}. Empezando desde 001.`);
            return `${prefix}${'1'.padStart(digitCount, '0')}`;
        }

        const nextNumberPart = nextNumber.toString().padStart(digitCount, '0');
        return `${prefix}${nextNumberPart}`;
    } catch (error) {
        console.error('Error generating next code:', error);
        // Fallback seguro: prefijo + timestamp corto
        const timestamp = Date.now().toString().slice(-digitCount);
        return `${prefix}${timestamp}`;
    }
}
