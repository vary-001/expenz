// src/components/income/IncomeForm.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const incomeCategories = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment Returns' },
  { value: 'business', label: 'Business Income' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'dividends', label: 'Dividends' },
  { value: 'gifts', label: 'Gifts & Grants' },
  { value: 'other', label: 'Other' },
];

const recurrenceOptions = [
  { value: 'one-time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const IncomeForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const [form, setForm] = useState({
    source: initial?.source || '',
    description: initial?.description || '',
    amount: initial?.amount || '',
    category: initial?.category || '',
    date: initial?.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
    recurrence: initial?.recurrence || 'one-time',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.source.trim()) errs.source = 'Source name is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter valid amount';
    if (!form.category) errs.category = 'Select a category';
    if (!form.date) errs.date = 'Select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, amount: parseFloat(form.amount), type: 'income' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Income Source" name="source" value={form.source}
             onChange={handleChange} error={errors.source} placeholder="e.g., Main Job, Freelance Client" />
      <Input label="Description" name="description" value={form.description}
             onChange={handleChange} placeholder="Additional details..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Amount" name="amount" type="number" step="0.01" value={form.amount}
               onChange={handleChange} error={errors.amount} placeholder="0.00" />
        <Select label="Category" name="category" value={form.category}
                onChange={handleChange} error={errors.category} options={incomeCategories} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Date" name="date" type="date" value={form.date}
               onChange={handleChange} error={errors.date} icon={CalendarIcon} />
        <Select label="Recurrence" name="recurrence" value={form.recurrence}
                onChange={handleChange} options={recurrenceOptions} />
      </div>
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? 'Update Income' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;