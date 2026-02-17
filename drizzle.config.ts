import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: Number(process.env.DATABASE_PORT),
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
