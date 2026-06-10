// src/pages/Budget.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import Card from '../components/common/Card';
import ConfirmDialog from '../components/common/ConfirmDialog';
import BudgetForm from '../components/budget/BudgetForm';
import BudgetList from '../components/budget/BudgetList';
import BudgetChart from '../components/charts/BudgetChart';
import PlusIcon from '../assets/svgs/PlusIcon';
import { formatCurrency } from '../utils/formatters';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { request, loading } = useApi();

  const fetchData = useCallback(async () => {
    try {
      const [budgetRes, incomeRes] = await Promise.all([
        request('get', '/budgets'),
        request('get', '/income'),
      ]);
      setBudgets(budgetRes.budgets || budgetRes || []);
      const sources = [...new Set((incomeRes.incomes || incomeRes || []).map((i) => i.source).filter(Boolean))];
      setIncomeSources(sources);
    } catch {} finally {
      setPageLoading(false);
    }
  }, [request]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalBudgeted = budgets.reduce((s, b) => s + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  const chartData = budgets.map((b) => ({
    category: b.category,
    budgeted: b.amount,
    spent: b.spent || 0,
  }));

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await request('put', `/budgets/${editing._id}`, data, 'Budget updated');
      } else {
        await request('post', '/budgets', data, 'Budget created');
      }
      setModalOpen(false);
      setEditing(null);
      fetchData();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request('delete', `/budgets/${deleteTarget._id}`, null, 'Budget removed');
      setDeleteTarget(null);
      fetchData();
    } catch {}
  };

  if (pageLoading) return <Loader text="Loading budgets..." />;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-roboto text-sage-500 mb-1">Total Budgeted</p>
          <p className="text-2xl font-roboto font-bold text-gradient-forest">{formatCurrency(totalBudgeted)}</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Total Spent</p>
          <p className="text-2xl font-roboto font-bold text-forest-800">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card delay={0.2}>
          <p className="text-xs font-roboto text-sage-500 mb-1">Remaining</p>
          <p className={`text-2xl font-roboto font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-forest-600' : 'text-red-500'}`}>
            {formatCurrency(totalBudgeted - totalSpent)}
          </p>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card delay={0.15}>
          <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Budget vs Spending</h3>
          <BudgetChart data={chartData} />
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-roboto font-bold text-forest-800">Your Budgets</h3>
        <Button icon={PlusIcon} onClick={() => { setEditing(null); setModalOpen(true); }}>
          Create Budget
        </Button>
      </div>

      {/* Budget list */}
      <BudgetList
        budgets={budgets}
        onEdit={(b) => { setEditing(b); setModalOpen(true); }}
        onDelete={(b) => setDeleteTarget(b)}
        emptyAction={() => setModalOpen(true)}
      />

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? 'Edit Budget' : 'New Budget'}
      >
        <BudgetForm
          onSubmit={handleSubmit}
          loading={loading}
          initial={editing}
          incomeSources={incomeSources}
          onCancel={() => { setModalOpen(false); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message="Are you sure you want to remove this budget?"
        loading={loading}
      />
    </div>
  );
};

export default Budget;