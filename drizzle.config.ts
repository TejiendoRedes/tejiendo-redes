import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
    schema: './src/db/schema/*',
    out: './drizzle',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASSWORD || '',
        database: process.env.DATABASE_NAME || 'test',
        port: Number(process.env.DATABASE_PORT) || 3306,
    },
});
