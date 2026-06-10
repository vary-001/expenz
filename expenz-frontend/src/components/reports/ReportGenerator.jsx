// src/components/reports/ReportGenerator.jsx
import React, { useState } from 'react';
import Select from '../common/Select';
import Input from '../common/Input';
import Button from '../common/Button';
import DownloadIcon from '../../assets/svgs/DownloadIcon';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const reportTypes = [
  { value: 'expense-summary', label: 'Expense Summary' },
  { value: 'income-summary', label: 'Income Summary' },
  { value: 'budget-vs-actual', label: 'Budget vs Actual' },
  { value: 'journal', label: 'Transaction Journal' },
  { value: 'income-sources', label: 'Income Sources Breakdown' },
];

const ReportGenerator = ({ onGenerate, loading }) => {
  const [form, setForm] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.type) onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Report Type" name="type" value={form.type} onChange={handleChange} options={reportTypes} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="From" name="startDate" type="date" value={form.startDate}
               onChange={handleChange} icon={CalendarIcon} />
        <Input label="To" name="endDate" type="date" value={form.endDate}
               onChange={handleChange} icon={CalendarIcon} />
      </div>
      <Button type="submit" loading={loading} icon={DownloadIcon} fullWidth>
        Generate Report
      </Button>
    </form>
  );
};

export default ReportGenerator;