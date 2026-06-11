// src/components/budget/BudgetForm.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const BudgetForm = ({ onSubmit, loading, initial = null, incomeSources = [], onCancel }) => {
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
    category: initial?.category || '',
    amount: initial?.amount || '',
    incomeSource: initial?.incomeSource || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Invalid amount';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label={t('expenses.category')}
        name="category"
        value={form.category}
        onChange={handleChange}
        error={errors.category}
        options={categories}
        disabled={!!initial}
      />
      <Input
        label={`${t('budget.budgeted')} (Monthly)`}
        name="amount"
        type="number"
        step="0.01"
        value={form.amount}
        onChange={handleChange}
        error={errors.amount}
        placeholder="0.00"
      />
      {incomeSources.length > 0 && (
        <Select
          label="Fund from income source (optional)"
          name="incomeSource"
          value={form.incomeSource}
          onChange={handleChange}
          options={incomeSources.map(s => ({ value: s, label: s }))}
        />
      )}
      <div className="flex gap-3 pt-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>{t('common.cancel')}</Button>}
        <Button type="submit" loading={loading} fullWidth={!onCancel}>
          {initial ? t('common.save') : t('budget.createBudget')}
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;