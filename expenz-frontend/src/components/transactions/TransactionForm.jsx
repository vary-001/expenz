// src/components/transactions/TransactionForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';
import DollarIcon from '../../assets/svgs/DollarIcon';
import CheckIcon from '../../assets/svgs/CheckIcon';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'expenz_transaction_form_draft';
const FORM_STEPS  = ['details', 'amount', 'date', 'review'];
const STEP_TITLES = {
  details : 'Transaction Details — Expenz',
  amount  : 'Amount & Category — Expenz',
  date    : 'Date — Expenz',
  review  : 'Review Transaction — Expenz',
};

const EXPENSE_CATEGORIES = [
  { value: 'food',          label: 'Food & Dining' },
  { value: 'transport',     label: 'Transportation' },
  { value: 'utilities',     label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health',        label: 'Health & Medical' },
  { value: 'education',     label: 'Education' },
  { value: 'shopping',      label: 'Shopping' },
  { value: 'rent',          label: 'Rent & Housing' },
  { value: 'other',         label: 'Other' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().split('T')[0];

const loadDraft = (editId) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (editId  &&  p._editId !== editId) return null;
    if (!editId && p._editId)             return null;
    return p;
  } catch { return null; }
};

const saveDraft  = (form, step, editId) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...form, _step: step, _editId: editId || null, _ts: Date.now() })
    );
  } catch { /* silent */ }
};

const clearDraft = () => {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
};

// ─── Shared UI ───────────────────────────────────────────────────────────────
const StepIndicator = ({ steps, current, onStepClick, completedSteps }) => (
  <div className="flex items-center justify-between mb-8 px-2">
    {steps.map((s, idx) => {
      const isActive    = idx === current;
      const isCompleted = completedSteps.includes(idx);
      const isClickable = isCompleted || idx <= Math.max(...completedSteps, 0);
      return (
        <React.Fragment key={s}>
          <button
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onStepClick(idx)}
            className="group flex flex-col items-center gap-1.5"
          >
            <motion.div
              layout
              className={`
                w-9 h-9 rounded-full flex items-center justify-center text-xs
                font-poppins font-bold transition-all duration-300 border-2
                ${isActive
                  ? 'border-forest-500 bg-forest-500 text-white shadow-lg shadow-forest-500/30 scale-110'
                  : isCompleted
                    ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300'
                    : 'border-sage-200 dark:border-surface-border-dark bg-white dark:bg-surface-dark text-sage-400'
                }
                ${isClickable && !isActive ? 'cursor-pointer' : ''}
                ${!isClickable ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              {isCompleted && !isActive ? <CheckIcon size={14} /> : idx + 1}
            </motion.div>
            <span className={`
              text-[10px] font-poppins font-medium capitalize hidden sm:block
              ${isActive ? 'text-forest-600 dark:text-forest-300' : 'text-sage-400 dark:text-sage-500'}
            `}>
              {s}
            </span>
          </button>
          {idx < steps.length - 1 && (
            <div className="flex-1 mx-2 h-0.5 rounded-full relative overflow-hidden bg-sage-100 dark:bg-surface-border-dark">
              <motion.div
                className="absolute inset-y-0 left-0 bg-forest-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const StepWrapper = ({ children, stepKey, direction }) => (
  <motion.div
    key={stepKey}
    initial={{ opacity: 0, x: direction > 0 ? 40 : -40, scale: 0.98 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    exit={{ opacity: 0, x: direction > 0 ? -40 : 40, scale: 0.98 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

const StepHeader = ({ Icon, title, hint }) => (
  <div className="mb-5">
    <h3 className="font-poppins font-bold text-lg text-forest-800 dark:text-forest-100 flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg bg-forest-50 dark:bg-forest-900/40 flex items-center justify-center text-forest-600 dark:text-forest-300">
        <Icon size={16} />
      </span>
      {title}
    </h3>
    {hint && <p className="body-text text-xs mt-1 ml-10">{hint}</p>}
  </div>
);

const ReviewRow = ({ label, value, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-5 py-3 hover:bg-sage-50 dark:hover:bg-forest-900/10 transition-colors cursor-pointer"
    title="Click to edit"
  >
    <span className="body-text text-sm">{label}</span>
    <span className="font-poppins font-semibold text-sm text-forest-700 dark:text-forest-200 text-right max-w-[55%] truncate">
      {value || '—'}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TransactionForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const editId = initial?._id || null;
  const draft  = loadDraft(editId);

  const [step, setStep] = useState(() =>
    draft && typeof draft._step === 'number' ? draft._step : 0
  );
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState(() => {
    if (draft) {
      const { _step, _editId, _ts, ...rest } = draft;
      return {
        description    : rest.description    || initial?.description    || '',
        amount         : rest.amount         || initial?.amount         || '',
        category       : rest.category       || initial?.category       || '',
        customCategory : rest.customCategory || '',
        date           : rest.date           || (initial?.date ? initial.date.split('T')[0] : todayISO()),
        notes          : rest.notes          || initial?.notes          || '',
      };
    }
    return {
      description    : initial?.description    || '',
      amount         : initial?.amount         || '',
      category       : initial?.category       || '',
      customCategory : initial?.category === 'other' ? initial?.customCategoryName || '' : '',
      date           : initial?.date ? initial.date.split('T')[0] : todayISO(),
      notes          : initial?.notes          || '',
    };
  });

  const [errors, setErrors]         = useState({});
  const [completedSteps, setCompletedSteps] = useState(() => {
    if (initial) return [0, 1, 2, 3];
    if (draft && typeof draft._step === 'number')
      return Array.from({ length: draft._step }, (_, i) => i);
    return [];
  });

  // Persist
  useEffect(() => { saveDraft(form, step, editId); }, [form, step, editId]);

  // Tab title
  useEffect(() => {
    document.title = STEP_TITLES[FORM_STEPS[step]] || 'Transaction — Expenz';
    return () => { document.title = 'Expenz - Smart Finance Manager'; };
  }, [step]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  }, [errors]);

  const validateStep = useCallback((s) => {
    const errs = {};
    if (s === 0 && !form.description.trim())
      errs.description = 'Description is required';
    if (s === 1) {
      if (!form.amount || parseFloat(form.amount) <= 0)
        errs.amount = 'Enter a valid amount';
      if (!form.category)
        errs.category = 'Select a category';
      if (form.category === 'other' && !form.customCategory.trim())
        errs.customCategory = 'Enter custom category name';
    }
    if (s === 2 && !form.date)
      errs.date = 'Select a date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const goTo = useCallback((target) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step]);

  const next = useCallback(() => {
    if (!validateStep(step)) return;
    setCompletedSteps((p) => p.includes(step) ? p : [...p, step]);
    if (step < FORM_STEPS.length - 1) { setDirection(1); setStep((s) => s + 1); }
  }, [step, validateStep]);

  const prev = useCallback(() => {
    if (step > 0) { setDirection(-1); setStep((s) => s - 1); }
  }, [step]);

  const handleStepClick = useCallback((target) => {
    if (target > step) {
      if (!validateStep(step)) return;
      setCompletedSteps((p) => p.includes(step) ? p : [...p, step]);
    }
    goTo(target);
  }, [step, validateStep, goTo]);

  const handleSubmit = useCallback(() => {
    for (let s = 0; s < FORM_STEPS.length - 1; s++) {
      if (!validateStep(s)) { goTo(s); return; }
    }
    const payload = {
      description : form.description.trim(),
      amount      : parseFloat(form.amount),
      category    : form.category,
      date        : form.date,
      notes       : form.notes.trim(),
      type        : 'expense',
    };
    if (form.category === 'other' && form.customCategory.trim())
      payload.customCategoryName = form.customCategory.trim();
    clearDraft();
    onSubmit(payload);
  }, [form, validateStep, goTo, onSubmit]);

  const handleCancel = useCallback(() => { clearDraft(); if (onCancel) onCancel(); }, [onCancel]);

  const displayCategory = useMemo(() => {
    if (form.category === 'other' && form.customCategory.trim()) return form.customCategory.trim();
    return EXPENSE_CATEGORIES.find((c) => c.value === form.category)?.label || '—';
  }, [form.category, form.customCategory]);

  const isLastStep = step === FORM_STEPS.length - 1;

  // Quick dates
  const quickDates = useMemo(() => {
    const d1 = new Date(); d1.setDate(d1.getDate() - 1);
    const d7 = new Date(); d7.setDate(d7.getDate() - 7);
    const d0 = new Date(); d0.setDate(1);
    return [
      { label: 'Today',       value: todayISO() },
      { label: 'Yesterday',   value: d1.toISOString().split('T')[0] },
      { label: 'Last week',   value: d7.toISOString().split('T')[0] },
      { label: '1st of month',value: d0.toISOString().split('T')[0] },
    ];
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto">
      <StepIndicator
        steps={FORM_STEPS}
        current={step}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      <form
        onSubmit={(e) => { e.preventDefault(); isLastStep ? handleSubmit() : next(); }}
        className="relative"
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* Step 0 — Description & Notes */}
          {step === 0 && (
            <StepWrapper stepKey="details" direction={direction}>
              <div className="space-y-5">
                <StepHeader Icon={DollarIcon} title="Transaction Details" hint="What was this expense for?" />
                <Input
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="e.g., Grocery run, Uber ride, Netflix…"
                  autoFocus
                />
                <Input
                  label="Notes (optional)"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional notes…"
                />
              </div>
            </StepWrapper>
          )}

          {/* Step 1 — Amount & Category */}
          {step === 1 && (
            <StepWrapper stepKey="amount" direction={direction}>
              <div className="space-y-5">
                <StepHeader Icon={DollarIcon} title="Amount & Category" hint="How much and what type of expense?" />
                <Input
                  label="Amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                  error={errors.amount}
                  placeholder="0.00"
                  autoFocus
                />
                <Select
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={errors.category}
                  options={EXPENSE_CATEGORIES}
                />

                {/* "Other" custom category */}
                <AnimatePresence>
                  {form.category === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border-2 border-dashed border-forest-300 dark:border-forest-700 bg-forest-50/50 dark:bg-forest-900/20">
                        <Input
                          label="Custom Category Name"
                          name="customCategory"
                          value={form.customCategory}
                          onChange={handleChange}
                          error={errors.customCategory}
                          placeholder="e.g., Pet Care, Gifts, Subscriptions…"
                          autoFocus
                        />
                        <p className="text-[11px] text-sage-400 dark:text-sage-500 mt-1.5 ml-1">
                          Enter your own category name for this transaction.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StepWrapper>
          )}

          {/* Step 2 — Date */}
          {step === 2 && (
            <StepWrapper stepKey="date" direction={direction}>
              <div className="space-y-5">
                <StepHeader Icon={CalendarIcon} title="Transaction Date" hint="When did this expense occur?" />
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  error={errors.date}
                  icon={CalendarIcon}
                />
                {/* Quick date buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickDates.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setForm((p) => ({ ...p, date: q.value }));
                        if (errors.date) setErrors((p) => ({ ...p, date: '' }));
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-poppins font-medium transition-all border
                        ${form.date === q.value
                          ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-200'
                          : 'border-sage-200 dark:border-surface-border-dark text-sage-500 dark:text-sage-400 hover:border-forest-300 hover:text-forest-600'
                        }
                      `}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </StepWrapper>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <StepWrapper stepKey="review" direction={direction}>
              <div className="space-y-5">
                <StepHeader Icon={CheckIcon} title="Review & Confirm" hint="Double-check before saving." />
                <div className="rounded-xl border-2 border-sage-100 dark:border-surface-border-dark bg-white dark:bg-surface-dark overflow-hidden">
                  <div className="bg-gradient-to-r from-crimson-500 to-crimson-600 px-5 py-4 text-center">
                    <p className="text-crimson-100 text-xs font-medium mb-1">Total Amount</p>
                    <p className="text-white font-poppins font-bold text-3xl">
                      {form.amount
                        ? parseFloat(form.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '0.00'}
                    </p>
                  </div>
                  <div className="divide-y divide-sage-100 dark:divide-surface-border-dark">
                    <ReviewRow label="Description" value={form.description}  onClick={() => goTo(0)} />
                    <ReviewRow label="Notes"       value={form.notes || '—'} onClick={() => goTo(0)} />
                    <ReviewRow label="Category"   value={displayCategory}    onClick={() => goTo(1)} />
                    <ReviewRow
                      label="Date"
                      value={form.date
                        ? new Date(form.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })
                        : '—'}
                      onClick={() => goTo(2)}
                    />
                  </div>
                </div>
                <p className="text-center text-[11px] text-sage-400 dark:text-sage-500">
                  Click any row above to edit it.
                </p>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-8 pt-4 border-t border-sage-100 dark:border-surface-border-dark">
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
            )}
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={prev}>Back</Button>
            )}
          </div>
          <div className="flex-1" />
          {isLastStep ? (
            <Button type="submit" loading={loading} className="min-w-[140px]">
              {initial ? 'Update Expense' : 'Add Expense'}
            </Button>
          ) : (
            <Button type="submit" className="min-w-[120px]">Next</Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;