// src/pages/Expenses.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const categories = [
  { value: '', label: 'All Categories' },
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

const Expenses = () => {
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
  const { addToast } = useToast();

  // ─── FETCH EXPENSES ───
  const fetchExpenses = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    try {
      const res = await API.get('/expenses');
      const data = res.data?.data;
      setExpenses(data?.expenses || []);
      setStats({
        total: data?.total || 0,
        count: data?.count || 0,
      });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load expenses', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // ─── FILTER ───
  useEffect(() => {
    let result = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.description?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q)
      );
    }
    if (filterCat) {
      result = result.filter((e) => e.category === filterCat);
    }
    setFiltered(result);
  }, [search, filterCat, expenses]);

  // ─── CREATE / UPDATE ───
  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editing) {
        await API.put(`/expenses/${editing._id}`, data);
        addToast('Expense updated successfully', 'success');
      } else {
        await API.post('/expenses', data);
        addToast('Expense added successfully', 'success');
      }
      setModalOpen(false);
      setEditing(null);
      await fetchExpenses(true); // refresh list
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ─── DELETE ───
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitLoading(true);
    try {
      await API.delete(`/expenses/${deleteTarget._id}`);
      addToast('Expense moved to archive', 'success');
      setDeleteTarget(null);
      await fetchExpenses(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditing(expense);
    setModalOpen(true);
  };

  // ─── DERIVED STATS ───
  const todayTotal = expenses
    .filter((e) => {
      const today = new Date().toDateString();
      return new Date(e.date).toDateString() === today;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter((e) => {
      const now = new Date();
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  if (pageLoading) return <Loader text="Loading your expenses..." />;

  return (
    <div className="space-y-6">
      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-5 border border-sage-100/50 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-10" />
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 inline-block mb-3">
            <TrendDownIcon size={20} className="text-white" />
          </div>
          <p className="text-xs font-roboto font-medium text-sage-500 mb-1">Total Spent</p>
          <p className="text-2xl font-roboto font-bold text-forest-900">{formatCurrency(stats.total)}</p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">{stats.count} expenses recorded</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card p-5 border border-sage-100/50 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 opacity-10" />
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-forest-400 to-forest-600 inline-block mb-3">
            <CalendarIcon size={20} className="text-white" />
          </div>
          <p className="text-xs font-roboto font-medium text-sage-500 mb-1">This Month</p>
          <p className="text-2xl font-roboto font-bold text-forest-900">{formatCurrency(monthTotal)}</p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">Current month spending</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-card p-5 border border-sage-100/50 relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 opacity-10" />
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 inline-block mb-3">
            <WalletIcon size={20} className="text-white" />
          </div>
          <p className="text-xs font-roboto font-medium text-sage-500 mb-1">Today</p>
          <p className="text-2xl font-roboto font-bold text-forest-900">{formatCurrency(todayTotal)}</p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">Spent today</p>
        </motion.div>
      </div>

      {/* ─── SEARCH & FILTER BAR ─── */}
      <Card delay={0.25}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-forest-50 rounded-xl px-4 py-2.5 flex-1">
            <SearchIcon size={16} className="text-sage-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by description, category, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm font-roboto text-forest-800 placeholder:text-sage-400 outline-none w-full"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="input-forest !py-2.5 !w-auto text-sm cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <Button
            icon={PlusIcon}
            onClick={() => { setEditing(null); setModalOpen(true); }}
          >
            Add Expense
          </Button>
        </div>

        {/* Active filters indicator */}
        {(search || filterCat) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-roboto text-sage-500">Filters:</span>
            {search && (
              <span className="text-xs font-roboto bg-forest-50 text-forest-700 px-2 py-1 rounded-full flex items-center gap-1">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="hover:text-red-500 ml-1">×</button>
              </span>
            )}
            {filterCat && (
              <span className="text-xs font-roboto bg-forest-50 text-forest-700 px-2 py-1 rounded-full flex items-center gap-1">
                Category: {filterCat}
                <button onClick={() => setFilterCat('')} className="hover:text-red-500 ml-1">×</button>
              </span>
            )}
            <span className="text-xs font-roboto text-sage-400 ml-auto">
              Showing {filtered.length} of {expenses.length}
            </span>
          </div>
        )}
      </Card>

      {/* ─── EXPENSE LIST ─── */}
      {filtered.length === 0 ? (
        <EmptyState
          title={expenses.length === 0 ? "No expenses yet" : "No matches found"}
          description={
            expenses.length === 0
              ? "Start tracking your spending. Click the button below to add your first expense."
              : "Try adjusting your search or filter to find what you're looking for."
          }
          actionLabel={expenses.length === 0 ? "Add Your First Expense" : null}
          onAction={expenses.length === 0 ? () => setModalOpen(true) : null}
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((expense, i) => (
              <ExpenseItem
                key={expense._id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={(e) => setDeleteTarget(e)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── MODAL: ADD / EDIT ─── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Expense' : 'New Expense'}
      >
        <ExpenseForm
          onSubmit={handleSubmit}
          loading={submitLoading}
          initial={editing}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      {/* ─── CONFIRM DELETE ─── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Archive Expense"
        message={`This will move "${deleteTarget?.description}" to your archive. You can restore it anytime.`}
        loading={submitLoading}
      />
    </div>
  );
};

export default Expenses;