// src/components/income/IncomeForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import CalendarIcon from '../../assets/svgs/CalendarIcon';
import DollarIcon from '../../assets/svgs/DollarIcon';
import CheckIcon from '../../assets/svgs/CheckIcon';

// ─── Constants ──────────────────────────────────────────────
const STORAGE_KEY = 'expenz_income_form_draft';
const FORM_STEPS = ['source', 'details', 'schedule', 'review'];

const STEP_TITLES = {
  source: 'Income Source — Expenz',
  details: 'Amount & Category — Expenz',
  schedule: 'Date — Expenz',
  review: 'Review & Submit — Expenz',
};

// ─── Helpers ────────────────────────────────────────────────
const loadDraft = (editId) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only restore if the draft matches the current edit context
    if (editId && parsed._editId !== editId) return null;
    if (!editId && parsed._editId) return null;
    return parsed;
  } catch {
    return null;
  }
};

const saveDraft = (form, step, editId) => {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...form, _step: step, _editId: editId || null, _ts: Date.now() })
    );
  } catch {
    /* silently fail */
  }
};

const clearDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* silently fail */
  }
};

const todayISO = () => new Date().toISOString().split('T')[0];

// ─── Step Indicator ─────────────────────────────────────────
const StepIndicator = ({ steps, current, onStepClick, completedSteps }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {steps.map((s, idx) => {
        const isActive = idx === current;
        const isCompleted = completedSteps.includes(idx);
        const isClickable = isCompleted || idx <= Math.max(...completedSteps, 0);

        return (
          <React.Fragment key={s}>
            {/* Circle */}
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(idx)}
              className="group flex flex-col items-center gap-1.5 relative"
            >
              <motion.div
                layout
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-xs font-poppins font-bold
                  transition-all duration-300 border-2
                  ${isActive
                    ? 'border-forest-500 bg-forest-500 text-white shadow-lg shadow-forest-500/30 scale-110'
                    : isCompleted
                      ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/40 text-forest-600 dark:text-forest-300'
                      : 'border-sage-200 dark:border-surface-border-dark bg-white dark:bg-surface-dark text-sage-400'
                  }
                  ${isClickable && !isActive ? 'cursor-pointer group-hover:border-forest-400' : ''}
                  ${!isClickable ? 'cursor-not-allowed opacity-50' : ''}
                `}
              >
                {isCompleted && !isActive ? (
                  <CheckIcon size={14} />
                ) : (
                  idx + 1
                )}
              </motion.div>
              <span
                className={`
                  text-[10px] font-poppins font-medium capitalize hidden sm:block
                  ${isActive
                    ? 'text-forest-600 dark:text-forest-300'
                    : 'text-sage-400 dark:text-sage-500'
                  }
                `}
              >
                {s}
              </span>
            </button>

            {/* Connector line */}
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
};

// ─── Step Wrapper (shared animation) ────────────────────────
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

// ─── Main Component ─────────────────────────────────────────
const IncomeForm = ({ onSubmit, loading, initial = null, onCancel }) => {
  const { t } = useTranslation();
  const editId = initial?._id || null;

  // Categories
  const categories = useMemo(
    () => [
      { value: 'salary', label: t('categories.salary') },
      { value: 'freelance', label: t('categories.freelance') },
      { value: 'investment', label: t('categories.investment') },
      { value: 'business', label: t('categories.business') },
      { value: 'other', label: t('categories.other') },
    ],
    [t]
  );

  // Restore draft or use initial/defaults
  const draft = loadDraft(editId);

  const [step, setStep] = useState(() => {
    if (draft && typeof draft._step === 'number') return draft._step;
    return 0;
  });

  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState(() => {
    if (draft) {
      const { _step, _editId, _ts, ...rest } = draft;
      return {
        source: rest.source || initial?.source || '',
        description: rest.description || initial?.description || '',
        amount: rest.amount || initial?.amount || '',
        category: rest.category || initial?.category || '',
        customCategory: rest.customCategory || '',
        date: rest.date || (initial?.date ? new Date(initial.date).toISOString().split('T')[0] : todayISO()),
      };
    }
    return {
      source: initial?.source || '',
      description: initial?.description || '',
      amount: initial?.amount || '',
      category: initial?.category || '',
      customCategory: initial?.category === 'other' ? initial?.customCategoryName || '' : '',
      date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : todayISO(),
    };
  });

  const [errors, setErrors] = useState({});
  const [completedSteps, setCompletedSteps] = useState(() => {
    // If editing, mark all steps as visitable
    if (initial) return [0, 1, 2, 3];
    if (draft && typeof draft._step === 'number') {
      return Array.from({ length: draft._step }, (_, i) => i);
    }
    return [];
  });

  // ── Persist draft on every change ────────────────────────
  useEffect(() => {
    saveDraft(form, step, editId);
  }, [form, step, editId]);

  // ── Browser tab title ────────────────────────────────────
  useEffect(() => {
    const title = STEP_TITLES[FORM_STEPS[step]] || 'Add Income — Expenz';
    document.title = title;
    return () => {
      document.title = 'Expenz - Smart Finance Manager';
    };
  }, [step]);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    },
    [errors]
  );

  // ── Per-step validation ──────────────────────────────────
  const validateStep = useCallback(
    (s) => {
      const errs = {};
      switch (s) {
        case 0:
          if (!form.source.trim()) errs.source = t('validation.required', 'Required');
          break;
        case 1:
          if (!form.amount || parseFloat(form.amount) <= 0)
            errs.amount = t('validation.invalidAmount', 'Enter a valid amount');
          if (!form.category) errs.category = t('validation.required', 'Required');
          if (form.category === 'other' && !form.customCategory.trim())
            errs.customCategory = t('validation.required', 'Enter custom category name');
          break;
        case 2:
          if (!form.date) errs.date = t('validation.required', 'Required');
          break;
        default:
          break;
      }
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [form, t]
  );

  const goTo = useCallback(
    (target) => {
      setDirection(target > step ? 1 : -1);
      setStep(target);
    },
    [step]
  );

  const next = useCallback(() => {
    if (!validateStep(step)) return;
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
    if (step < FORM_STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, validateStep]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleStepClick = useCallback(
    (target) => {
      // Validate current step before allowing forward jumps
      if (target > step) {
        if (!validateStep(step)) return;
        setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
      }
      goTo(target);
    },
    [step, validateStep, goTo]
  );

  const handleSubmit = useCallback(() => {
    // Final full validation
    for (let s = 0; s < FORM_STEPS.length - 1; s++) {
      if (!validateStep(s)) {
        goTo(s);
        return;
      }
    }

    const payload = {
      source: form.source.trim(),
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      category: form.category,
      date: form.date,
    };

    if (form.category === 'other' && form.customCategory.trim()) {
      payload.customCategoryName = form.customCategory.trim();
    }

    clearDraft();
    onSubmit(payload);
  }, [form, validateStep, goTo, onSubmit]);

  const handleCancel = useCallback(() => {
    clearDraft();
    if (onCancel) onCancel();
  }, [onCancel]);

  // ── Computed ─────────────────────────────────────────────
  const displayCategory = useMemo(() => {
    if (form.category === 'other' && form.customCategory.trim()) {
      return form.customCategory.trim();
    }
    const found = categories.find((c) => c.value === form.category);
    return found?.label || '—';
  }, [form.category, form.customCategory, categories]);

  const isLastStep = step === FORM_STEPS.length - 1;

  // ─────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Step Indicator */}
      <StepIndicator
        steps={FORM_STEPS}
        current={step}
        onStepClick={handleStepClick}
        completedSteps={completedSteps}
      />

      {/* Form Steps */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLastStep) handleSubmit();
          else next();
        }}
        className="relative"
      >
        <AnimatePresence mode="wait" initial={false}>

          {/* ── Step 1: Source ───────────────────────────────── */}
          {step === 0 && (
            <StepWrapper stepKey="source" direction={direction}>
              <div className="space-y-5">
                <div className="mb-2">
                  <h3 className="font-poppins font-bold text-lg text-forest-800 dark:text-forest-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-forest-50 dark:bg-forest-900/40 flex items-center justify-center text-forest-600 dark:text-forest-300">
                      <DollarIcon size={16} />
                    </span>
                    {t('income.source', 'Income Source')}
                  </h3>
                  <p className="body-text text-xs mt-1 ml-10">
                    {t('income.sourceHint', 'Where does this income come from?')}
                  </p>
                </div>

                <Input
                  label={t('income.source', 'Source')}
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  error={errors.source}
                  placeholder="e.g., Main Job, Freelance Client, Side Project"
                  autoFocus
                />

                <Input
                  label={t('expenses.description', 'Description')}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Optional notes or details…"
                />
              </div>
            </StepWrapper>
          )}

          {/* ── Step 2: Amount & Category ────────────────────── */}
          {step === 1 && (
            <StepWrapper stepKey="details" direction={direction}>
              <div className="space-y-5">
                <div className="mb-2">
                  <h3 className="font-poppins font-bold text-lg text-forest-800 dark:text-forest-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-forest-50 dark:bg-forest-900/40 flex items-center justify-center text-forest-600 dark:text-forest-300">
                      <DollarIcon size={16} />
                    </span>
                    {t('income.amountCategory', 'Amount & Category')}
                  </h3>
                  <p className="body-text text-xs mt-1 ml-10">
                    {t('income.amountCategoryHint', 'How much and what type of income?')}
                  </p>
                </div>

                <Input
                  label={t('expenses.amount', 'Amount')}
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
                  label={t('expenses.category', 'Category')}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  error={errors.category}
                  options={categories}
                />

                {/* Custom category input — only when "other" is selected */}
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
                          label={t('income.customCategory', 'Custom Category Name')}
                          name="customCategory"
                          value={form.customCategory}
                          onChange={handleChange}
                          error={errors.customCategory}
                          placeholder="e.g., Rental Income, Gift, Refund…"
                          autoFocus
                        />
                        <p className="text-[11px] text-sage-400 dark:text-sage-500 mt-1.5 ml-1">
                          {t('income.customCategoryHint', 'Enter your own category name for this income.')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </StepWrapper>
          )}

          {/* ── Step 3: Date ─────────────────────────────────── */}
          {step === 2 && (
            <StepWrapper stepKey="schedule" direction={direction}>
              <div className="space-y-5">
                <div className="mb-2">
                  <h3 className="font-poppins font-bold text-lg text-forest-800 dark:text-forest-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-forest-50 dark:bg-forest-900/40 flex items-center justify-center text-forest-600 dark:text-forest-300">
                      <CalendarIcon size={16} />
                    </span>
                    {t('income.dateTitle', 'When was it received?')}
                  </h3>
                  <p className="body-text text-xs mt-1 ml-10">
                    {t('income.dateHint', 'Select the date you received this income.')}
                  </p>
                </div>

                <Input
                  label={t('expenses.date', 'Date')}
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  error={errors.date}
                  icon={CalendarIcon}
                />

                {/* Quick date buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: t('income.today', 'Today'), value: todayISO() },
                    {
                      label: t('income.yesterday', 'Yesterday'),
                      value: (() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        return d.toISOString().split('T')[0];
                      })(),
                    },
                    {
                      label: t('income.lastWeek', 'Last week'),
                      value: (() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 7);
                        return d.toISOString().split('T')[0];
                      })(),
                    },
                    {
                      label: t('income.firstOfMonth', '1st of month'),
                      value: (() => {
                        const d = new Date();
                        d.setDate(1);
                        return d.toISOString().split('T')[0];
                      })(),
                    },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, date: q.value }));
                        if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-poppins font-medium transition-all
                        border
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

          {/* ── Step 4: Review ───────────────────────────────── */}
          {step === 3 && (
            <StepWrapper stepKey="review" direction={direction}>
              <div className="space-y-5">
                <div className="mb-2">
                  <h3 className="font-poppins font-bold text-lg text-forest-800 dark:text-forest-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-forest-50 dark:bg-forest-900/40 flex items-center justify-center text-forest-600 dark:text-forest-300">
                      <CheckIcon size={16} />
                    </span>
                    {t('income.reviewTitle', 'Review & Confirm')}
                  </h3>
                  <p className="body-text text-xs mt-1 ml-10">
                    {t('income.reviewHint', 'Double-check everything before saving.')}
                  </p>
                </div>

                {/* Summary card */}
                <div className="rounded-xl border-2 border-sage-100 dark:border-surface-border-dark bg-white dark:bg-surface-dark overflow-hidden">
                  {/* Amount header */}
                  <div className="bg-gradient-to-r from-forest-500 to-forest-600 px-5 py-4 text-center">
                    <p className="text-forest-100 text-xs font-medium mb-1">
                      {t('income.totalAmount', 'Total Amount')}
                    </p>
                    <p className="text-white font-poppins font-bold text-3xl">
                      {form.amount ? parseFloat(form.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) : '0.00'}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="divide-y divide-sage-100 dark:divide-surface-border-dark">
                    {[
                      { label: t('income.source', 'Source'), value: form.source || '—' },
                      {
                        label: t('expenses.description', 'Description'),
                        value: form.description || t('common.none', '—'),
                      },
                      { label: t('expenses.category', 'Category'), value: displayCategory },
                      {
                        label: t('expenses.date', 'Date'),
                        value: form.date
                          ? new Date(form.date + 'T00:00:00').toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '—',
                      },
                    ].map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-5 py-3 hover:bg-sage-50 dark:hover:bg-forest-900/10 transition-colors cursor-pointer"
                        onClick={() => goTo(idx < 2 ? 0 : idx === 2 ? 1 : 2)}
                        title="Click to edit"
                      >
                        <span className="body-text text-sm">{row.label}</span>
                        <span className="font-poppins font-semibold text-sm text-forest-700 dark:text-forest-200 text-right max-w-[55%] truncate">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-[11px] text-sage-400 dark:text-sage-500">
                  {t('income.clickToEdit', 'Click any field above to edit it.')}
                </p>
              </div>
            </StepWrapper>
          )}
        </AnimatePresence>

        {/* ── Navigation Buttons ──────────────────────────────── */}
        <div className="flex items-center gap-3 mt-8 pt-4 border-t border-sage-100 dark:border-surface-border-dark">
          {/* Cancel / Back */}
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>
            )}
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={prev}>
                {t('common.back', 'Back')}
              </Button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Next / Submit */}
          {isLastStep ? (
            <Button type="submit" loading={loading} className="min-w-[140px]">
              {initial ? t('common.save', 'Save Changes') : t('income.addIncome', 'Add Income')}
            </Button>
          ) : (
            <Button type="submit" className="min-w-[120px]">
              {t('common.next', 'Next')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IncomeForm;