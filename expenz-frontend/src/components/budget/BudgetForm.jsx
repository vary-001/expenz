// src/components/budget/BudgetForm.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const budgetCategories = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'education', label: 'Education' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'rent', label: 'Rent & Housing' },
  { value: 'savings', label: 'Savings' },
  { value: 'other', label: 'Other' },
];

const periodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const BudgetForm = ({ onSubmit, loading, initial = null, onCancel, incomeSources = [] }) => {
  const [form, setForm] = useState({
    category: initial?.category || '',
    amount: initial?.amount || '',
    period: initial?.period || 'monthly',
    incomeSource: initial?.incomeSource || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Select a category';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter valid amount';
    if (!form.period) errs.period = 'Select period';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  const incomeOptions = incomeSources.map((s) => ({ value: s, label: s }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Category" name="category" value={form.category}
              onChange={handleChange} error={errors.category} options={budgetCategories} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Budget Amount" name="amount" type="number" step="0.01" value={form.amount}
               onChange={handleChange} error={errors.amount} placeholder="0.00" />
        <Select label="Period" name="period" value={form.period}
                onChange={handleChange} error={errors.period} options={periodOptions} />
      </div>
      {incomeOptions.length > 0 && (
        <Select label="Fund from Income Source (optional)" name="incomeSource" value={form.incomeSource}
                onChange={handleChange} options={incomeOptions} />
      )}
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;