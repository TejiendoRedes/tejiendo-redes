'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity } from 'lucide-react';
import { Antecedente } from '@/db/schema/antecedentes';
import { Paciente } from '@/db/schema/pacientes';
import { createAntecedente, deleteAntecedente, updateAntecedente, getNextAntecedenteCodigo } from '@/actions/antecedentes-actions';
import { getPacientes } from '@/actions/pacientes-actions';
import { AsyncSearchableSelect } from '@/components/shared/AsyncSearchableSelect';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { NumberInput } from '@/components/ui/number-input';
import { BloodPressureInput } from '@/components/ui/blood-pressure-input';
import { toast } from 'sonner';

interface AntecedenteWithPaciente extends Antecedente {
    paciente: Paciente | null;
}

// Interface for Pacientes (assuming standard structure from patients action)
interface PacienteData extends Paciente {
    // Add any joined community data if present in getPacientes, though not strictly needed for just names
    [key: string]: any;
}

interface AntecedentesClientProps {
    initialData: AntecedenteWithPaciente[];
    pacientes: PacienteData[];
}

export default function AntecedentesClient({ initialData, pacientes }: AntecedentesClientProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingAntecedente, setEditingAntecedente] = React.useState<AntecedenteWithPaciente | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const [formData, setFormData] = React.useState({
        codigoAntecedente: '',
        cedulaPaciente: '',
        peso: '',
        talla: '',
        temperatura: '',
        FC: '',
        TA: '',
        enfermedadesPrevias: '',
        alergias: '',
        enfermedadesFamilia: '',
    });

    const handleAdd = async () => {
        setEditingAntecedente(null);
        setIsLoading(true);

        let nextCodigo = '';
        const res = await getNextAntecedenteCodigo();
        if (res.success && res.data) {
            nextCodigo = res.data;
        }

        setFormData({
            codigoAntecedente: nextCodigo,
            cedulaPaciente: '',
            peso: '',
            talla: '',
            temperatura: '',
            FC: '',
            TA: '',
            enfermedadesPrevias: '',
            alergias: '',
            enfermedadesFamilia: '',
        });
        setIsLoading(false);
        setIsModalOpen(true);
    };

    const getInitialPatientName = () => {
        if (!editingAntecedente || !editingAntecedente.paciente) return undefined;
        return `${editingAntecedente.paciente.nombrePaciente} ${editingAntecedente.paciente.apellidoPaciente}`;
    };

    const handleEdit = (antecedente: AntecedenteWithPaciente) => {
        setEditingAntecedente(antecedente);
        setFormData({
            codigoAntecedente: antecedente.codigoAntecedente,
            cedulaPaciente: antecedente.cedulaPaciente,
            peso: antecedente.peso.toString(),
            talla: (parseFloat(antecedente.talla.toString()) * 100).toString(), // Convert m to cm for form
            temperatura: antecedente.temperatura.toString(),
            FC: antecedente.FC,
            TA: antecedente.TA,
            enfermedadesPrevias: antecedente.enfermedadesPrevias,
            alergias: antecedente.alergias,
            enfermedadesFamilia: antecedente.enfermedadesFamilia,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar este registro de antecedentes?')) {
            const res = await deleteAntecedente(codigo);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate numeric inputs
            if (isNaN(parseFloat(formData.peso)) || isNaN(parseFloat(formData.talla)) || isNaN(parseFloat(formData.temperatura))) {
                toast.error('Peso, Talla y Temperatura deben ser valores numéricos válidos');
                setIsLoading(false);
                return;
            }

            const dataToSubmit = {
                ...formData,
                peso: formData.peso,
                talla: (parseFloat(formData.talla) / 100).toString(), // Convert cm to m for DB decimal(3,2)
                temperatura: formData.temperatura,
            };

            let res;
            if (editingAntecedente) {
                // Remove codigoAntecedente from update data as it is PK
                const { codigoAntecedente, ...updateData } = dataToSubmit;
                res = await updateAntecedente(editingAntecedente.codigoAntecedente, updateData);
            } else {
                res = await createAntecedente(dataToSubmit);
            }

            if (res.success) {
                toast.success(res.message);
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const columns: Column<AntecedenteWithPaciente>[] = [
        {
            key: 'codigoAntecedente',
            label: 'Código',
            sortable: true,
        },
        {
            key: 'cedulaPaciente',
            label: 'Paciente',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.paciente?.nombrePaciente} {row.paciente?.apellidoPaciente}</span>
                    <span className="text-xs text-gray-500">{row.cedulaPaciente}</span>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'peso',
            label: 'Peso (kg)',
            sortable: true,
        },
        {
            key: 'talla',
            label: 'Talla (m)',
            sortable: true,
        },
        {
            key: 'temperatura',
            label: 'Temp (°C)',
            sortable: true,
        },
        {
            key: 'FC',
            label: 'F.C.',
            sortable: true,
        },
        {
            key: 'TA',
            label: 'T.A.',
            sortable: true,
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row)}
                        title="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.codigoAntecedente)}
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = initialData.map(row => ({
            codigo: row.codigoAntecedente,
            paciente: `${row.paciente?.nombrePaciente} ${row.paciente?.apellidoPaciente} (${row.cedulaPaciente})`,
            peso: `${row.peso} kg`,
            talla: `${row.talla} m`,
            temp: `${row.temperatura} °C`,
            fc: row.FC,
            ta: row.TA,
            previas: row.enfermedadesPrevias,
            alergias: row.alergias,
            familia: row.enfermedadesFamilia,
        }));

        const headers = ['codigo', 'paciente', 'peso', 'talla', 'temp', 'fc', 'ta', 'previas', 'alergias', 'familia'];
        const columnsData = [
            { header: 'Código', dataKey: 'codigo' },
            { header: 'Paciente', dataKey: 'paciente' },
            { header: 'Peso', dataKey: 'peso' },
            { header: 'Talla', dataKey: 'talla' },
            { header: 'Temp', dataKey: 'temp' },
            { header: 'F.C.', dataKey: 'fc' },
            { header: 'T.A.', dataKey: 'ta' },
            { header: 'Previas', dataKey: 'previas' },
            { header: 'Alergias', dataKey: 'alergias' },
            { header: 'Familia', dataKey: 'familia' },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, headers, 'antecedentes'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'antecedentes', 'Reporte de Antecedentes Médicos'));
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Antecedentes Médicos</h1>
                    <p className="text-gray-600">
                        Gestión del historial médico y signos vitales de pacientes
                    </p>
                </div>

                <DataTable
                    data={initialData}
                    columns={columns}
                    searchPlaceholder="Buscar por código o cédula..."
                    onAdd={handleAdd}
                    addLabel="Agregar Antecedente"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Activity className="w-6 h-6 text-blue-600" />
                                {editingAntecedente ? 'Editar Antecedente' : 'Nuevo Antecedente'}
                            </DialogTitle>
                            <DialogDescription>
                                Ingrese los datos básicos y antecedentes del paciente.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo">Código Antecedente *</Label>
                                    <Input
                                        id="codigo"
                                        value={formData.codigoAntecedente}
                                        onChange={(e) => setFormData({ ...formData, codigoAntecedente: e.target.value })}
                                        required
                                        disabled={true}
                                        maxLength={10}
                                        placeholder="Generando código..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paciente">Paciente *</Label>
                                    <AsyncSearchableSelect
                                        fetcher={getPacientes}
                                        value={formData.cedulaPaciente}
                                        onValueChange={(value) => setFormData({ ...formData, cedulaPaciente: value })}
                                        placeholder="Seleccione un paciente"
                                        searchPlaceholder="Buscar por nombre o cédula..."
                                        idField="cedulaPaciente"
                                        labelField="nombrePaciente"
                                        secondaryLabelField="cedulaPaciente"
                                        disabled={!!editingAntecedente}
                                        initialLabel={getInitialPatientName()}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="peso">Peso (kg) *</Label>
                                    <NumberInput
                                        id="peso"
                                        suffix="kg"
                                        value={formData.peso}
                                        onChange={(val) => setFormData({ ...formData, peso: val })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="talla">Talla (cm) *</Label>
                                    <NumberInput
                                        id="talla"
                                        suffix="cm"
                                        value={formData.talla}
                                        onChange={(val) => setFormData({ ...formData, talla: val })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temperatura">Temperatura (°C) *</Label>
                                    <NumberInput
                                        id="temperatura"
                                        suffix="°C"
                                        value={formData.temperatura}
                                        onChange={(val) => setFormData({ ...formData, temperatura: val })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fc">Frecuencia Cardíaca (FC) *</Label>
                                    <Input
                                        id="fc"
                                        value={formData.FC}
                                        onChange={(e) => setFormData({ ...formData, FC: e.target.value })}
                                        required
                                        maxLength={10}
                                    />
                                </div>

                                <div className="space-y-4 pt-2">
                                    <BloodPressureInput
                                        value={formData.TA}
                                        onChange={(val) => setFormData({ ...formData, TA: val })}
                                        label="Tensión Arterial (TA) *"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h3 className="font-medium text-gray-900">Antecedentes Patológicos</h3>

                                <div className="space-y-2">
                                    <Label htmlFor="enfermedadesPrevias">Enfermedades Previas *</Label>
                                    <Textarea
                                        id="enfermedadesPrevias"
                                        value={formData.enfermedadesPrevias}
                                        onChange={(e) => setFormData({ ...formData, enfermedadesPrevias: e.target.value })}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="alergias">Alergias *</Label>
                                    <Textarea
                                        id="alergias"
                                        value={formData.alergias}
                                        onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                                        required
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="enfermedadesFamilia">Enfermedades Familiares *</Label>
                                    <Textarea
                                        id="enfermedadesFamilia"
                                        value={formData.enfermedadesFamilia}
                                        onChange={(e) => setFormData({ ...formData, enfermedadesFamilia: e.target.value })}
                                        required
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : (editingAntecedente ? 'Actualizar Antecedente' : 'Guardar Antecedente')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
