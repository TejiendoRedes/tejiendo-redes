import { mysqlTable, varchar, text, date, int, index, primaryKey, foreignKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { estados, municipios, parroquias } from './geografia';
import { responsable } from './responsable';
import { users } from './users';
import { abordaje } from './abordajes';
import { comunidades } from './comunidades';
import { consultas } from './consultas';
import { enfermedades } from './enfermedades';
import { medicamentos } from './medicamentos';
import { pacientes } from './pacientes';
import { tejedores } from './tejedores';
import { abordajeAsistencia } from './abordaje-asistencia';
import { entregasMedicamentos } from './entregas_medicamentos';
import { medicos } from './medicos';
import { organismos } from './organismos';
import { solicitudesAbordajes } from './solicitudes-abordajes';
import { aspirantes } from './aspirantes';
import { movimientosInventario } from './movimientos_inventario';
import { antecedentes } from './antecedentes';
import { especialidades } from './especialidades';

/**
 * Tabla puente: consultas_enfermedades
 * Relación muchos a muchos entre consultas y enfermedades
 */
export const consultasEnfermedades = mysqlTable('consultas_enfermedades', {
    codigoConsulta: varchar('codigo_consulta', { length: 10 }).notNull(),
    codigoEnfermedad: varchar('codigo_enfermedad', { length: 10 }).notNull(),
    observacionEspecifica: text('observacion_especifica'), // Nota opcional sobre esta enfermedad en este paciente
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoConsulta, table.codigoEnfermedad], name: 'cons_enf_pk' }),
    codigoEnfermedadIdx: index('idx_codigo_enfermedad').on(table.codigoEnfermedad),
    consFk: foreignKey({
        columns: [table.codigoConsulta],
        foreignColumns: [consultas.codigoConsulta],
        name: 'cons_enf_cons_fk'
    }).onDelete('cascade').onUpdate('cascade'),
    enfFk: foreignKey({
        columns: [table.codigoEnfermedad],
        foreignColumns: [enfermedades.codigoEnfermedad],
        name: 'cons_enf_enf_fk'
    }).onDelete('restrict').onUpdate('cascade'),
}));

/**
 * Tabla puente: tejedores_abordaje
 * Relación muchos a muchos entre tejedores y abordajes
 */
export const tejedoresAbordaje = mysqlTable('tejedores_abordaje', {
    codigoAbordaje: varchar('codigo_abordaje', { length: 10 }).notNull(),
    cedulaTejedor: varchar('cedula_tejedor', { length: 12 }).notNull(),
    rolEnAbordaje: varchar('rol_en_abordaje', { length: 50 }),
}, (table) => ({
    pk: primaryKey({ columns: [table.codigoAbordaje, table.cedulaTejedor], name: 'tej_ab_pk' }),
    cedulaTejedorIdx: index('idx_cedula_tejedor').on(table.cedulaTejedor),
    abFk: foreignKey({
        columns: [table.codigoAbordaje],
        foreignColumns: [abordaje.codigoAbordaje],
        name: 'tej_ab_ab_fk'
    }).onDelete('cascade').onUpdate('cascade'),
    tejFk: foreignKey({
        columns: [table.cedulaTejedor],
        foreignColumns: [tejedores.cedulaTejedor],
        name: 'tej_ab_tej_fk'
    }).onDelete('restrict').onUpdate('cascade'),
}));

export type ConsultaEnfermedad = typeof consultasEnfermedades.$inferSelect;
export type NewConsultaEnfermedad = typeof consultasEnfermedades.$inferInsert;

export type TejedorAbordaje = typeof tejedoresAbordaje.$inferSelect;
export type NewTejedorAbordaje = typeof tejedoresAbordaje.$inferInsert;

// --- Relaciones de Consulta Drizzle ---

export const estadosRelations = relations(estados, ({ many }) => ({
    municipios: many(municipios),
}));

export const municipiosRelations = relations(municipios, ({ one, many }) => ({
    estado: one(estados, {
        fields: [municipios.estadoId],
        references: [estados.id],
    }),
    parroquias: many(parroquias),
}));

export const parroquiasRelations = relations(parroquias, ({ one, many }) => ({
    municipio: one(municipios, {
        fields: [parroquias.municipioId],
        references: [municipios.id],
    }),
    tejedores: many(tejedores),
    responsables: many(responsable),
    comunidades: many(comunidades),
    organismos: many(organismos),
}));

export const tejedoresRelations = relations(tejedores, ({ one, many }) => ({
    parroquia: one(parroquias, {
        fields: [tejedores.parroquiaId],
        references: [parroquias.id],
    }),
    user: one(users, {
        fields: [tejedores.cedulaTejedor],
        references: [users.cedulaTejedor],
    }),
    medico: one(medicos, {
        fields: [tejedores.cedulaTejedor],
        references: [medicos.cedulaTejedor],
    }),
    tejedoresAbordaje: many(tejedoresAbordaje),
    consultas: many(consultas),
    entregasMedicamentos: many(entregasMedicamentos),
}));

export const responsableRelations = relations(responsable, ({ one, many }) => ({
    parroquia: one(parroquias, {
        fields: [responsable.parroquiaId],
        references: [parroquias.id],
    }),
    comunidades: many(comunidades),
}));

export const comunidadesRelations = relations(comunidades, ({ one, many }) => ({
    parroquia: one(parroquias, {
        fields: [comunidades.parroquiaId],
        references: [parroquias.id],
    }),
    responsable: one(responsable, {
        fields: [comunidades.cedulaResponsable],
        references: [responsable.cedulaResponsable],
    }),
    abordajes: many(abordaje),
    pacientes: many(pacientes),
}));

export const usersRelations = relations(users, ({ one }) => ({
    tejedor: one(tejedores, {
        fields: [users.cedulaTejedor],
        references: [tejedores.cedulaTejedor],
    }),
}));

export const abordajeRelations = relations(abordaje, ({ one, many }) => ({
    comunidad: one(comunidades, {
        fields: [abordaje.codigoComunidad],
        references: [comunidades.codigoComunidad],
    }),
    solicitud: one(solicitudesAbordajes, {
        fields: [abordaje.codigoSolicitud],
        references: [solicitudesAbordajes.codigoSolicitud],
    }),
    tejedoresAbordaje: many(tejedoresAbordaje),
    consultas: many(consultas),
    entregasMedicamentos: many(entregasMedicamentos),
    asistencia: many(abordajeAsistencia),
}));

export const consultasRelations = relations(consultas, ({ one, many }) => ({
    abordaje: one(abordaje, {
        fields: [consultas.codigoAbordaje],
        references: [abordaje.codigoAbordaje],
    }),
    paciente: one(pacientes, {
        fields: [consultas.cedulaPaciente],
        references: [pacientes.cedulaPaciente],
    }),
    medico: one(tejedores, {
        fields: [consultas.cedulaMedico],
        references: [tejedores.cedulaTejedor],
    }),
    consultasEnfermedades: many(consultasEnfermedades),
}));

export const pacientesRelations = relations(pacientes, ({ one, many }) => ({
    comunidad: one(comunidades, {
        fields: [pacientes.codigoComunidad],
        references: [comunidades.codigoComunidad],
    }),
    antecedentes: one(antecedentes, {
        fields: [pacientes.cedulaPaciente],
        references: [antecedentes.cedulaPaciente],
    }),
    consultas: many(consultas),
    entregasMedicamentos: many(entregasMedicamentos),
    asistencia: many(abordajeAsistencia),
}));

export const medicamentosRelations = relations(medicamentos, ({ many }) => ({
    entregasMedicamentos: many(entregasMedicamentos),
    movimientosInventario: many(movimientosInventario),
}));

export const entregasMedicamentosRelations = relations(entregasMedicamentos, ({ one }) => ({
    paciente: one(pacientes, {
        fields: [entregasMedicamentos.codigoPaciente],
        references: [pacientes.cedulaPaciente],
    }),
    medicamento: one(medicamentos, {
        fields: [entregasMedicamentos.codigoMedicamento],
        references: [medicamentos.codigoMedicamento],
    }),
    abordaje: one(abordaje, {
        fields: [entregasMedicamentos.codigoAbordaje],
        references: [abordaje.codigoAbordaje],
    }),
    tejedor: one(tejedores, {
        fields: [entregasMedicamentos.cedulaTejedor],
        references: [tejedores.cedulaTejedor],
    }),
}));

export const tejedoresAbordajeRelations = relations(tejedoresAbordaje, ({ one }) => ({
    abordaje: one(abordaje, {
        fields: [tejedoresAbordaje.codigoAbordaje],
        references: [abordaje.codigoAbordaje],
    }),
    tejedor: one(tejedores, {
        fields: [tejedoresAbordaje.cedulaTejedor],
        references: [tejedores.cedulaTejedor],
    }),
}));

export const consultasEnfermedadesRelations = relations(consultasEnfermedades, ({ one }) => ({
    consulta: one(consultas, {
        fields: [consultasEnfermedades.codigoConsulta],
        references: [consultas.codigoConsulta],
    }),
    enfermedad: one(enfermedades, {
        fields: [consultasEnfermedades.codigoEnfermedad],
        references: [enfermedades.codigoEnfermedad],
    }),
}));

export const enfermedadesRelations = relations(enfermedades, ({ many }) => ({
    consultasEnfermedades: many(consultasEnfermedades),
}));

export const medicosRelations = relations(medicos, ({ one }) => ({
    tejedor: one(tejedores, {
        fields: [medicos.cedulaTejedor],
        references: [tejedores.cedulaTejedor],
    }),
    especialidad: one(especialidades, {
        fields: [medicos.codigoEspecialidad],
        references: [especialidades.codigoEspecialidad],
    }),
}));

export const organismosRelations = relations(organismos, ({ one }) => ({
    parroquia: one(parroquias, {
        fields: [organismos.parroquiaId],
        references: [parroquias.id],
    }),
}));

export const especialidadesRelations = relations(especialidades, ({ many }) => ({
    medicos: many(medicos),
}));
