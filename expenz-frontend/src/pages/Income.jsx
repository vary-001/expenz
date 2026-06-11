// src/pages/Income.jsx
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
import IncomeForm from '../components/income/IncomeForm';
import IncomeItem from '../components/income/IncomeItem';

import PlusIcon from '../assets/svgs/PlusIcon';
import TrendUpIcon from '../assets/svgs/TrendUpIcon';
import { formatCurrency } from '../utils/formatters';

const Income = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [incomes, setIncomes] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchIncomes = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    try {
      const res = await API.get('/income');
      setIncomes(res.data?.data?.incomes || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const sources = [...new Set(incomes.map(i => i.source).filter(Boolean))];

  const sourceBreakdown = incomes.reduce((acc, inc) => {
    const k = inc.source || 'Other';
    acc[k] = (acc[k] || 0) + inc.amount;
    return acc;
  }, {});
  const topSource = Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])[0];

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editing) {
        await API.put(`/income/${editing._id}`, data);
        addToast('Income updated', 'success');
      } else {
        await API.post('/income', data);
        addToast('Income added', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      await fetchIncomes(true);
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
      await API.delete(`/income/${deleteTarget._id}`);
      addToast('Income deleted', 'success');
      setDeleteTarget(null);
      await fetchIncomes(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) return <Loader text={t('common.loading')} />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover={false}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 inline-block mb-3">
            <TrendUpIcon size={20} className="text-white" />
          </div>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('income.totalIncome')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">
            {formatCurrency(totalIncome)}
          </p>
        </Card>

        <Card hover={false} delay={0.1}>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('income.sources')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">{sources.length}</p>
          <p className="font-inter text-[10px] text-sage-400 dark:text-sage-500 mt-1">
            Unique income sources
          </p>
        </Card>

        <Card hover={false} delay={0.2}>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('income.topSource')}
          </p>
          {topSource ? (
            <>
              <p className="font-poppins font-semibold text-base text-forest-900 dark:text-forest-50 truncate">
                {topSource[0]}
              </p>
              <p className="money text-sm text-forest-600 dark:text-forest-300">
                {formatCurrency(topSource[1])}
              </p>
            </>
          ) : (
            <p className="body-text">No data</p>
          )}
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="heading-3">Income Records</h3>
        <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true); }}>
          {t('income.addIncome')}
        </Button>
      </div>

      {/* List */}
      {incomes.length === 0 ? (
        <EmptyState
          title="No income recorded"
          description="Add your income sources to track your finances"
          actionLabel={t('income.addIncome')}
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {incomes.map((inc, i) => (
              <IncomeItem
                key={inc._id}
                income={inc}
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
        title={editing ? t('common.edit') : t('income.newIncome')}
      >
        <IncomeForm
          onSubmit={handleSubmit}
          loading={submitLoading}
          initial={editing}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('common.delete')}
        message={`Delete this income record? This action cannot be undone.`}
        loading={submitLoading}
      />
    </div>
  );
};

export default Income;