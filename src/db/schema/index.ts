/**
 * @module db/schema
 * @description Barrel export de todas las tablas de la base de datos.
 *
 * Cada archivo en este directorio define una tabla MySQL usando Drizzle ORM.
 * Los tipos `$inferSelect` y `$inferInsert` se exportan automáticamente
 * para uso en Server Actions y componentes.
 *
 * Las relaciones entre tablas se definen en `relations.ts`.
 */

// Export all schema tables
export * from './responsable';
export * from './users';
export * from './audit_logs';
export * from './tejedores';
export * from './especialidades';
export * from './enfermedades';
export * from './comunidades';
export * from './organismos';
export * from './pacientes';
export * from './antecedentes';
export * from './medicamentos';
export * from './abordajes';
export * from './medicos';
export * from './consultas';
export * from './relations';
export * from './aspirantes';
export * from './peticiones';
export * from './solicitudes-abordajes';
export * from './abordaje-asistencia';
export * from './mantenimiento';
export * from './movimientos_inventario';
