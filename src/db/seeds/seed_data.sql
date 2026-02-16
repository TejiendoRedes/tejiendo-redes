-- ===============================================================================================
-- SCRIPT DE SEED DATA - SISTEMA DE ABORDAJES (VENEZUELA)
-- Contexto: Ayuda humanitaria y médica.
-- Fecha generación: 2026-02-15
-- ===============================================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------------------------
-- LIMPIEZA DE DATOS (Orden Para Evitar Conflictos si FK Checks = 1)
-- -----------------------------------------------------------------------------------------------
TRUNCATE TABLE abordaje_asistencia;
TRUNCATE TABLE medicamentos_pacientes;
TRUNCATE TABLE consultas_enfermedades;
TRUNCATE TABLE tejedores_abordaje;
TRUNCATE TABLE consultas;
TRUNCATE TABLE abordaje;
TRUNCATE TABLE solicitudes_abordajes;
TRUNCATE TABLE antecedentes;
TRUNCATE TABLE pacientes;
TRUNCATE TABLE comunidades;
TRUNCATE TABLE responsable;
TRUNCATE TABLE medicos;
TRUNCATE TABLE tejedores;
TRUNCATE TABLE medicamentos;
TRUNCATE TABLE enfermedades;
TRUNCATE TABLE especialidades;

-- -----------------------------------------------------------------------------------------------
-- PASO 1: CATÁLOGOS BASE (Infraestructura)
-- -----------------------------------------------------------------------------------------------

-- 1. Especialidades
INSERT INTO especialidades (codigo_especialidad, nombre_especialidad, descripcion) VALUES
('ESP-001', 'Cardiología', 'Especialidad médica que se ocupa del corazón y del aparato circulatorio.'),
('ESP-002', 'Pediatría', 'Rama de la medicina que se ocupa de la salud y enfermedades de los niños.'),
('ESP-003', 'Medicina General', 'Atención médica primaria y preventiva para pacientes de todas las edades.'),
('ESP-004', 'Ginecología', 'Especialidad médica y quirúrgica que trata las enfermedades del sistema reproductor femenino.'),
('ESP-005', 'Odontología', 'Diagnóstico, tratamiento y prevención de las enfermedades del aparato estomatognático.');

-- 2. Enfermedades (Patologías comunes en operativos)
INSERT INTO enfermedades (codigo_enfermedad, nombre_enfermedad, tipo_patologia, descripcion) VALUES
('ENF-001', 'Hipertensión Arterial', 'Crónica', 'Presión arterial alta persistente.'),
('ENF-002', 'Diabetes Mellitus Tipo 2', 'Crónica', 'Discapacidad del cuerpo para procesar glucosa en sangre.'),
('ENF-003', 'Asma Bronquial', 'Respiratoria', 'Enfermedad crónica que inflama y estrecha las vías respiratorias.'),
('ENF-004', 'Gripe Viral', 'Viral', 'Infección viral común de nariz, garganta y pulmones.'),
('ENF-005', 'Parasitosis Intestinal', 'Infecciosa', 'Infección por parásitos intestinales común en zonas vulnerables.'),
('ENF-006', 'Anemia Ferropénica', 'Nutricional', 'Deficiencia de glóbulos rojos por falta de hierro.'),
('ENF-007', 'Dermatitis Alérgica', 'Dermatológica', 'Reacción alérgica en la piel.'),
('ENF-008', 'Desnutrición Leve', 'Nutricional', 'Ingesta insuficiente de nutrientes.'),
('ENF-009', 'Infección Urinaria', 'Infecciosa', 'Infección en cualquier parte del sistema urinario.'),
('ENF-010', 'Gastritis Aguda', 'Gastrointestinal', 'Inflamación del revestimiento del estómago.');

-- 3. Medicamentos (Con stock inicial)
INSERT INTO medicamentos (codigo_medicamento, nombre_medicamento, presentacion, descripcion, existencia) VALUES
('MED-001', 'Losartán Potásico', 'Tabletas 50mg', 'Antihipertensivo', 500),
('MED-002', 'Insulina NPH', 'Vial 10ml', 'Hormona para tratamiento de diabetes', 100),
('MED-003', 'Acetaminofén', 'Tabletas 500mg', 'Analgésico y antipirético', 1000),
('MED-004', 'Salbutamol', 'Inhalador', 'Broncodilatador para asma', 200),
('MED-005', 'Albendazol', 'Suspensión Oral', 'Antiparasitario', 300),
('MED-006', 'Ácido Fólico', 'Tabletas 5mg', 'Suplemento vitamínico', 600),
('MED-007', 'Loratadina', 'Tabletas 10mg', 'Antihistamínico', 400),
('MED-008', 'Complejo B', 'Inyectable', 'Vitaminas para sistema nervioso', 250),
('MED-009', 'Ciprofloxacina', 'Tabletas 500mg', 'Antibiótico de amplio espectro', 150),
('MED-010', 'Omeprazol', 'Cápsulas 20mg', 'Protector gástrico', 350);


-- -----------------------------------------------------------------------------------------------
-- PASO 2: LOS ACTORES (Tejedores, Médicos, Responsables)
-- -----------------------------------------------------------------------------------------------

-- 1. Tejedores (Staff Administrativo - 5 personas)
INSERT INTO tejedores (cedula_tejedor, nombre_tejedor, apellido_tejedor, fecha_nacimiento, direccion_tejedor, municipio_tejedor, estado_tejedor, parroquia_tejedor, telefono_tejedor, correo_tejedor, profesion_tejedor, fecha_ingreso, tipo_voluntario) VALUES
('V-10234567', 'Ana', 'Pérez', '1985-04-12', 'Av. Bolívar, Res. Centro', 'Libertador', 'Distrito Capital', 'Catedral', '0414-1234567', 'ana.perez@redes.org', 'Administradora', '2023-01-15', 'Coordinador'),
('V-12345678', 'Carlos', 'Ruiz', '1990-08-23', 'Calle 5, La Urbina', 'Sucre', 'Miranda', 'Petare', '0412-2345678', 'carlos.ruiz@redes.org', 'Logístico', '2023-02-10', 'Logística'),
('V-14567890', 'Elena', 'Tovar', '1988-11-05', 'Urb. El Paraíso', 'Libertador', 'Distrito Capital', 'El Paraíso', '0416-3456789', 'elena.tovar@redes.org', 'Trabajadora Social', '2023-03-20', 'Social'),
('V-15678901', 'Luis', 'Méndez', '1992-01-30', 'Av. Sucre, Catia', 'Libertador', 'Distrito Capital', 'Sucre', '0424-4567890', 'luis.mendez@redes.org', 'Chofer', '2023-05-15', 'Logística'),
('V-16789012', 'Carmen', 'Díaz', '1995-06-18', 'Barrio Unión, Petare', 'Sucre', 'Miranda', 'Petare', '0412-5678901', 'carmen.diaz@redes.org', 'Secretaria', '2023-06-01', 'Administrativo');

-- 2. Médicos (Son tejedores también - 3 personas)
-- Primero los creamos en tejedores
INSERT INTO tejedores (cedula_tejedor, nombre_tejedor, apellido_tejedor, fecha_nacimiento, direccion_tejedor, municipio_tejedor, estado_tejedor, parroquia_tejedor, telefono_tejedor, correo_tejedor, profesion_tejedor, fecha_ingreso, tipo_voluntario) VALUES
('V-8901234', 'José', 'Gregorio', '1975-10-26', 'Urb. Santa Mónica', 'Libertador', 'Distrito Capital', 'San Pedro', '0414-9012345', 'dr.gregorio@redes.org', 'Médico Cirujano', '2023-01-10', 'Médico'),
('V-9012345', 'María', 'Pastora', '1980-05-15', 'Av. Panteón', 'Libertador', 'Distrito Capital', 'Altagracia', '0416-0123456', 'dra.pastora@redes.org', 'Pediatra', '2023-02-15', 'Médico'),
('V-11223344', 'Simón', 'Castillo', '1982-12-08', 'Los Chaguaramos', 'Libertador', 'Distrito Capital', 'San Pedro', '0424-1122334', 'dr.castillo@redes.org', 'Cardiólogo', '2023-04-01', 'Médico');

-- Luego los asociamos en la tabla medicos
INSERT INTO medicos (cedula_tejedor, codigo_especialidad, matricula_colegio_medico, matricula_sanidad) VALUES
('V-8901234', 'ESP-003', 'MCM-12345', 'MS-10001'), -- Dr. José (Gral)
('V-9012345', 'ESP-002', 'MCM-67890', 'MS-20002'), -- Dra. María (Pediatra)
('V-11223344', 'ESP-001', 'MCM-54321', 'MS-30003'); -- Dr. Simón (Cardiólogo)

-- 3. Responsables de Comunidad
INSERT INTO responsable (cedula_responsable, nombre_responsable, apellido_responsable, direccion_responsable, telefono_responsable, correo_responsable, cargo, estado, municipio, parroquia) VALUES
('V-5555555', 'Juana', 'Ramírez', 'Sector La Chivera, Cota 905', '0416-5555555', 'juana.comunidad@gmail.com', 'Vocera Principal', 'DC', 'LI', 'EP'), -- El Paraíso
('V-6666666', 'Mateo', 'Bolívar', 'Sector El 70, El Valle', '0414-6666666', 'mateo.lider@gmail.com', 'Coordinador de Salud', 'DC', 'LI', 'EV'); -- El Valle


-- -----------------------------------------------------------------------------------------------
-- PASO 3: EL ESCENARIO (Flujo Principal)
-- -----------------------------------------------------------------------------------------------

-- 1. La Comunidad (2 comunidades)
INSERT INTO comunidades (codigo_comunidad, nombre_comunidad, tipo_comunidad, estado, municipio, parroquia, direccion, ubicacion_fisica, cedula_responsable, cantidad_habitantes, cantidad_familias, cantidad_ninos, cantidad_adolescentes, cantidad_mayores, cantidad_mayores_60, telefono_comunidad, tiene_transporte, tiene_refrigerios, tiene_agua, tiene_espacio_cubierto, tiene_material_educativo) VALUES
('COM-CCS-01', 'Comunidad Cota 905 - Sector La Chivera', '1', 'Distrito Capital', 'Libertador', 'El Paraíso', 'Final Av. Victoria subiendo', 'Cancha techada del sector', 'V-5555555', 1200, 350, 400, 200, 600, 150, '0212-4444444', 0, 1, 1, 1, 0),
('COM-CCS-02', 'Comunidad El 70 - El Valle', '1', 'Distrito Capital', 'Libertador', 'El Valle', 'Calle 14, parte alta', 'Casa Comunal', 'V-6666666', 800, 220, 250, 100, 450, 100, '0212-5555555', 1, 0, 0, 1, 1);

-- 2. El Censo (10 Pacientes)
INSERT INTO pacientes (cedula_paciente, codigo_comunidad, nombre_paciente, apellido_paciente, sexo, fecha_nacimiento, estado, municipio, parroquia, direccion_paciente, telefono_paciente, correo_paciente, nota) VALUES
-- Comunidad Cota 905
('V-20000001', 'COM-CCS-01', 'Pedro', 'Infante', 'M', '1990-01-15', 'DC', 'LI', 'EP', 'Calle Principal', '0412-0000001', 'pedro@mail.com', 'Paciente activo'),
('V-25000002', 'COM-CCS-01', 'Luisa', 'Cáceres', 'F', '2015-05-20', 'DC', 'LI', 'EP', 'Callejón 2', '0412-0000002', 'madre.luisa@mail.com', 'Niña con asma recurrente'),
('V-5000003', 'COM-CCS-01', 'Simón', 'Díaz', 'M', '1955-08-08', 'DC', 'LI', 'EP', 'Sector La Cruz', '0412-0000003', 'simon.tio@mail.com', 'Adulto mayor hipertenso'),
('V-28000004', 'COM-CCS-01', 'Carmen', 'Sosa', 'F', '2000-02-14', 'DC', 'LI', 'EP', 'Vereda 5', '0412-0000004', 'carmen@mail.com', NULL),
('V-32000005', 'COM-CCS-01', 'José', 'Torres', 'M', '2018-11-30', 'DC', 'LI', 'EP', 'Casa 12', '0412-0000005', 'padre.jose@mail.com', 'Control niño sano'),
-- Comunidad El 70
('V-19000006', 'COM-CCS-02', 'Andrés', 'Eloy', 'M', '1985-09-22', 'DC', 'LI', 'EV', 'Calle Real', '0414-0000006', 'andres@mail.com', NULL),
('V-4000007', 'COM-CCS-02', 'Teresa', 'Carreño', 'F', '1948-12-22', 'DC', 'LI', 'EV', 'Sector La Ceiba', '0414-0000007', 'teresa@mail.com', 'Diabética e hipertensa'),
('V-22000008', 'COM-CCS-02', 'Cristóbal', 'Rojas', 'M', '1995-07-05', 'DC', 'LI', 'EV', 'Bloque 1', '0414-0000008', 'cristobal@mail.com', NULL),
('V-31000009', 'COM-CCS-02', 'Arturo', 'Michelena', 'M', '2019-03-10', 'DC', 'LI', 'EV', 'Bloque 2', '0414-0000009', 'mam.arturo@mail.com', 'Dermatitis'),
('V-24000010', 'COM-CCS-02', 'Barbara', 'Rivas', 'F', '1998-10-10', 'DC', 'LI', 'EV', 'Calle 1', '0414-0000010', 'barbara@mail.com', 'Embarazada');

-- Antecedentes (Para 5 pacientes)
INSERT INTO antecedentes (codigo_antecedente, cedula_paciente, peso, talla, temperatura, FC, TA, enfermedades_previas, alergias, enfermedades_familia) VALUES
('ANT-001', 'V-25000002', 35.5, 1.30, 36.5, '85', '100/60', 'Bronquitis', 'Polvo', 'Asma (Madre)'),
('ANT-002', 'V-5000003', 78.0, 1.75, 36.5, '72', '140/90', 'Hipertensión', 'Ninguna', 'Cardiopatía (Padre)'),
('ANT-003', 'V-4000007', 65.0, 1.60, 36.2, '68', '130/85', 'Diabetes T2', 'Penicilina', 'Diabetes (Ambos padres)'),
('ANT-004', 'V-31000009', 18.0, 1.05, 37.0, '90', '95/60', 'Varicela', 'Ninguna', 'Ninguna'),
('ANT-005', 'V-24000010', 62.0, 1.68, 36.6, '75', '110/70', 'Ninguna', 'Aines', 'Hipertensión (Abuela)');


-- 3. La Solicitud
INSERT INTO solicitudes_abordajes (codigo_solicitud, codigo_comunidad, fecha_sugerida, hora_inicio_sugerida, descripcion_actividad, tipo_abordaje, participantes_estimados, recursos_adicionales, transporte, refrigerios, espacio_cubierto, notas_logistica, estado, fecha_solicitud, notas) VALUES
('SOL-26-001', 'COM-CCS-01', '2026-02-28', '08:00', 'Jornada médica integral para niños y adultos mayores.', 'Medico', 200, 'Toldos adicionales', 1, 1, 1, 'Acceso difícil para vehículos grandes', 'aprobada', '2026-02-01 10:00:00', 'Prioridad alta');

-- 4. La Planificación (Abordaje Confirmado)
INSERT INTO abordaje (codigo_abordaje, codigo_comunidad, codigo_solicitud, fecha_abordaje, hora_inicio, hora_fin, descripcion, tipo_abordaje, participantes_estimados, estado, transporte, refrigerios, espacio_cubierto) VALUES
('ABO-26-001', 'COM-CCS-01', 'SOL-26-001', '2026-02-15', '08:00:00', '16:00:00', 'Jornada Médica Cota 905', 'Medico', 200, 'En Curso', 1, 1, 1);

-- Personal Asignado al Abordaje
INSERT INTO tejedores_abordaje (codigo_abordaje, cedula_tejedor, rol_en_abordaje) VALUES
('ABO-26-001', 'V-10234567', 'Coordinador General'), -- Ana (Admin)
('ABO-26-001', 'V-12345678', 'Logística'), -- Carlos (Logística)
('ABO-26-001', 'V-8901234', 'Médico General'), -- Dr. José
('ABO-26-001', 'V-9012345', 'Pediatra'), -- Dra. María
('ABO-26-001', 'V-11223344', 'Cardiólogo'); -- Dr. Simón

-- 5. La Ejecución (Consultas del Abordaje)

-- Consulta 1: Niño con Asma (Atendido por Dra. María)
INSERT INTO consultas (codigo_consulta, codigo_abordaje, cedula_paciente, cedula_medico, motivo_consulta, diagnostico_texto, recomendaciones, tratamiento, tension_arterial) VALUES
('CON-001', 'ABO-26-001', 'V-25000002', 'V-9012345', 'Dificultad para respirar y tos nocturna', 'Crisis asmática leve', 'Uso de inhalador, evitar polvo', 'Salbutamol cada 6 horas', '100/60');
-- Enfermedad detectada
INSERT INTO consultas_enfermedades (codigo_consulta, codigo_enfermedad, observacion_especifica) VALUES
('CON-001', 'ENF-003', 'Sibilancias presentes');

-- Consulta 2: Adulto Mayor Hipertenso (Atendido por Dr. Simón)
INSERT INTO consultas (codigo_consulta, codigo_abordaje, cedula_paciente, cedula_medico, motivo_consulta, diagnostico_texto, recomendaciones, tratamiento, tension_arterial) VALUES
('CON-002', 'ABO-26-001', 'V-5000003', 'V-11223344', 'Dolor de cabeza y mareos', 'Hipertensión descontrolada', 'Dieta baja en sal, control diario de TA', 'Losartán 50mg diario', '160/100');
-- Enfermedad detectada
INSERT INTO consultas_enfermedades (codigo_consulta, codigo_enfermedad, observacion_especifica) VALUES
('CON-002', 'ENF-001', 'Requiere ajuste de dosis');

-- Consulta 3: Paciente con Gripe (Atendido por Dr. José)
INSERT INTO consultas (codigo_consulta, codigo_abordaje, cedula_paciente, cedula_medico, motivo_consulta, diagnostico_texto, recomendaciones, tratamiento, tension_arterial) VALUES
('CON-003', 'ABO-26-001', 'V-20000001', 'V-8901234', 'Malestar general y fiebre', 'Síndrome viral agudo', 'Reposo, hidratación', 'Acetaminofén SOS', '120/80');
-- Enfermedad detectada
INSERT INTO consultas_enfermedades (codigo_consulta, codigo_enfermedad, observacion_especifica) VALUES
('CON-003', 'ENF-004', 'Posible gripe estacional');

-- Consulta 4: Niño con Dermatitis (Atendido por Dra. María)
INSERT INTO consultas (codigo_consulta, codigo_abordaje, cedula_paciente, cedula_medico, motivo_consulta, diagnostico_texto, recomendaciones, tratamiento, tension_arterial) VALUES
('CON-004', 'ABO-26-001', 'V-32000005', 'V-9012345', 'Erupción en la piel', 'Dermatitis atópica', 'Uso de crema hidratante, jabón neutro', 'Loratadina jarabe', 'N/A');
-- Enfermedad detectada
INSERT INTO consultas_enfermedades (codigo_consulta, codigo_enfermedad, observacion_especifica) VALUES
('CON-004', 'ENF-007', 'Brote agudo en brazos');

-- Consulta 5: Adulto con Parasitosis (Atendido por Dr. José)
INSERT INTO consultas (codigo_consulta, codigo_abordaje, cedula_paciente, cedula_medico, motivo_consulta, diagnostico_texto, recomendaciones, tratamiento, tension_arterial) VALUES
('CON-005', 'ABO-26-001', 'V-28000004', 'V-8901234', 'Dolor abdominal', 'Parasitosis intestinal probable', 'Hervir el agua, lavar alimentos', 'Albendazol dosis única', '110/70');
-- Enfermedad detectada
INSERT INTO consultas_enfermedades (codigo_consulta, codigo_enfermedad, observacion_especifica) VALUES
('CON-005', 'ENF-005', 'Dolor en epigastrio');


-- 6. El Tratamiento (Entrega de Medicamentos)
-- Se descuenta lógica del inventario (Aunque este script solo inserta, la app manejaría el descuento, aquí simulamos el registro)

-- Para Consulta 1 (Asma) -> Salbutamol
INSERT INTO medicamentos_pacientes (codigo_medicamento, cedula_paciente, codigo_abordaje, fecha_entrega, cantidad_entregada, cedula_tejedor) VALUES
('MED-004', 'V-25000002', 'ABO-26-001', '2026-02-15', 1, 'V-12345678'); -- Salbutamol entregado por Carlos (Logística)

-- Para Consulta 2 (Hipertensión) -> Losartán
INSERT INTO medicamentos_pacientes (codigo_medicamento, cedula_paciente, codigo_abordaje, fecha_entrega, cantidad_entregada, cedula_tejedor) VALUES
('MED-001', 'V-5000003', 'ABO-26-001', '2026-02-15', 2, 'V-12345678'); -- 2 blisters de Losartán

-- Para Consulta 3 (Gripe) -> Acetaminofén
INSERT INTO medicamentos_pacientes (codigo_medicamento, cedula_paciente, codigo_abordaje, fecha_entrega, cantidad_entregada, cedula_tejedor) VALUES
('MED-003', 'V-20000001', 'ABO-26-001', '2026-02-15', 1, 'V-12345678');

-- Para Consulta 4 (Dermatitis) -> Loratadina
INSERT INTO medicamentos_pacientes (codigo_medicamento, cedula_paciente, codigo_abordaje, fecha_entrega, cantidad_entregada, cedula_tejedor) VALUES
('MED-007', 'V-32000005', 'ABO-26-001', '2026-02-15', 1, 'V-12345678');

-- Para Consulta 5 (Parásitos) -> Albendazol
INSERT INTO medicamentos_pacientes (codigo_medicamento, cedula_paciente, codigo_abordaje, fecha_entrega, cantidad_entregada, cedula_tejedor) VALUES
('MED-005', 'V-28000004', 'ABO-26-001', '2026-02-15', 2, 'V-12345678');

-- Registro de asistencia para cerrar el círculo (Opcional según instrucciones pero recomendado)
INSERT INTO abordaje_asistencia (codigo_abordaje, cedula_paciente, hora_llegada, estado, servicios_requeridos) VALUES
('ABO-26-001', 'V-25000002', '2026-02-15 08:30:00', 'Finalizado', 'Medicina,Farmacia'),
('ABO-26-001', 'V-5000003', '2026-02-15 08:45:00', 'Finalizado', 'Medicina,Farmacia'),
('ABO-26-001', 'V-20000001', '2026-02-15 09:00:00', 'Finalizado', 'Medicina,Farmacia'),
('ABO-26-001', 'V-32000005', '2026-02-15 09:15:00', 'Finalizado', 'Medicina,Farmacia'),
('ABO-26-001', 'V-28000004', '2026-02-15 09:30:00', 'Finalizado', 'Medicina,Farmacia');


SET FOREIGN_KEY_CHECKS = 1;
