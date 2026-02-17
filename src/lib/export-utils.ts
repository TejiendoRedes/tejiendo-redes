import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { utils, write } from 'xlsx';

export interface ExportColumn<T> {
    header: string;
    key?: keyof T;
    dataKey?: keyof T; // Alias for key
    render?: (item: T) => string | number | null | undefined;
}

/**
 * Utility for exporting data to CSV
 */
export const exportToCSV = <T extends Record<string, any>>(data: T[], columns: ExportColumn<T>[], filename: string) => {
    // Flatten data based on columns and render functions
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

    // Generate CSV buffer and download
    // Using xlsx write directly doesn't trigger download in browser easily without helpers.
    // Easier to just use utils.sheet_to_csv and Blob.
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
 * Utility for exporting data to PDF
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

    // Prepare body data using render functions if available
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
