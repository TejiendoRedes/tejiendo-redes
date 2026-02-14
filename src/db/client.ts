import mysql from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'bd_sistema_abordajes',
    // Connection pool settings - increased for better performance
    waitForConnections: true,
    connectionLimit: 50, // Increased from 10 to 50
    queueLimit: 0,
    // Character set configuration
    charset: 'utf8mb4',
    timezone: 'Z', // UTC
    // Enable multiple statements if needed
    multipleStatements: true,
    // Connection reuse settings
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

// Create MySQL connection pool
let pool: mysql.Pool | null = null;

export const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);

        // Test connection on pool creation
        pool.getConnection()
            .then(connection => {
                console.log('✅ MySQL database connected successfully');
                console.log(`📊 Connection pool configured: ${dbConfig.connectionLimit} max connections`);
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
