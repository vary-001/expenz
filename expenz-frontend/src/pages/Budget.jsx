// src/pages/Budget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';

import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import BudgetForm from '../components/budget/BudgetForm';
import BudgetCard from '../components/budget/BudgetCard';

import PlusIcon from '../assets/svgs/PlusIcon';
import { formatCurrency } from '../utils/formatters';

const Budget = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [budgets, setBudgets] = useState([]);
  const [sources, setSources] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    try {
      const [b, s] = await Promise.all([
        API.get('/budgets'),
        API.get('/income/sources'),
      ]);
      setBudgets(b.data?.data?.budgets || []);
      setSources(s.data?.data?.sources || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const totalRemaining = Math.max(totalBudgeted - totalSpent, 0);

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editing) {
        await API.put(`/budgets/${editing._id}`, data);
        addToast('Budget updated', 'success');
      } else {
        await API.post('/budgets', data);
        addToast('Budget created', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      await fetchData(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitLoading(true);
    try {
      await API.delete(`/budgets/${deleteTarget._id}`);
      addToast('Budget deleted', 'success');
      setDeleteTarget(null);
      await fetchData(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) return <Loader text={t('common.loading')} />;

  return (
    <div className="space-y-6">
      {/* Month banner */}
      <Card hover={false}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
              {t('budget.monthlyBudget')}
            </p>
            <h2 className="font-poppins font-bold text-xl text-gradient-forest">{monthName}</h2>
          </div>
          <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true); }}>
            {t('budget.createBudget')}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover={false}>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('budget.budgeted')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">
            {formatCurrency(totalBudgeted)}
          </p>
        </Card>
        <Card hover={false} delay={0.1}>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('budget.spent')}
          </p>
          <p className="money text-xl text-orange-500">
            {formatCurrency(totalSpent)}
          </p>
        </Card>
        <Card hover={false} delay={0.2}>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('budget.remaining')}
          </p>
          <p className={`money text-xl ${totalBudgeted - totalSpent >= 0 ? 'text-forest-600 dark:text-forest-300' : 'text-red-500'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </Card>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <EmptyState
          title="No budgets yet"
          description="Set monthly budgets to track your spending limits"
          actionLabel={t('budget.createBudget')}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {budgets.map((b, i) => (
              <BudgetCard
                key={b._id}
                budget={b}
                onEdit={(x) => { setEditing(x); setModalOpen(true); }}
                onDelete={(x) => setDeleteTarget(x)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? t('common.edit') : t('budget.createBudget')}
      >
        <BudgetForm
          onSubmit={handleSubmit}
          loading={submitLoading}
          initial={editing}
          incomeSources={sources}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message="Delete this budget? Your expenses will not be affected."
        loading={submitLoading}
      />
    </div>
  );
};

export default Budget;