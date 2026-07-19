import { db } from './index';
import { estados, municipios, parroquias } from './schema/geografia';
import { VENEZUELA_DATA } from '../data/venezuela-location';

export async function seedGeografia() {
    console.log('Iniciando poblamiento de la base de datos geográfica...');

    try {
        for (const estado of VENEZUELA_DATA) {
            console.log(`Insertando estado: ${estado.nombre}`);
            // Insertar estado
            const [resultEstado] = await db.insert(estados).values({
                nombre: estado.nombre
            });
            const estadoId = resultEstado.insertId;

            for (const municipio of estado.municipios) {
                // Insertar municipio
                const [resultMunicipio] = await db.insert(municipios).values({
                    estadoId: estadoId,
                    nombre: municipio.nombre
                });
                const municipioId = resultMunicipio.insertId;

                const parroquiasData = municipio.parroquias.map(p => ({
                    municipioId: municipioId,
                    nombre: p.nombre
                }));

                if (parroquiasData.length > 0) {
                    await db.insert(parroquias).values(parroquiasData);
                }
            }
        }
        console.log('✅ Poblamiento geográfico completado exitosamente.');
    } catch (error) {
        console.error('❌ Error al poblar la base de datos geográfica:', error);
    }
}
