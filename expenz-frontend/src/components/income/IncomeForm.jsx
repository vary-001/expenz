// src/components/income/IncomeForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';

const IncomeForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const { t } = useTranslation();

  const categories = [
    { value: 'salary', label: t('categories.salary') },
    { value: 'freelance', label: t('categories.freelance') },
    { value: 'investment', label: t('categories.investment') },
    { value: 'business', label: t('categories.business') },
    { value: 'other', label: t('categories.other') },
  ];

  const [form, setForm] = useState({
    source: initial?.source || '',
    description: initial?.description || '',
    amount: initial?.amount || '',
    category: initial?.category || '',
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.source.trim()) errs.source = 'Required';
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
        label={t('income.source')}
        name="source"
        value={form.source}
        onChange={handleChange}
        error={errors.source}
        placeholder="e.g., Main Job, Freelance Client"
      />
      <Input
        label={t('expenses.description')}
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Optional details..."
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
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? t('common.save') : t('income.addIncome')}
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;