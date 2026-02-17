'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Activity, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from 'sonner';

import type { Consulta } from '@/db/schema/consultas';
import type { Paciente } from '@/db/schema/pacientes';
import type { Enfermedad } from '@/db/schema/enfermedades';
// We need extended types for lists
import { createConsulta, updateConsulta, deleteConsulta, getEnfermedadesByConsulta } from '@/actions/consultas-actions';

interface ConsultasClientProps {
    consultas: any[]; // Using any for joined result type momentarily
    pacientes: any[];
    medicos: any[];
    abordajes: any[];
    enfermedades: Enfermedad[];
}

export default function ConsultasClient({
    consultas: initialConsultas,
    pacientes,
    medicos,
    abordajes,
    enfermedades
}: ConsultasClientProps) {
    const [consultasData, setConsultasData] = React.useState(initialConsultas);
    const router = useRouter();

    // Sincronizar estado local cuando los datos del servidor cambian (router.refresh())
    React.useEffect(() => {
        setConsultasData(initialConsultas);
    }, [initialConsultas]);

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);

    // Form State
    const [formData, setFormData] = React.useState({
        codigoConsulta: '',
        codigoAbordaje: '',
        cedulaPaciente: '',
        cedulaMedico: '',
        motivoConsulta: '',
        diagnosticoTexto: '',
        recomendaciones: '',
        tratamiento: '',
    });
    const [selectedEnfermedades, setSelectedEnfermedades] = React.useState<string[]>([]);

    const handleAdd = () => {
        setEditingId(null);
        setFormData({
            codigoConsulta: '',
            codigoAbordaje: '',
            cedulaPaciente: '',
            cedulaMedico: '',
            motivoConsulta: '',
            diagnosticoTexto: '',
            recomendaciones: '',
            tratamiento: '',
        });
        setSelectedEnfermedades([]);
        setIsModalOpen(true);
    };

    const handleEdit = async (consulta: any) => {
        setEditingId(consulta.consulta.codigoConsulta);
        setFormData({
            codigoConsulta: consulta.consulta.codigoConsulta,
            codigoAbordaje: consulta.consulta.codigoAbordaje,
            cedulaPaciente: consulta.consulta.cedulaPaciente,
            cedulaMedico: consulta.consulta.cedulaMedico,
            motivoConsulta: consulta.consulta.motivoConsulta,
            diagnosticoTexto: consulta.consulta.diagnosticoTexto,
            recomendaciones: consulta.consulta.recomendaciones,
            tratamiento: consulta.consulta.tratamiento,
        });

        // Fetch relations
        const relRes = await getEnfermedadesByConsulta(consulta.consulta.codigoConsulta);
        if (relRes.success && relRes.data) {
            setSelectedEnfermedades(relRes.data.map((r: any) => r.codigoEnfermedad));
        } else {
            setSelectedEnfermedades([]);
        }

        setIsModalOpen(true);
    };

    const handleDelete = async (codigo: string) => {
        if (confirm('¿Está seguro de eliminar esta consulta?')) {
            const res = await deleteConsulta(codigo);
            if (res.success) {
                setConsultasData(prev => prev.filter(c => c.consulta.codigoConsulta !== codigo));
                toast.success('Consulta eliminada correctamente');
            } else {
                toast.error(res.error || 'Error al eliminar');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            const res = await updateConsulta(editingId, formData, selectedEnfermedades);
            if (res.success) {
                toast.success('Consultas actualizadas');
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Error al actualizar');
            }
        } else {
            const res = await createConsulta(formData, selectedEnfermedades);
            if (res.success) {
                toast.success('Consulta creada');
                setIsModalOpen(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Error al crear');
            }
        }
    };

    const toggleEnfermedad = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedEnfermedades(prev => [...prev, id]);
        } else {
            setSelectedEnfermedades(prev => prev.filter(e => e !== id));
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'consulta.codigoConsulta',
            label: 'Código',
            render: (row) => row.consulta.codigoConsulta
        },
        {
            key: 'nombrePaciente',
            label: 'Paciente',
            render: (row) => row.nombrePaciente || row.consulta.cedulaPaciente
        },
        {
            key: 'nombreMedico',
            label: 'Médico',
            render: (row) => row.nombreMedico || row.consulta.cedulaMedico
        },
        {
            key: 'codigoAbordaje',
            label: 'Abordaje',
            render: (row) => row.codigoAbordaje || row.consulta.codigoAbordaje
        },
        {
            key: 'consulta.motivoConsulta',
            label: 'Motivo',
            render: (row) => <span className="truncate max-w-[200px] block">{row.consulta.motivoConsulta}</span>
        },
        {
            key: 'acciones',
            label: 'Acciones',
            render: (row) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.consulta.codigoConsulta)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleExport = (format: 'csv' | 'pdf') => {
        const exportData = consultasData.map(row => ({
            codigo: row.consulta.codigoConsulta,
            paciente: row.nombrePaciente || row.consulta.cedulaPaciente,
            medico: row.nombreMedico || row.consulta.cedulaMedico,
            abordaje: row.codigoAbordaje || row.consulta.codigoAbordaje,
            motivo: row.consulta.motivoConsulta,
            diagnostico: row.consulta.diagnosticoTexto,
            tratamiento: row.consulta.tratamiento,
            recomendaciones: row.consulta.recomendaciones,
        }));

        const headers = ['codigo', 'paciente', 'medico', 'abordaje', 'motivo', 'diagnostico', 'tratamiento', 'recomendaciones'];
        const columnsData = [
            { header: 'Código', dataKey: 'codigo' },
            { header: 'Paciente', dataKey: 'paciente' },
            { header: 'Médico', dataKey: 'medico' },
            { header: 'Abordaje', dataKey: 'abordaje' },
            { header: 'Motivo', dataKey: 'motivo' },
            { header: 'Diagnóstico', dataKey: 'diagnostico' },
            { header: 'Tratamiento', dataKey: 'tratamiento' },
            { header: 'Recomendaciones', dataKey: 'recomendaciones' },
        ];

        if (format === 'csv') {
            import('@/lib/export-utils').then(m => m.exportToCSV(exportData, headers, 'consultas'));
        } else {
            import('@/lib/export-utils').then(m => m.exportToPDF(exportData, columnsData, 'consultas', 'Reporte de Consultas Médicas'));
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl text-gray-900 mb-2">Consultas Médicas</h1>
                    <p className="text-gray-600">
                        Registro y gestión de consultas médicas asociadas a abordajes
                    </p>
                </div>

                <DataTable
                    data={consultasData}
                    columns={columns}
                    searchPlaceholder="Buscar consulta..."
                    onAdd={handleAdd}
                    addLabel="Nueva Consulta"
                    onExport={handleExport}
                />

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <Activity className="w-6 h-6 text-blue-600" />
                                {editingId ? 'Editar Consulta' : 'Nueva Consulta'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="codigo">Código Consulta</Label>
                                    <Input
                                        id="codigo"
                                        placeholder={editingId ? "" : "Automático (CON-XXX)"}
                                        value={formData.codigoConsulta}
                                        onChange={(e) => setFormData({ ...formData, codigoConsulta: e.target.value })}
                                        required={!!editingId}
                                        disabled={true}
                                        className="bg-gray-50 border-gray-200"
                                    />
                                    {!editingId && (
                                        <p className="text-[10px] text-blue-600 font-medium font-sans">
                                            El sistema generará el código automáticamente al guardar.
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Abordaje *</Label>
                                    <Select
                                        value={formData.codigoAbordaje}
                                        onValueChange={(val) => setFormData({ ...formData, codigoAbordaje: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Abordaje" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {abordajes.map((ab: any) => (
                                                <SelectItem key={ab.codigoAbordaje} value={ab.codigoAbordaje}>
                                                    {ab.codigoAbordaje} - {new Date(ab.fecha).toLocaleDateString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Paciente *</Label>
                                    <Select
                                        value={formData.cedulaPaciente}
                                        onValueChange={(val) => setFormData({ ...formData, cedulaPaciente: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Paciente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pacientes.map((p: any) => (
                                                <SelectItem key={p.cedulaPaciente} value={p.cedulaPaciente}>
                                                    {p.nombre} {p.apellido} ({p.cedulaPaciente})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Médico *</Label>
                                    <Select
                                        value={formData.cedulaMedico}
                                        onValueChange={(val) => setFormData({ ...formData, cedulaMedico: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Médico" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {medicos.map((m: any) => (
                                                <SelectItem key={m.cedulaTejedor} value={m.cedulaTejedor}>
                                                    {m.tejedor?.nombre1} {m.tejedor?.apellido1} ({m.especialidad?.nombreEspecialidad || 'General'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Right Column: Clinical Details */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="motivo">Motivo de Consulta *</Label>
                                    <Textarea
                                        id="motivo"
                                        value={formData.motivoConsulta}
                                        onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="diagnostico">Diagnóstico (Texto) *</Label>
                                    <Textarea
                                        id="diagnostico"
                                        value={formData.diagnosticoTexto}
                                        onChange={(e) => setFormData({ ...formData, diagnosticoTexto: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tratamiento">Tratamiento *</Label>
                                    <Textarea
                                        id="tratamiento"
                                        value={formData.tratamiento}
                                        onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recomendaciones">Recomendaciones *</Label>
                                    <Textarea
                                        id="recomendaciones"
                                        value={formData.recomendaciones}
                                        onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Full Width: Enfermedades Selection */}
                            <div className="md:col-span-2 space-y-2 border-t pt-4">
                                <Label className="text-lg font-semibold">Enfermedades Asociadas</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border p-4 rounded-md max-h-40 overflow-y-auto">
                                    {enfermedades.map((enf) => (
                                        <div key={enf.codigoEnfermedad} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`enf-${enf.codigoEnfermedad}`}
                                                checked={selectedEnfermedades.includes(enf.codigoEnfermedad)}
                                                onCheckedChange={(checked) => toggleEnfermedad(enf.codigoEnfermedad, checked as boolean)}
                                            />
                                            <Label htmlFor={`enf-${enf.codigoEnfermedad}`} className="text-sm cursor-pointer">
                                                {enf.nombreEnfermedad}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Guardar Consulta
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
