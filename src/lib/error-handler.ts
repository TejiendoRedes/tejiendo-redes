/**
 * Utilidades para manejo de errores con mensajes en español
 * Detecta tipos de errores de base de datos y genera mensajes claros para el usuario
 */

/**
 * Códigos de error de MySQL que pueden ocurrir
 */
export const MySQLErrorCodes = {
    FOREIGN_KEY_CONSTRAINT: 'ER_ROW_IS_REFERENCED_2',
    DUPLICATE_ENTRY: 'ER_DUP_ENTRY',
    NO_DEFAULT_FOR_FIELD: 'ER_NO_DEFAULT_FOR_FIELD',
    BAD_NULL_ERROR: 'ER_BAD_NULL_ERROR',
    DATA_TOO_LONG: 'ER_DATA_TOO_LONG',
    NO_REFERENCED_ROW: 'ER_NO_REFERENCED_ROW_2',
    PARSE_ERROR: 'ER_PARSE_ERROR',
    CONNECTION_ERROR: 'ECONNREFUSED',
    TIMEOUT: 'ETIMEDOUT',
} as const;

/**
 * Detecta si el error es una restricción de clave foránea
 */
export function isForeignKeyError(error: any): boolean {
    return (
        error?.code === MySQLErrorCodes.FOREIGN_KEY_CONSTRAINT ||
        error?.errno === 1451 ||
        error?.message?.includes('foreign key constraint') ||
        error?.message?.includes('Cannot delete or update a parent row')
    );
}

/**
 * Detecta si el error es por clave duplicada
 */
export function isDuplicateKeyError(error: any): boolean {
    return (
        error?.code === MySQLErrorCodes.DUPLICATE_ENTRY ||
        error?.errno === 1062 ||
        error?.message?.includes('Duplicate entry')
    );
}

/**
 * Detecta si el error es por campo requerido sin valor
 */
export function isRequiredFieldError(error: any): boolean {
    return (
        error?.code === MySQLErrorCodes.NO_DEFAULT_FOR_FIELD ||
        error?.code === MySQLErrorCodes.BAD_NULL_ERROR ||
        error?.errno === 1364 ||
        error?.errno === 1048 ||
        error?.message?.includes('doesn\'t have a default value') ||
        error?.message?.includes('cannot be null')
    );
}

/**
 * Detecta si el error es de conexión a base de datos
 */
export function isConnectionError(error: any): boolean {
    return (
        error?.code === MySQLErrorCodes.CONNECTION_ERROR ||
        error?.code === MySQLErrorCodes.TIMEOUT ||
        error?.message?.includes('Connection') ||
        error?.message?.includes('ETIMEDOUT') ||
        error?.message?.includes('ECONNREFUSED')
    );
}

/**
 * Detecta si el error es por referencia inválida (FK que no existe)
 */
export function isInvalidReferenceError(error: any): boolean {
    return (
        error?.code === MySQLErrorCodes.NO_REFERENCED_ROW ||
        error?.errno === 1452 ||
        error?.message?.includes('Cannot add or update a child row')
    );
}

/**
 * Extrae el nombre del campo desde el mensaje de error de MySQL
 */
function extractFieldName(errorMessage: string): string | null {
    // Para errores tipo "Field 'campo_nombre' doesn't have a default value"
    const fieldMatch = errorMessage.match(/Field '([^']+)'/);
    if (fieldMatch) {
        return fieldMatch[1];
    }

    // Para errores tipo "Column 'campo_nombre' cannot be null"
    const columnMatch = errorMessage.match(/Column '([^']+)'/);
    if (columnMatch) {
        return columnMatch[1];
    }

    return null;
}

/**
 * Traduce nombres de campos técnicos a nombres legibles en español
 */
function translateFieldName(fieldName: string): string {
    const translations: Record<string, string> = {
        // Aspirantes
        cedula_aspirante: 'la cédula',
        nombre_aspirante: 'el nombre',
        apellido_aspirante: 'el apellido',
        fecha_nacimiento: 'la fecha de nacimiento',
        direccion_aspirante: 'la dirección',
        municipio_aspirante: 'el municipio',
        estado_direccion_aspirante: 'el estado',
        parroquia_aspirante: 'la parroquia',
        telefono_aspirante: 'el teléfono',
        correo_aspirante: 'el correo electrónico',
        profesion_aspirante: 'la profesión',
        fecha_postulacion: 'la fecha de postulación',

        // Tejedores
        cedula_tejedor: 'la cédula',
        nombre_tejedor: 'el nombre',
        apellido_tejedor: 'el apellido',
        direccion_tejedor: 'la dirección',
        telefono_tejedor: 'el teléfono',
        correo_tejedor: 'el correo electrónico',
        profesion_tejedor: 'la profesión',
        fecha_ingreso: 'la fecha de ingreso',

        // Pacientes
        cedula_paciente: 'la cédula',
        nombre_paciente: 'el nombre',
        apellido_paciente: 'el apellido',
        sexo: 'el sexo',
        direccion_paciente: 'la dirección',
        telefono_paciente: 'el teléfono',
        correo_paciente: 'el correo electrónico',

        // Comunidades
        codigo_comunidad: 'el código de comunidad',
        nombre_comunidad: 'el nombre',
        direccion_comunidad: 'la dirección',
        cedula_responsable: 'el responsable',

        // Abordajes
        codigo_abordaje: 'el código de abordaje',
        nombre_abordaje: 'el nombre',
        fecha_abordaje: 'la fecha',
        tipo_abordaje: 'el tipo',

        // Peticiones/Medicamentos
        codigo_medicamento: 'el medicamento',
        codigo_paciente: 'el paciente',
        cantidad: 'la cantidad',

        // Consultas
        codigo_consulta: 'el código de consulta',
        cedula_medico: 'el médico',
        motivo_consulta: 'el motivo',
        diagnostico_texto: 'el diagnóstico',
    };

    return translations[fieldName] || `el campo "${fieldName}"`;
}

/**
 * Genera mensaje de error en español basado en el tipo de error
 * 
 * @param error - El objeto de error capturado
 * @param entityName - Nombre de la entidad en español (ej: "comunidad", "paciente", "tejedor")
 * @param operation - Operación que se intentaba realizar ("crear", "actualizar", "eliminar")
 * @param customMessages - Mensajes personalizados para casos específicos
 * @returns Mensaje de error legible en español
 */
export function getErrorMessage(
    error: any,
    entityName: string,
    operation: 'crear' | 'actualizar' | 'eliminar' | 'obtener' | 'confirmar' | 'rechazar',
    customMessages?: {
        foreignKey?: string;
        duplicate?: string;
        requiredField?: string;
    }
): string {
    // Log del error para debugging
    console.error(`Error al ${operation} ${entityName}:`, error);

    // Error de conexión a base de datos
    if (isConnectionError(error)) {
        return 'No se puede conectar a la base de datos. Por favor, intenta nuevamente en unos momentos.';
    }

    // Error de clave foránea (referencias en otras tablas)
    if (isForeignKeyError(error)) {
        if (customMessages?.foreignKey) {
            return customMessages.foreignKey;
        }
        if (operation === 'eliminar') {
            return `No se puede eliminar ${entityName === 'el' || entityName === 'la' ? '' : 'el/la '}${entityName} porque tiene registros relacionados en otras tablas que dependen de este.`;
        }
        return `No se puede ${operation} ${entityName === 'el' || entityName === 'la' ? '' : 'el/la '}${entityName} porque afectaría a otros registros relacionados.`;
    }

    // Error de clave duplicada
    if (isDuplicateKeyError(error)) {
        if (customMessages?.duplicate) {
            return customMessages.duplicate;
        }

        // Extraer el valor duplicado si es posible
        const duplicateMatch = error?.message?.match(/Duplicate entry '([^']+)'/);
        const duplicateValue = duplicateMatch ? duplicateMatch[1] : '';

        if (duplicateValue) {
            return `Ya existe un registro con el valor "${duplicateValue}". Por favor, usa un valor diferente.`;
        }

        return `Ya existe un registro con estos datos. Por favor, verifica que no estés duplicando información.`;
    }

    // Error de campo requerido
    if (isRequiredFieldError(error)) {
        const fieldName = extractFieldName(error?.message || '');
        const translatedField = fieldName ? translateFieldName(fieldName) : 'un campo requerido';

        if (customMessages?.requiredField) {
            return customMessages.requiredField;
        }

        return `Falta completar ${translatedField}. Este campo es obligatorio.`;
    }

    // Error de referencia inválida (intentar usar FK que no existe)
    if (isInvalidReferenceError(error)) {
        return `El registro al que intentas hacer referencia no existe. Por favor, verifica los datos seleccionados.`;
    }

    // Error genérico
    return `Error al ${operation} ${entityName === 'el' || entityName === 'la' ? '' : 'el/la '}${entityName}. Por favor, intenta nuevamente.`;
}

/**
 * Mensajes específicos para operaciones de eliminación con dependencias
 */
export const DeleteErrorMessages = {
    comunidad: {
        conPacientes: (count: number) =>
            `No se puede eliminar esta comunidad porque tiene ${count} paciente${count === 1 ? '' : 's'} registrado${count === 1 ? '' : 's'}. Primero debes reasignar o eliminar los pacientes de esta comunidad.`,
        conAbordajes: () =>
            'No se puede eliminar esta comunidad porque está asociada a uno o más abordajes. Primero debes eliminar los abordajes que incluyen esta comunidad.',
        generic: () =>
            'No se puede eliminar esta comunidad porque tiene datos relacionados (pacientes o abordajes). Primero debes gestionar estos registros.',
    },

    tejedor: {
        conAbordajes: () =>
            'No se puede eliminar este tejedor porque está asignado a uno o más abordajes. Primero debes remover al tejedor de todos los abordajes en los que participa.',
        conEntregas: () =>
            'No se puede eliminar este tejedor porque ha realizado entregas de medicamentos que están registradas en el sistema. No es posible eliminar tejedores con entregas.',
        conMedico: () =>
            'No se puede eliminar este tejedor porque está registrado como médico en el sistema. Primero debes eliminar o modificar su registro de médico.',
        generic: () =>
            'No se puede eliminar este tejedor porque tiene registros asociados (abordajes, entregas de medicamentos, o consultas médicas).',
    },

    paciente: {
        conConsultas: () =>
            'No se puede eliminar este paciente porque tiene consultas médicas registradas en el sistema. Primero debes eliminar las consultas asociadas a este paciente.',
        conPeticiones: () =>
            'No se puede eliminar este paciente porque tiene peticiones de medicamentos registradas. Primero debes gestionar o eliminar las peticiones.',
        conEntregas: () =>
            'No se puede eliminar este paciente porque tiene entregas de medicamentos en su historial. No es posible eliminar pacientes con entregas registradas.',
        conAntecedentes: () =>
            'No se puede eliminar este paciente porque tiene antecedentes médicos registrados. Primero debes eliminar los antecedentes.',
        generic: () =>
            'No se puede eliminar este paciente porque tiene datos relacionados (consultas, peticiones, entregas de medicamentos, o antecedentes médicos).',
    },

    abordaje: {
        conConsultas: () =>
            'No se puede eliminar este abordaje porque tiene consultas médicas registradas. Primero debes eliminar las consultas realizadas en este abordaje.',
        conComunidades: () =>
            'No se puede eliminar este abordaje porque está asociado a comunidades. Primero debes remover las asociaciones con comunidades.',
        conTejedores: () =>
            'No se puede eliminar este abordaje porque tiene tejedores asignados. Primero debes remover los tejedores de este abordaje.',
        generic: () =>
            'No se puede eliminar este abordaje porque tiene datos relacionados (consultas, comunidades asociadas, o tejedores asignados).',
    },

    medicamento: {
        conPeticiones: () =>
            'No se puede eliminar este medicamento porque tiene peticiones registradas en el sistema. Primero debes gestionar o eliminar las peticiones que solicitan este medicamento.',
        conEntregas: () =>
            'No se puede eliminar este medicamento porque ha sido entregado a pacientes y está registrado en el historial. No es posible eliminar medicamentos con entregas.',
        generic: () =>
            'No se puede eliminar este medicamento porque tiene registros asociados (peticiones o entregas a pacientes).',
    },

    responsable: {
        conComunidades: () =>
            'No se puede eliminar este responsable porque está asignado a una o más comunidades. Primero debes reasignar las comunidades a otro responsable.',
    },

    enfermedad: {
        conConsultas: () =>
            'No se puede eliminar esta enfermedad porque está registrada en consultas médicas del sistema. Primero debes gestionar las consultas que la referencian.',
    },

    // Nuevos mensajes para otras entidades
    especialidad: {
        conMedicos: () =>
            'No se puede eliminar esta especialidad porque hay médicos registrados con ella. Primero debes reasignar o eliminar los médicos con esta especialidad.',
    },

    organismo: {
        conMedicos: () =>
            'No se puede eliminar este organismo porque hay médicos asociados a él. Primero debes reasignar o eliminar los médicos de este organismo.',
    },
};
