-- Migración Manual Segura para Tejiendo Redes
-- Fecha: 2026-07-19

-- 1. Actualizar tabla consultas
-- Agregar nuevas columnas para signos vitales y horaConsulta
ALTER TABLE consultas ADD COLUMN peso DECIMAL(5,2);
ALTER TABLE consultas ADD COLUMN talla DECIMAL(3,2);
ALTER TABLE consultas ADD COLUMN temperatura DECIMAL(4,2);
ALTER TABLE consultas ADD COLUMN frecuenciaCardiaca VARCHAR(10);
ALTER TABLE consultas ADD COLUMN horaConsulta TIME;

-- (Opcional) Migrar signos vitales de antecedentes a consultas basado en la consulta más reciente
-- UPDATE consultas c
-- INNER JOIN antecedentes a ON c.cedulaPaciente = a.cedulaPaciente
-- SET 
--     c.peso = a.peso,
--     c.talla = a.talla,
--     c.temperatura = a.temperatura,
--     c.frecuenciaCardiaca = a.FC,
--     c.tensionArterial = a.TA;

-- 2. Limpiar tabla pacientes
ALTER TABLE pacientes DROP COLUMN historialEnfermedades;
ALTER TABLE pacientes DROP COLUMN consultasMedicasPrevias;
ALTER TABLE pacientes DROP COLUMN nota;

-- 3. Limpiar tabla antecedentes
ALTER TABLE antecedentes DROP COLUMN peso;
ALTER TABLE antecedentes DROP COLUMN talla;
ALTER TABLE antecedentes DROP COLUMN temperatura;
ALTER TABLE antecedentes DROP COLUMN FC;
ALTER TABLE antecedentes DROP COLUMN TA;

-- 4. Limpiar comunidades y organismos
ALTER TABLE comunidades DROP COLUMN ubicacionFisica;
ALTER TABLE organismos DROP COLUMN ubicacionFisica;

-- 5. Renombrar y actualizar entregas_medicamentos
RENAME TABLE medicamentos_pacientes TO entregas_medicamentos;
-- Actualizar horaEntrega si existía o cambiar tipo
ALTER TABLE entregas_medicamentos MODIFY COLUMN horaEntrega TIME;

-- 6. Actualizar solicitudes_abordajes
-- Intentamos castear a DATE/TIME si es posible, de lo contrario MySQL podría vaciar la columna si los datos son inválidos
ALTER TABLE solicitudes_abordajes MODIFY COLUMN fechaSugerida DATE;
ALTER TABLE solicitudes_abordajes MODIFY COLUMN horaInicioSugerida TIME;

-- 7. Actualizar aspirantes
ALTER TABLE aspirantes MODIFY COLUMN username VARCHAR(30);

-- 8. Eliminar tabla peticiones si existía y no se usa
DROP TABLE IF EXISTS peticiones;
