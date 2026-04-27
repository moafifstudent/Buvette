'use client';

import { Student } from '@/lib/data';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';
import { format } from 'date-fns';

interface ExportButtonProps {
  students: Student[];
}

export default function ExportButton({ students }: ExportButtonProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'yyyy-MM-dd');

    // Add Title
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('Buvette - Student Orders List', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Date: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 30);
    doc.text(`Total Orders: ${students.length}`, 14, 36);

    // Add Table
    const tableData = students.map(s => [
      s.name,
      s.order,
      format(new Date(s.date), 'HH:mm')
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Student Name', 'Order Detail', 'Time']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });

    // Save the PDF
    doc.save(`buvette_orders_${dateStr}.pdf`);
  };

  return (
    <button 
      onClick={exportToPDF} 
      className="btn-export"
      disabled={students.length === 0}
      title={students.length === 0 ? "Add students first" : "Export to PDF"}
    >
      <FileDown size={20} />
      Export PDF
    </button>
  );
}
