// src/pages/Transactions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { useToast } from '../hooks/useToast';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import PlusIcon from '../assets/svgs/PlusIcon';
import FilterIcon from '../assets/svgs/FilterIcon';
import SearchIcon from '../assets/svgs/SearchIcon';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const { request, loading } = useApi();
  const { addToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await request('get', '/transactions');
      const expenses = (res.transactions || res || []).filter((t) => t.type === 'expense');
      setTransactions(expenses);
      setFiltered(expenses);
    } catch {} finally {
      setPageLoading(false);
    }
  }, [request]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    let result = [...transactions];
    if (search) {
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterCat) {
      result = result.filter((t) => t.category === filterCat);
    }
    setFiltered(result);
  }, [search, filterCat, transactions]);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await request('put', `/transactions/${editing._id}`, data, 'Expense updated successfully');
      } else {
        await request('post', '/transactions', data, 'Expense added successfully');
      }
      setModalOpen(false);
      setEditing(null);
      fetchTransactions();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request('delete', `/transactions/${deleteTarget._id}`, null, 'Transaction deleted');
      setDeleteTarget(null);
      fetchTransactions();
    } catch {}
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    setModalOpen(true);
  };

  if (pageLoading) return <Loader text="Loading transactions..." />;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-forest-50 rounded-xl px-4 py-2.5 flex-1 sm:max-w-xs">
            <SearchIcon size={16} className="text-sage-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm font-roboto text-forest-800 placeholder:text-sage-400 outline-none w-full"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="input-forest !py-2.5 !w-auto text-sm"
          >
            <option value="">All Categories</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="shopping">Shopping</option>
            <option value="rent">Rent</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Button
          icon={PlusIcon}
          onClick={() => { setEditing(null); setModalOpen(true); }}
        >
          Add Expense
        </Button>
      </motion.div>

      {/* Transaction List */}
      <TransactionList
        transactions={filtered}
        onEdit={handleEdit}
        onDelete={(tx) => setDeleteTarget(tx)}
        emptyAction={() => setModalOpen(true)}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Expense' : 'New Expense'}
      >
        <TransactionForm
          onSubmit={handleSubmit}
          loading={loading}
          initial={editing}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="This will permanently delete the transaction. This action cannot be undone."
        loading={loading}
      />
    </div>
  );
};

export default Transactions;