/**
 * @module db
 * @description Punto de entrada de la capa de datos.
 *
 * Crea la instancia de Drizzle ORM conectada al pool MySQL y la exporta
 * junto con todos los schemas para uso en Server Actions y queries.
 *
 * @example
 * ```typescript
 * import { db, schema } from '@/db';
 * import { eq } from 'drizzle-orm';
 *
 * const pacientes = await db.select().from(schema.pacientes);
 * ```
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { connection } from './client';
import * as schema from './schema';

// Create Drizzle instance with schema
export const db = drizzle(connection, { schema, mode: 'default' });

// Re-export connection and schema for convenience
export { connection, schema };

// Export commonly used types
export type Database = typeof db;
