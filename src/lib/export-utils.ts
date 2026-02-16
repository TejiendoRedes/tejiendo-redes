import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility for exporting data to CSV and PDF
 */
export const exportToCSV = (data: any[], headers: string[], filename: string) => {
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const val = row[header] ?? '';
                // Escape quotes and wrap in quotes if contains comma
                const cell = String(val).replace(/"/g, '""');
                return cell.includes(',') ? `"${cell}"` : cell;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

export const exportToPDF = (data: any[], columns: { header: string, dataKey: string }[], filename: string, title?: string) => {
    const doc = new jsPDF();

    if (title) {
        doc.setFontSize(18);
        doc.text(title, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    }

    autoTable(doc, {
        startY: title ? 35 : 20,
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => row[col.dataKey] ?? '')),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 133, 244], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 20 },
    });

    doc.save(`${filename}.pdf`);
};
