import { db } from './index';
import { sql } from 'drizzle-orm';
import { entregasMedicamentos } from './schema/entregas_medicamentos';

async function migrateEntregas() {
    console.log('Iniciando migración de entregas de medicamentos...');

    try {
        // 1. Crear la nueva tabla entregas_medicamentos si no existe
        console.log('1. Creando tabla entregas_medicamentos...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS entregas_medicamentos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_paciente VARCHAR(12) NOT NULL,
                codigo_medicamento VARCHAR(10) NOT NULL,
                cantidad INT NOT NULL,
                fecha_entrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                hora_entrega VARCHAR(8),
                estado VARCHAR(20) NOT NULL DEFAULT 'entregado',
                codigo_abordaje VARCHAR(10),
                cedula_tejedor VARCHAR(12) NOT NULL,
                notas VARCHAR(255),
                CONSTRAINT entregas_paciente_fk FOREIGN KEY (codigo_paciente) REFERENCES pacientes(cedula_paciente) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT entregas_medicamento_fk FOREIGN KEY (codigo_medicamento) REFERENCES medicamentos(codigo_medicamento) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT entregas_abordaje_fk FOREIGN KEY (codigo_abordaje) REFERENCES abordajes(codigo_abordaje) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT entregas_tejedor_fk FOREIGN KEY (cedula_tejedor) REFERENCES tejedores(cedula_tejedor) ON DELETE RESTRICT ON UPDATE CASCADE
            );
        `);

        // 2. Migrar datos de medicamentos_pacientes (entregas viejas) a entregas_medicamentos
        console.log('2. Migrando datos de medicamentos_pacientes...');
        await db.execute(sql`
            INSERT INTO entregas_medicamentos (codigo_paciente, codigo_medicamento, cantidad, fecha_entrega, estado, codigo_abordaje, cedula_tejedor, notas)
            SELECT cedula_paciente, codigo_medicamento, cantidad_entregada, fecha_entrega, 'entregado', codigo_abordaje, cedula_tejedor, 'Migrado de medicamentos_pacientes'
            FROM medicamentos_pacientes
        `);

        // 3. Migrar datos de peticiones a entregas_medicamentos
        console.log('3. Migrando datos de peticiones...');
        await db.execute(sql`
            INSERT INTO entregas_medicamentos (codigo_paciente, codigo_medicamento, cantidad, fecha_entrega, hora_entrega, estado, codigo_abordaje, cedula_tejedor, notas)
            SELECT codigo_paciente, codigo_medicamento, cantidad, IFNULL(fecha_entrega, fecha_peticion), hora_entrega, estado, codigo_abordaje, IFNULL(cedula_tejedor, 'V-00000000'), notas
            FROM peticiones
        `);

        // 4. Eliminar tablas antiguas (OPCIONAL, puede requerir dropear FKs primero)
        // await db.execute(sql`DROP TABLE IF EXISTS medicamentos_pacientes;`);
        // await db.execute(sql`DROP TABLE IF EXISTS peticiones;`);
        
        console.log('Migración completada con éxito.');
    } catch (error) {
        console.error('Error durante la migración:', error);
    }
}

migrateEntregas().then(() => process.exit(0));
