// src/pages/Reports.jsx
import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import Card from '../components/common/Card';
import ReportGenerator from '../components/reports/ReportGenerator';
import ReportPreview from '../components/reports/ReportPreview';
import ReportIcon from '../assets/svgs/ReportIcon';

const Reports = () => {
  const [report, setReport] = useState(null);
  const { request, loading } = useApi();

  const handleGenerate = async (params) => {
    try {
      const res = await request('post', '/reports/generate', params, 'Report generated');
      setReport(res.report || res);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-forest-50">
            <ReportIcon size={24} className="text-forest-600" />
          </div>
          <div>
            <h3 className="text-base font-roboto font-bold text-forest-800">Generate Reports</h3>
            <p className="text-sm font-roboto text-sage-500">
              Create detailed reports for your expenses, income, budgets, and transaction journals. Download as PDF.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <Card delay={0.1} className="lg:col-span-1">
          <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Report Settings</h3>
          <ReportGenerator onGenerate={handleGenerate} loading={loading} />
        </Card>

        {/* Preview */}
        <div className="lg:col-span-2">
          {report ? (
            <ReportPreview report={report} />
          ) : (
            <Card delay={0.2}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ReportIcon size={48} className="text-sage-300 mb-4" />
                <p className="text-sm font-roboto text-sage-400">
                  Select a report type and click generate to preview your report here.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;