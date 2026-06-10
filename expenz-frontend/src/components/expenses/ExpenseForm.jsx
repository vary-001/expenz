// src/components/expenses/ExpenseForm.jsx
import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const categories = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'transport', label: 'Transportation' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health & Medical' },
  { value: 'education', label: 'Education' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'rent', label: 'Rent & Housing' },
  { value: 'other', label: 'Other' },
];

const ExpenseForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const [form, setForm] = useState({
    description: initial?.description || '',
    amount: initial?.amount || '',
    category: initial?.category || '',
    date: initial?.date
      ? new Date(initial.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.category) errs.category = 'Select a category';
    if (!form.date) errs.date = 'Select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...form,
        amount: parseFloat(form.amount),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="What did you spend on?"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
        />
        <Select
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          error={errors.category}
          options={categories}
        />
      </div>
      <Input
        label="Date"
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        error={errors.date}
        icon={CalendarIcon}
      />
      <Input
        label="Notes (optional)"
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Additional notes..."
      />
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;