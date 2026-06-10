// src/pages/Income.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import IncomeForm from '../components/income/IncomeForm';
import IncomeList from '../components/income/IncomeList';
import IncomeSourceBadge from '../components/income/IncomeSourceBadge';
import PlusIcon from '../assets/svgs/PlusIcon';
import { formatCurrency } from '../utils/formatters';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { request, loading } = useApi();

  const fetchIncomes = useCallback(async () => {
    try {
      const res = await request('get', '/income');
      // API returns { success, status, message, data: { incomes: [...] } }
      const payload = res?.data || res || {};
      setIncomes(payload.incomes || []);
    } catch {} finally {
      setPageLoading(false);
    }
  }, [request]);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  // Extract unique income sources
  const incomeSources = [...new Set(incomes.map((i) => i.source).filter(Boolean))];
  const totalIncome = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);

  // Group by source for summary
  const sourceBreakdown = incomes.reduce((acc, inc) => {
    const key = inc.source || 'Other';
    acc[key] = (acc[key] || 0) + (inc.amount || 0);
    return acc;
  }, {});

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await request('put', `/income/${editing._id}`, data, 'Income updated');
      } else {
        await request('post', '/income', data, 'Income added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchIncomes();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request('delete', `/income/${deleteTarget._id}`, null, 'Income archived');
      setDeleteTarget(null);
      fetchIncomes();
    } catch {}
  };

  if (pageLoading) return <Loader text="Loading income records..." />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-roboto text-sage-500 mb-1">Total Income</p>
          <p className="text-2xl font-roboto font-bold text-gradient-forest">{formatCurrency(totalIncome)}</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Income Sources</p>
          <p className="text-2xl font-roboto font-bold text-forest-800">{incomeSources.length}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {incomeSources.slice(0, 4).map((s) => (
              <IncomeSourceBadge key={s} source={s} category="salary" />
            ))}
          </div>
        </Card>
        <Card delay={0.2}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Top Source</p>
          {Object.entries(sourceBreakdown).length > 0 ? (
            <>
              <p className="text-lg font-roboto font-bold text-forest-800">
                {Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0]}
              </p>
              <p className="text-sm font-roboto text-forest-600">
                {formatCurrency(Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1])[0]?.[1])}
              </p>
            </>
          ) : (
            <p className="text-sm font-roboto text-sage-400">No data</p>
          )}
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-roboto font-bold text-forest-800">Income Records</h3>
        <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Add Income
        </Button>
      </div>

      {/* Income List */}
      <IncomeList
        incomes={incomes}
        onEdit={(inc) => { setEditing(inc); setModalOpen(true); }}
        onDelete={(inc) => setDeleteTarget(inc)}
        emptyAction={() => setModalOpen(true)}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Income' : 'New Income'}
      >
        <IncomeForm
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
        title="Archive Income"
        message="This income record will be moved to archive."
        loading={loading}
      />
    </div>
  );
};

export default Income;