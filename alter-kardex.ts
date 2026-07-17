import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
    const { db } = await import('./src/db');
    const { sql } = await import('drizzle-orm');
    console.log('Alterando tabla movimientos_inventario para hacer cedula_usuario nullable...');
    
    try {
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=0;`);
        
        await db.execute(sql`
            ALTER TABLE movimientos_inventario 
            DROP FOREIGN KEY fk_movimiento_usuario;
        `);
        
        await db.execute(sql`
            ALTER TABLE movimientos_inventario 
            MODIFY COLUMN cedula_usuario VARCHAR(12) NULL;
        `);
        
        await db.execute(sql`
            ALTER TABLE movimientos_inventario 
            ADD CONSTRAINT fk_movimiento_usuario FOREIGN KEY (cedula_usuario) REFERENCES tejedores(cedula_tejedor) ON DELETE SET NULL ON UPDATE CASCADE;
        `);
        
        await db.execute(sql`SET FOREIGN_KEY_CHECKS=1;`);
        
        console.log('Tabla alterada exitosamente.');
    } catch (e: any) {
        console.error('Error:', e);
    }
    
    process.exit(0);
}

main();
