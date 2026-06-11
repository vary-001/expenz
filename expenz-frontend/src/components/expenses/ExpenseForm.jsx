// src/components/expenses/ExpenseForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const ExpenseForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const { t } = useTranslation();

  const categories = [
    { value: 'food', label: t('categories.food') },
    { value: 'transport', label: t('categories.transport') },
    { value: 'utilities', label: t('categories.utilities') },
    { value: 'entertainment', label: t('categories.entertainment') },
    { value: 'health', label: t('categories.health') },
    { value: 'education', label: t('categories.education') },
    { value: 'shopping', label: t('categories.shopping') },
    { value: 'rent', label: t('categories.rent') },
    { value: 'other', label: t('categories.other') },
  ];

  const [form, setForm] = useState({
    description: initial?.description || '',
    amount: initial?.amount || '',
    category: initial?.category || '',
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    notes: initial?.notes || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Invalid amount';
    if (!form.category) errs.category = 'Required';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('expenses.description')}
        name="description"
        value={form.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="What did you spend on?"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label={t('expenses.amount')}
          name="amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
        />
        <Select
          label={t('expenses.category')}
          name="category"
          value={form.category}
          onChange={handleChange}
          error={errors.category}
          options={categories}
        />
      </div>
      <Input
        label={t('expenses.date')}
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        icon={CalendarIcon}
      />
      <Input
        label={t('expenses.notes')}
        name="notes"
        value={form.notes}
        onChange={handleChange}
        placeholder="Optional notes..."
      />
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? t('common.save') : t('expenses.addExpense')}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;