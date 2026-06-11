// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';

import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SummaryCards from '../components/dashboard/SummaryCards';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseChart from '../components/charts/ExpenseChart';
import IncomeChart from '../components/charts/IncomeChart';

import RefreshIcon from '../assets/svgs/RefreshIcon';

const Dashboard = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(true);
    else setRefreshing(true);
    try {
      const res = await API.get('/dashboard');
      setData(res.data?.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (pageLoading) return <Loader text={t('common.loading')} />;

  const summary = {
    balance: data?.balance || 0,
    income: data?.totalIncome || 0,
    expense: data?.totalExpense || 0,
    budget: data?.budgetRemaining || 0,
  };

  return (
    <div className="space-y-6">
      {/* Refresh bar */}
      <div className="flex items-center justify-between">
        <p className="body-text">{t('dashboard.title')}</p>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-forest-50 dark:bg-forest-900/40
                     text-forest-700 dark:text-forest-200
                     hover:bg-forest-100 dark:hover:bg-forest-900/60
                     font-inter text-sm font-medium transition-all disabled:opacity-50"
        >
          <motion.div animate={refreshing ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}>
            <RefreshIcon size={16} />
          </motion.div>
          <span>{t('dashboard.refresh')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards data={summary} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="heading-3 mb-4">{t('dashboard.expenseBreakdown')}</h3>
            {data?.expenseByCategory?.length ? (
              <ExpenseChart data={data.expenseByCategory} />
            ) : (
              <p className="body-text text-center py-8">{t('dashboard.noData')}</p>
            )}
          </Card>

          <Card delay={0.1}>
            <h3 className="heading-3 mb-4">{t('dashboard.incomeBySource')}</h3>
            {data?.incomeBySource?.length ? (
              <IncomeChart data={data.incomeBySource} />
            ) : (
              <p className="body-text text-center py-8">{t('dashboard.noData')}</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card delay={0.15}>
            <h3 className="heading-3 mb-4">{t('dashboard.quickActions')}</h3>
            <QuickActions />
          </Card>

          <Card delay={0.2}>
            <h3 className="heading-3 mb-4">{t('dashboard.recentActivity')}</h3>
            <RecentTransactions transactions={data?.recentTransactions || []} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;