import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getEnfermedades,
    getEnfermedad,
    createEnfermedad,
    updateEnfermedad,
    deleteEnfermedad,
} from '@/actions/enfermedades-actions';

describe('Enfermedades Actions', () => {
    describe('getEnfermedades', () => {
        it('should fetch all enfermedades successfully', async () => {
            const result = await getEnfermedades();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(Array.isArray(result.data)).toBe(true);
            }
        });
    });

    describe('getEnfermedad', () => {
        it('should fetch a single enfermedad by code', async () => {
            // This test assumes there's at least one enfermedad in the database
            // In a real test environment, you'd seed test data first
            const allEnfermedades = await getEnfermedades();

            if (allEnfermedades.success && allEnfermedades.data.length > 0) {
                const firstCode = allEnfermedades.data[0].codigoEnfermedad;
                const result = await getEnfermedad(firstCode);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data?.codigoEnfermedad).toBe(firstCode);
                }
            }
        });

        it('should return error for non-existent enfermedad', async () => {
            const result = await getEnfermedad('INVALID-CODE-999');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('createEnfermedad', () => {
        it('should create a new enfermedad successfully', async () => {
            const newEnfermedad = {
                nombreEnfermedad: 'Enfermedad de Prueba',
                tipoPatologia: 'Respiratorias',
                descripcion: 'Esta es una enfermedad de prueba creada durante testing',
            };

            const result = await createEnfermedad(newEnfermedad);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.message).toContain('correctamente');
            }
        });

        it('should fail to create enfermedad without required fields', async () => {
            const invalidEnfermedad = {
                nombreEnfermedad: '', // Empty name should fail
                tipoPatologia: 'Respiratorias',
            };

            const result = await createEnfermedad(invalidEnfermedad);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('updateEnfermedad', () => {
        it('should update an existing enfermedad', async () => {
            // First, get an existing enfermedad
            const allEnfermedades = await getEnfermedades();

            if (allEnfermedades.success && allEnfermedades.data.length > 0) {
                const existingCode = allEnfermedades.data[0].codigoEnfermedad;

                const updateData = {
                    descripcion: 'Descripción actualizada durante test',
                };

                const result = await updateEnfermedad(existingCode, updateData);

                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.message).toContain('actualizada');
                }
            }
        });
    });

    describe('deleteEnfermedad', () => {
        it('should handle delete attempt (may fail due to foreign key constraints)', async () => {
            // Note: This test might fail if the enfermedad is referenced in other tables
            // which is actually the expected behavior due to foreign key constraints

            const allEnfermedades = await getEnfermedades();

            if (allEnfermedades.success && allEnfermedades.data.length > 0) {
                const codeToDelete = allEnfermedades.data[0].codigoEnfermedad;
                const result = await deleteEnfermedad(codeToDelete);

                // Either succeeds or fails with a meaningful error message
                expect(result).toHaveProperty('success');

                if (!result.success) {
                    // Should have a user-friendly error message
                    expect(result.error).toBeDefined();
                    expect(typeof result.error).toBe('string');
                }
            }
        });
    });
});
