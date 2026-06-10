// src/components/reports/ReportPreview.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import DownloadIcon from '../../assets/svgs/DownloadIcon';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportPreview = ({ report }) => {
  if (!report) return null;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Expenz Report', 14, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${report.type}`, 14, 32);
    doc.text(`Period: ${report.startDate || 'All'} - ${report.endDate || 'All'}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);

    if (report.items?.length) {
      const headers = Object.keys(report.items[0]).map((k) => k.charAt(0).toUpperCase() + k.slice(1));
      const rows = report.items.map((item) => Object.values(item));

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 56,
        styles: { fontSize: 9, font: 'helvetica' },
        headStyles: { fillColor: [45, 106, 80] },
      });
    }

    if (report.summary) {
      const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 56;
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, y);
      doc.setFont('helvetica', 'normal');
      Object.entries(report.summary).forEach(([key, val], i) => {
        doc.text(`${key}: ${typeof val === 'number' ? formatCurrency(val) : val}`, 14, y + 10 + i * 8);
      });
    }

    doc.save(`expenz-report-${report.type}-${Date.now()}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-forest"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-roboto font-bold text-gradient-forest capitalize">
          {report.type?.replace(/-/g, ' ')} Report
        </h3>
        <Button variant="secondary" size="sm" icon={DownloadIcon} onClick={downloadPDF}>
          Download PDF
        </Button>
      </div>

      {report.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {Object.entries(report.summary).map(([key, val]) => (
            <div key={key} className="p-3 rounded-xl bg-forest-50">
              <p className="text-xs font-roboto text-sage-500 capitalize">{key}</p>
              <p className="text-sm font-roboto font-bold text-forest-800">
                {typeof val === 'number' ? formatCurrency(val) : val}
              </p>
            </div>
          ))}
        </div>
      )}

      {report.items?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-roboto">
            <thead>
              <tr className="border-b border-sage-100">
                {Object.keys(report.items[0]).map((key) => (
                  <th key={key} className="text-left py-2 px-3 text-xs font-medium text-sage-500 capitalize">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.items.map((item, i) => (
                <tr key={i} className="border-b border-sage-50 hover:bg-forest-50/30 transition-colors">
                  {Object.values(item).map((val, j) => (
                    <td key={j} className="py-2.5 px-3 text-forest-800">
                      {typeof val === 'number' ? formatCurrency(val) : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ReportPreview;