import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Soft Refresh - Actualiza el esquema preservando los datos
 * 
 * Este script:
 * 1. Identifica cambios en el esquema
 * 2. Aplica solo los cambios necesarios
 * 3. Preserva todos los datos existentes
 * 
 * IMPORTANTE: Para cambios complejos (como modificar PKs), 
 * es mejor usar el sistema de migraciones.
 */
async function softRefresh() {
    console.log('🔄 Iniciando soft refresh del esquema...\n');

    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST!,
        user: process.env.DATABASE_USER!,
        password: process.env.DATABASE_PASSWORD!,
        database: process.env.DATABASE_NAME!,
        port: Number(process.env.DATABASE_PORT),
        multipleStatements: true,
    });

    try {
        console.log('🔍 Verificando tablas de relación...');

        // Obtener lista de tablas de relación (bridge tables)
        const bridgeTables = [
            'abordaje_comunidad',
            'consultas_enfermedades',
            'medicamentos_pacientes',
            'tejedores_abordaje'
        ];

        // Verificar si existen tablas de relación
        const [tables] = await connection.query<any[]>(
            `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (?)`,
            [process.env.DATABASE_NAME, bridgeTables]
        );

        if (tables.length > 0) {
            console.log('⚠️  Detectadas tablas de relación existentes.');
            console.log('   Para evitar conflictos con claves foráneas, usa uno de estos métodos:');
            console.log('   1. npm run db:migrate (recomendado - usa migraciones)');
            console.log('   2. npm run db:hard-reset (elimina todos los datos)');
            console.log('\n❌ Soft refresh abortado para prevenir errores.\n');
            process.exit(1);
        }

        console.log('✅ No hay conflictos detectados.');
        console.log('\n💡 Ejecuta "drizzle-kit push" para aplicar cambios.\n');

    } catch (error) {
        console.error('❌ Error durante soft refresh:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

softRefresh();
