import fs from 'fs';
import path from 'path';
import { loadEnvConfig } from '@next/env';

// Load env vars first
loadEnvConfig(process.cwd());

async function applyMigration() {
    console.log('🚀 Applying migration manually...');

    // Dynamic import to ensure env vars are loaded before client.ts initialization
    const { connection } = await import('./client');

    // Read the specific migration file we know exists and is pending/modified
    const migrationPath = path.join(process.cwd(), 'drizzle', '0005_square_yellowjacket.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');

    // Split by breakpoint
    const statements = sqlContent.split('--> statement-breakpoint');

    const pool = connection; // Use the exported pool from client.ts

    let conn;
    try {
        conn = await pool.getConnection();
        console.log('✅ Connected via pool');

        try {
            console.log('📝 Executing SQL statements...');
            for (const statement of statements) {
                const sql = statement.trim();
                if (sql) {
                    console.log(`Executing: ${sql.substring(0, 50)}...`);
                    await conn.query(sql);
                }
            }
            console.log('✅ Migration applied successfully');
        } catch (err) {
            console.error('❌ Error executing SQL:', err);
        } finally {
            conn.release();
        }
    } catch (err) {
        console.error('❌ Connection error:', err);
    } finally {
        await pool.end();
    }
}

applyMigration();
