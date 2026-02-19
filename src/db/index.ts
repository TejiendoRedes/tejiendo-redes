import { drizzle } from 'drizzle-orm/mysql2';
import { connection } from './client';
import * as schema from './schema';

// Create Drizzle instance with schema
export const db = drizzle(connection, { schema, mode: 'default' });

// Re-export connection and schema for convenience
export { connection, schema };

// Export commonly used types
export type Database = typeof db;
