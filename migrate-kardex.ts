import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
    const { db } = await import('./src/db');
    const { sql } = await import('drizzle-orm');
    console.log('Creando tabla movimientos_inventario...');
    
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS movimientos_inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_medicamento VARCHAR(10) NOT NULL,
                tipo VARCHAR(20) NOT NULL,
                cantidad INT NOT NULL,
                motivo VARCHAR(100) NOT NULL,
                referencia VARCHAR(50),
                costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
                fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                cedula_usuario VARCHAR(12) NOT NULL,
                notas TEXT,
                CONSTRAINT fk_movimiento_medicamento FOREIGN KEY (codigo_medicamento) REFERENCES medicamentos(codigo_medicamento) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT fk_movimiento_usuario FOREIGN KEY (cedula_usuario) REFERENCES tejedores(cedula_tejedor) ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `);
        console.log('Tabla creada exitosamente.');
        
        await db.execute(sql`
            CREATE INDEX idx_movimiento_medicamento ON movimientos_inventario(codigo_medicamento);
        `);
        
        await db.execute(sql`
            CREATE INDEX idx_movimiento_fecha ON movimientos_inventario(fecha_movimiento);
        `);
        
        await db.execute(sql`
            CREATE INDEX idx_movimiento_usuario ON movimientos_inventario(cedula_usuario);
        `);
        
        console.log('Indices creados exitosamente.');
    } catch (e: any) {
        if (e.message && e.message.includes('Duplicate key name')) {
            console.log('Indices ya existen, saltando...');
        } else {
            console.error('Error:', e);
        }
    }
    
    process.exit(0);
}

main();
