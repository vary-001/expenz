// src/pages/Expenses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';

import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseItem from '../components/expenses/ExpenseItem';

import PlusIcon from '../assets/svgs/PlusIcon';
import SearchIcon from '../assets/svgs/SearchIcon';
import TrendDownIcon from '../assets/svgs/TrendDownIcon';
import WalletIcon from '../assets/svgs/WalletIcon';
import CalendarIcon from '../assets/svgs/CalendarIcon';
import { formatCurrency } from '../utils/formatters';

const Expenses = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const categories = [
    { value: '', label: t('common.all') },
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

  const fetchExpenses = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    try {
      const res = await API.get('/expenses');
      const d = res.data?.data;
      setExpenses(d?.expenses || []);
      setStats({ total: d?.total || 0, count: d?.count || 0 });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    let r = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(e =>
        e.description?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
      );
    }
    if (filterCat) r = r.filter(e => e.category === filterCat);
    setFiltered(r);
  }, [search, filterCat, expenses]);

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editing) {
        await API.put(`/expenses/${editing._id}`, data);
        addToast('Expense updated', 'success');
      } else {
        await API.post('/expenses', data);
        addToast('Expense added', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      await fetchExpenses(true);
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
      await API.delete(`/expenses/${deleteTarget._id}`);
      addToast('Expense deleted', 'success');
      setDeleteTarget(null);
      await fetchExpenses(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const todayTotal = expenses
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + e.amount, 0);

  const monthTotal = expenses
    .filter(e => {
      const d = new Date(e.date);
      const n = new Date();
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    })
    .reduce((s, e) => s + e.amount, 0);

  if (pageLoading) return <Loader text={t('common.loading')} />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover={false}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 inline-block mb-3">
            <TrendDownIcon size={20} className="text-white" />
          </div>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('expenses.totalSpent')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">
            {formatCurrency(stats.total)}
          </p>
          <p className="font-inter text-[10px] text-sage-400 dark:text-sage-500 mt-1">
            {stats.count} records
          </p>
        </Card>

        <Card hover={false} delay={0.1}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 inline-block mb-3">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('expenses.thisMonth')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">
            {formatCurrency(monthTotal)}
          </p>
        </Card>

        <Card hover={false} delay={0.2}>
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 inline-block mb-3">
            <WalletIcon size={20} className="text-white" />
          </div>
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">
            {t('expenses.today')}
          </p>
          <p className="money text-xl text-forest-900 dark:text-forest-50">
            {formatCurrency(todayTotal)}
          </p>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card delay={0.25}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-forest-50 dark:bg-surface-card-dark border border-sage-100 dark:border-surface-border-dark rounded-xl px-4 py-2.5 flex-1">
            <SearchIcon size={16} className="text-sage-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent font-inter text-sm text-forest-800 dark:text-forest-50 placeholder:text-sage-400 outline-none w-full"
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="input-base !py-2.5 !w-auto cursor-pointer"
          >
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true); }}>
            {t('expenses.addExpense')}
          </Button>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={t('expenses.noExpenses')}
          description="Start tracking your spending to see insights"
          actionLabel={expenses.length === 0 ? t('expenses.addFirstExpense') : null}
          onAction={expenses.length === 0 ? () => setModalOpen(true) : null}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((expense, i) => (
              <ExpenseItem
                key={expense._id}
                expense={expense}
                onEdit={(e) => { setEditing(e); setModalOpen(true); }}
                onDelete={(e) => setDeleteTarget(e)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? t('expenses.editExpense') : t('expenses.newExpense')}
      >
        <ExpenseForm
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
        message={`Delete "${deleteTarget?.description}"? This action cannot be undone.`}
        loading={submitLoading}
      />
    </div>
  );
};

export default Expenses;