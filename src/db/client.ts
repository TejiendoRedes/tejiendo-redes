/**
 * @module db/client
 * @description Pool de conexión MySQL usando `mysql2/promise`.
 *
 * Crea un pool singleton con las siguientes características:
 * - **Conexión máxima:** 10 conexiones simultáneas (optimizado para serverless).
 * - **Idle timeout:** 60 segundos para liberar conexiones inactivas.
 * - **Keep-alive:** Habilitado para prevenir desconexiones en conexiones largas.
 * - **SSL:** Habilitado para conexiones remotas (ej. Aiven).
 * - **Charset:** UTF-8 MB4 para soporte completo de caracteres especiales.
 * - **Timezone:** UTC para consistencia en fechas.
 *
 * La configuración se lee de variables de entorno en `.env.local`.
 *
 * @see {@link file://src/db/index.ts} - Instancia Drizzle que consume este pool.
 */

import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'bd_sistema_abordajes',
    // Connection pool settings — DB-07: Reduced for Next.js serverless
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    maxIdle: 5,
    idleTimeout: 60000, // Close idle connections after 1 min
    // Character set configuration
    charset: 'utf8mb4',
    timezone: 'Z', // UTC
    // Enable multiple statements if needed
    // multipleStatements: true, // Removed for security reasons (prevents SQL injection escalation)
    // Connection reuse settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // Timeout settings — DB-08: Increased for robust performance
    connectTimeout: 20000, // 20 seconds to connect
    // SSL configuration for Aiven
    ssl: {
        rejectUnauthorized: false
    }
};

// Create MySQL connection pool
let pool: mysql.Pool | null = null;

export const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);

        // Test connection on pool creation
        pool.getConnection()
            .then(connection => {
                connection.release();
            })
            .catch(err => {
                console.error('❌ MySQL connection error:', err.message);
                console.error('Please check your .env.local configuration');
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('💡 Tip: Consider increasing connectionLimit or checking for unclosed connections');
                }
            });
    }
    return pool;
};

// Export the pool for use with Drizzle
export const connection = getPool();
