/**
 * @module export-utils
 * @description Utilidades para exportar datos tabulares a formatos PDF y CSV.
 *
 * Este módulo proporciona funciones genéricas que aceptan datos de cualquier tipo
 * y una configuración de columnas para generar archivos descargables.
 *
 * - **PDF**: Usa `jsPDF` + `jspdf-autotable` para tablas con estilo profesional.
 * - **CSV**: Usa `xlsx` para generar archivos CSV compatibles con Excel.
 *
 * Ambas funciones son client-side (se ejecutan en el navegador) ya que
 * interactúan con `document` para disparar la descarga.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, write } from 'xlsx';

/**
 * Define una columna para la exportación de datos.
 * Cada columna puede extraer valores directamente de una key del objeto
 * o usar una función `render` personalizada para transformar el dato.
 *
 * @template T - Tipo del objeto de datos (ej. `Paciente`, `Tejedor`).
 */
export interface ExportColumn<T> {
    /** Texto del encabezado de la columna en el archivo exportado */
    header: string;
    /** Clave del objeto de datos para extraer el valor directamente */
    key?: keyof T;
    /** Alias para `key` — se puede usar cualquiera de las dos */
    dataKey?: keyof T;
    /** Función personalizada para transformar el dato antes de exportarlo */
    render?: (item: T) => string | number | null | undefined;
}

/**
 * Exporta un array de datos a un archivo CSV y dispara la descarga automática.
 *
 * Usa la librería `xlsx` internamente para generar el CSV, lo que garantiza
 * un manejo correcto de caracteres especiales y codificación UTF-8.
 *
 * @template T - Tipo del objeto de datos.
 * @param data - Array de objetos a exportar.
 * @param columns - Configuración de columnas (headers, keys y renders).
 * @param filename - Nombre del archivo sin extensión (se añade `.csv` automáticamente).
 *
 * @example
 * ```typescript
 * exportToCSV(pacientes, [
 *     { header: 'Cédula', key: 'cedulaPaciente' },
 *     { header: 'Nombre Completo', render: (p) => `${p.nombrePaciente} ${p.apellidoPaciente}` },
 * ], 'listado-pacientes');
 * ```
 */
export const exportToCSV = <T extends Record<string, any>>(data: T[], columns: ExportColumn<T>[], filename: string) => {
    // Transformar datos según columnas configuradas
    const exportData = data.map(item => {
        const row: Record<string, string | number | null | undefined> = {};
        columns.forEach(col => {
            const fieldKey = (col.key || col.dataKey) as keyof T;
            row[col.header] = col.render ? col.render(item) : item[fieldKey];
        });
        return row;
    });

    const worksheet = utils.json_to_sheet(exportData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Datos");
    write(workbook, { bookType: 'csv', type: 'buffer' });

    // Generar CSV como string y disparar descarga
    const csvOutput = utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Exporta un array de datos a un archivo PDF con tabla formateada y dispara la descarga.
 *
 * Genera un documento PDF con:
 * - Título opcional con fecha de generación.
 * - Tabla con encabezados azules (#4285F4) y filas alternas en gris claro.
 * - Font size reducido (8pt) para maximizar datos por página.
 *
 * @template T - Tipo del objeto de datos.
 * @param data - Array de objetos a exportar.
 * @param columns - Configuración de columnas (headers, keys y renders).
 * @param filename - Nombre del archivo sin extensión (se añade `.pdf` automáticamente).
 * @param title - Título opcional que aparece en la parte superior del PDF.
 *
 * @example
 * ```typescript
 * exportToPDF(abordajes, [
 *     { header: 'Código', key: 'codigoAbordaje' },
 *     { header: 'Fecha', render: (a) => format(a.fechaAbordaje, 'dd/MM/yyyy') },
 * ], 'reporte-abordajes', 'Listado de Abordajes Comunitarios');
 * ```
 */
export const exportToPDF = <T extends Record<string, any>>(data: T[], columns: ExportColumn<T>[], filename: string, title?: string) => {
    const doc = new jsPDF();

    if (title) {
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    }

    // Preparar datos del body usando renders personalizados
    const body = data.map(row =>
        columns.map(col => {
            const fieldKey = (col.key || col.dataKey) as keyof T;
            const val = col.render ? col.render(row) : row[fieldKey];
            return String(val ?? '');
        })
    );

    autoTable(doc, {
        startY: title ? 35 : 20,
        head: [columns.map(col => col.header)],
        body: body,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 133, 244], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 20 },
    });

    doc.save(`${filename}.pdf`);
};
