import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnfermedadForm } from '@/components/forms/EnfermedadForm';
import { Enfermedad } from '@/db/schema/enfermedades';

describe('EnfermedadForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render form with empty fields when no initial data', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByLabelText(/código/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/tipo de patología/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
        });

        it('should render form with initial data when provided', () => {
            const initialData: Enfermedad = {
                codigoEnfermedad: 'ENF-001',
                nombreEnfermedad: 'Hipertensión Arterial',
                tipoPatologia: 'Cardíacas / Cardiovasculares',
                descripcion: 'Presión arterial elevada de forma crónica',
            };

            render(
                <EnfermedadForm
                    initialData={initialData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            expect(screen.getByDisplayValue('ENF-001')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Hipertensión Arterial')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Presión arterial elevada de forma crónica')).toBeInTheDocument();
        });

        it('should disable codigo field when editing initial data', () => {
            const initialData: Enfermedad = {
                codigoEnfermedad: 'ENF-001',
                nombreEnfermedad: 'Hipertensión',
                tipoPatologia: 'Cardíacas',
            };

            render(
                <EnfermedadForm
                    initialData={initialData}
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const codigoInput = screen.getByLabelText(/código/i) as HTMLInputElement;
            expect(codigoInput).toBeDisabled();
        });
    });

    describe('Form Validation', () => {
        it('should require nombre field', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
            expect(nombreInput).toBeRequired();
        });

        it('should enforce maxLength on nombre field', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
            expect(nombreInput).toHaveAttribute('maxLength', '100');
        });
    });

    describe('Form Interactions', () => {
        it('should update nombre field on change', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const nombreInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
            fireEvent.change(nombreInput, { target: { value: 'Nueva Enfermedad' } });

            expect(nombreInput.value).toBe('Nueva Enfermedad');
        });

        it('should update descripcion field on change', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const descripcionTextarea = screen.getByLabelText(/descripción/i) as HTMLTextAreaElement;
            fireEvent.change(descripcionTextarea, { target: { value: 'Nueva descripción' } });

            expect(descripcionTextarea.value).toBe('Nueva descripción');
        });

        it('should call onCancel when cancel button is clicked', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const cancelButton = screen.getByText(/cancelar/i);
            fireEvent.click(cancelButton);

            expect(mockOnCancel).toHaveBeenCalledTimes(1);
        });

        it('should call onSubmit with form data when submitted', async () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                />
            );

            const codigoInput = screen.getByLabelText(/código/i);
            const nombreInput = screen.getByLabelText(/nombre/i);
            const descripcionTextarea = screen.getByLabelText(/descripción/i);

            fireEvent.change(codigoInput, { target: { value: 'ENF-002' } });
            fireEvent.change(nombreInput, { target: { value: 'Diabetes Tipo 2' } });
            fireEvent.change(descripcionTextarea, { target: { value: 'Enfermedad metabólica' } });

            const submitButton = screen.getByText(/guardar enfermedad/i);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledTimes(1);
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        codigoEnfermedad: 'ENF-002',
                        nombreEnfermedad: 'Diabetes Tipo 2',
                        descripcion: 'Enfermedad metabólica',
                    })
                );
            });
        });
    });

    describe('Loading State', () => {
        it('should disable buttons when isLoading is true', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    isLoading={true}
                />
            );

            const cancelButton = screen.getByText(/cancelar/i);
            const submitButton = screen.getByText(/guardando/i);

            expect(cancelButton).toBeDisabled();
            expect(submitButton).toBeDisabled();
        });

        it('should show custom submit label when provided', () => {
            render(
                <EnfermedadForm
                    onSubmit={mockOnSubmit}
                    onCancel={mockOnCancel}
                    submitLabel="Crear Enfermedad"
                />
            );

            expect(screen.getByText('Crear Enfermedad')).toBeInTheDocument();
        });
    });
});
