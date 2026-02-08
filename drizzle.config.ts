import { defineConfig } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    url: 'mysql://root:@127.0.0.1:3306/bd_sistema_abordajes',
  },
});
