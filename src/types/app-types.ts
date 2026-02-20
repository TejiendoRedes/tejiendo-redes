import { Abordaje, Comunidad, Tejedor, Consulta, Medicamento, Paciente, Aspirante, Responsable, Enfermedad } from '@/db/schema';
import { Abordaje as LocalAbordajeModel } from './models'; // Keep if strictly needed or refactor separate types

// --- Abordajes Types ---

export interface AbordajeComunidadData {
    codigoComunidad: string;
    nombreComunidad: string;
    municipio: string;
    parroquia: string;
    estado: string;
    habitantes: number;
    observaciones: string | null;
}

export interface AbordajeTejedorData {
    cedulaTejedor: string;
    nombreTejedor: string;
    apellidoTejedor: string;
    profesionTejedor: string;
    rolAbordaje: string | null;
}

export interface AbordajeConsultaData {
    codigoConsulta: string;
    cedulaPaciente: string;
    nombrePaciente: string;
    cedulaMedico: string;
    nombreMedico: string;
    motivoConsulta: string;
    diagnosticoTexto: string | null;
    tensionArterial?: string | null; // Optional property inferred from usage in client
    fechaConsulta: string; // Added based on usage
}

export interface AbordajeMedicamentoData {
    codigoMedicamento: string;
    cedulaPaciente: string;
    nombrePaciente: string;
    cantidadEntregada: number;
    indicaciones: string | null;
    nombreMedicamento: string;
    cedulaTejedor?: string;
}

export interface AbordajeWithRelations {
    codigoAbordaje: string;
    codigoComunidad: string;
    codigoSolicitud?: string | null;
    fechaAbordaje: Date | string; // Drizzle returns Date, but sometimes string in transit
    horaInicio: string; // Time string
    horaFin: string; // Time string
    descripcion: string;
    tipoAbordaje?: string | null;
    participantesEstimados?: number | null;
    recursosAdicionales?: string | null;
    estado: string; // 'Planificado' | 'En Curso' | 'Finalizado' | string because enum in mysql might be just string in types
    notas?: string | null;
    transporte?: boolean;
    refrigerios?: boolean;
    espacioCubierto?: boolean;

    // Relations
    comunidades: AbordajeComunidadData[];
    tejedores: AbordajeTejedorData[];
    consultas: AbordajeConsultaData[];
    medicamentos_entregados: AbordajeMedicamentoData[];
    total_consultas: number;
    pacientes_unicos: number;
}

// --- Global Search Types ---

export type SearchResultType = 'paciente' | 'comunidad' | 'medicamento' | 'enfermedad' | 'abordaje' | 'tejedor' | 'responsable' | 'aspirante';

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: SearchResultType;
    url: string;
}

export interface GroupedSearchResults {
    pacientes: SearchResult[];
    comunidades: SearchResult[];
    medicamentos: SearchResult[];
    enfermedades: SearchResult[];
    abordajes: SearchResult[];
    tejedores: SearchResult[];
    responsables: SearchResult[];
    aspirantes: SearchResult[];
}

export type EntityHistoryItem = {
    fecha: string | Date; // Allow Date object
    descripcion?: string; // For general history
    motivo?: string; // For consultations
    cantidad?: number; // For meds
    codigo?: string; // For reference
    paciente?: string; // For meds
    apellido?: string; // For meds
}

export type EntityDetails =
    | { type: 'paciente'; data: Paciente; history: EntityHistoryItem[] }
    | { type: 'comunidad'; data: Comunidad; related?: Responsable | null; history: EntityHistoryItem[] }
    | { type: 'medicamento'; data: Medicamento; history: EntityHistoryItem[] }
    | { type: 'abordaje'; data: AbordajeWithRelations; related?: AbordajeWithRelations; history: never[] }
    | { type: 'tejedor'; data: Tejedor; history: EntityHistoryItem[] }
    | { type: 'responsable'; data: Responsable; related?: Comunidad[]; history: never[] }
    | { type: 'aspirante'; data: Aspirante; history: never[] }
    | { type: 'enfermedad'; data: Enfermedad; history: never[] }
    | { type: 'unknown'; data: never; history: never[] }; // Fallback

// --- Report Types ---
// Defined based on usage in ReportesClient

export interface ReporteAbordajeItem {
    codigo_abordaje: string;
    fecha_abordaje: Date | string; // Dates often come as strings from JSON API
    descripcion: string;
    comunidades: string;
    pacientes_atendidos: number;
    hora_inicio: string;
    hora_fin: string;
}

export interface ReporteComunidadItem {
    codigo_comunidad: string;
    nombre_comunidad: string;
    estado: string;
    municipio: string;
    parroquia: string;
    tipo_comunidad: string;
    telefono_comunidad: string;
    cantidad_habitantes: number;
    cantidad_familias: number;
    pacientes_tratados: number;
    abordajes_realizados: number;
    total_consultas: number;
}

export interface ReportePacienteItem {
    cedula_paciente: string;
    codigo_comunidad: string;
    nombre_comunidad: string | null;
    nombre_paciente: string;
    apellido_paciente: string;
    fecha_nacimiento: Date | string | null;
    direccion_paciente: string | null;
    telefono_paciente: string | null;
    correo_paciente: string | null;
    estado: string | null;
    municipio: string | null;
    parroquia: string | null;
}

export interface ReporteMorbilidadItem {
    codigo_enfermedad: string;
    nombre_enfermedad: string;
    tipo_patologia: string;
    total_casos: number;
    pacientes_afectados: number;
    porcentaje: string;
    ultima_consulta: Date | string | null;
}

export interface ReporteMedicamentoItem {
    codigo_medicamento: string;
    nombre_medicamento: string;
    presentacion: string;
    total_entregado: number;
}

export interface ReportesData {
    comunidades: Array<{ codigo_comunidad: string; nombre_comunidad: string }>;
    reporteAbordajes: ReporteAbordajeItem[];
    reporteComunidades: ReporteComunidadItem[];
    reportePacientes: ReportePacienteItem[];
    dataMorbilidad: ReporteMorbilidadItem[];
    reporteMedicamentos: ReporteMedicamentoItem[];
}
