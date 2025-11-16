import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Export to PDF
export const exportToPDF = (data, title, columns) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Add table
  doc.autoTable({
    head: [columns],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }, // Indigo color
    styles: { fontSize: 9 },
  });
  
  // Save the PDF
  doc.save(`${title.replace(/ /g, '_')}_${Date.now()}.pdf`);
};

// Export to Excel
export const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, `${fileName}_${Date.now()}.xlsx`);
};

// Export multiple sheets to Excel
export const exportMultiSheetExcel = (sheets, fileName) => {
  const workbook = XLSX.utils.book_new();
  
  sheets.forEach(({ data, sheetName }) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, `${fileName}_${Date.now()}.xlsx`);
};
