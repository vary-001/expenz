// src/pages/Archives.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';

import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import ArchiveItem from '../components/archives/ArchiveItem';

import ArchiveIcon from '../assets/svgs/ArchiveIcon';
import SearchIcon from '../assets/svgs/SearchIcon';
import { formatCurrency } from '../utils/formatters';

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { addToast } = useToast();

  const fetchArchives = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    try {
      const res = await API.get('/archives');
      setArchives(res.data?.data?.archives || []);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load archives', 'error');
    } finally {
      setPageLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  // Filter
  useEffect(() => {
    let result = [...archives];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.description?.toLowerCase().includes(q) ||
          a.source?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      result = result.filter((a) =>
        filterType === 'expense'
          ? a.originalModel === 'Expense' || a.originalModel === 'Transaction'
          : a.originalModel === 'Income'
      );
    }
    setFiltered(result);
  }, [search, filterType, archives]);

  const handleRestore = async (item) => {
    setActionLoading(true);
    try {
      await API.post(`/archives/${item._id}/restore`);
      addToast('Item restored successfully', 'success');
      await fetchArchives(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Restore failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await API.delete(`/archives/${deleteTarget._id}`);
      addToast('Permanently deleted', 'success');
      setDeleteTarget(null);
      await fetchArchives(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats
  const expenseArchives = archives.filter(
    (a) => a.originalModel === 'Expense' || a.originalModel === 'Transaction'
  );
  const incomeArchives = archives.filter((a) => a.originalModel === 'Income');

  if (pageLoading) return <Loader text="Loading your archives..." />;

  return (
    <div className="space-y-6">
      {/* ─── INFO BANNER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-sage-50 to-forest-50 rounded-2xl p-5 border border-sage-100 relative overflow-hidden"
      >
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-forest-100/40" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-2xl bg-white shadow-sm">
            <ArchiveIcon size={28} className="text-forest-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-roboto font-bold text-forest-900 mb-1">
              Archived Records
            </h3>
            <p className="text-sm font-roboto text-sage-600">
              {archives.length === 0
                ? 'Your archive is empty. Deleted items will appear here for safekeeping.'
                : `You have ${archives.length} archived item${archives.length !== 1 ? 's' : ''}. Restore or permanently delete them anytime.`
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-roboto text-sage-500 mb-1">Total Archived</p>
          <p className="text-2xl font-roboto font-bold text-forest-900">{archives.length}</p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">All records</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Archived Expenses</p>
          <p className="text-2xl font-roboto font-bold text-orange-500">
            {formatCurrency(expenseArchives.reduce((s, a) => s + (a.amount || 0), 0))}
          </p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">{expenseArchives.length} items</p>
        </Card>
        <Card delay={0.2}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Archived Income</p>
          <p className="text-2xl font-roboto font-bold text-forest-600">
            {formatCurrency(incomeArchives.reduce((s, a) => s + (a.amount || 0), 0))}
          </p>
          <p className="text-[10px] font-roboto text-sage-400 mt-1">{incomeArchives.length} items</p>
        </Card>
      </div>

      {/* ─── SEARCH & FILTER ─── */}
      {archives.length > 0 && (
        <Card delay={0.25}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-forest-50 rounded-xl px-4 py-2.5 flex-1">
              <SearchIcon size={16} className="text-sage-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search archived records..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-sm font-roboto text-forest-800 placeholder:text-sage-400 outline-none w-full"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'expense', 'income'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-roboto font-medium capitalize transition-all ${
                    filterType === type
                      ? 'bg-gradient-forest text-white shadow-forest'
                      : 'bg-forest-50 text-sage-600 hover:bg-forest-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ─── ARCHIVE LIST ─── */}
      {filtered.length === 0 ? (
        <EmptyState
          title={archives.length === 0 ? 'Archive is empty' : 'No matches found'}
          description={
            archives.length === 0
              ? 'When you delete expenses or income records, they will be safely stored here.'
              : 'Try adjusting your search or filter.'
          }
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <ArchiveItem
                key={item._id}
                item={item}
                onRestore={handleRestore}
                onDelete={(item) => setDeleteTarget(item)}
                index={i}
                loading={actionLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ─── CONFIRM DELETE ─── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Permanently Delete"
        message="This action cannot be undone. The record will be permanently removed from your account."
        loading={actionLoading}
      />
    </div>
  );
};

export default Archives;