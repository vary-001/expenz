// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SummaryCards from '../components/dashboard/SummaryCards';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseChart from '../components/charts/ExpenseChart';
import IncomeChart from '../components/charts/IncomeChart';

import { formatCurrency, getGreeting } from '../utils/formatters';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

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

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Auto-refresh every 30 seconds (real-time feel)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (pageLoading) return <Loader text="Loading your financial overview..." />;

  const summary = {
    balance: data?.balance || 0,
    income: data?.totalIncome || 0,
    expense: data?.totalExpense || 0,
    budget: data?.budgetRemaining || 0,
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ─── WELCOME BANNER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-forest rounded-2xl p-6 text-white relative overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute top-4 right-32 w-2 h-2 rounded-full bg-white/40 animate-pulse" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-roboto text-white/70 mb-1">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'} 👋
            </p>
            <h2 className="text-2xl font-roboto font-bold mb-1">
              Your Balance: {formatCurrency(summary.balance)}
            </h2>
            <p className="text-xs font-roboto text-white/60">
              {refreshing ? '🔄 Syncing latest data...' : '✨ Live tracking enabled • Auto-refresh every 30s'}
            </p>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-roboto text-sm font-medium transition-all backdrop-blur-sm border border-white/20"
          >
            🔄 Refresh
          </button>
        </div>
      </motion.div>

      {/* ─── SUMMARY CARDS ─── */}
      <SummaryCards data={summary} />

      {/* ─── MAIN GRID ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-roboto font-bold text-gradient-forest">
                💸 Expense Breakdown
              </h3>
              <span className="text-xs font-roboto text-sage-400">By category</span>
            </div>
            {data?.expenseByCategory?.length ? (
              <ExpenseChart data={data.expenseByCategory} />
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-roboto text-sage-400">
                  No expense data yet. Add some expenses to see the breakdown!
                </p>
              </div>
            )}
          </Card>

          <Card delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-roboto font-bold text-gradient-forest">
                💰 Income by Source
              </h3>
              <span className="text-xs font-roboto text-sage-400">Top sources</span>
            </div>
            {data?.incomeBySource?.length ? (
              <IncomeChart data={data.incomeBySource} />
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-roboto text-sage-400">
                  No income data yet. Record your income to track your sources!
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card delay={0.15}>
            <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">
              ⚡ Quick Actions
            </h3>
            <QuickActions />
          </Card>

          <Card delay={0.2}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-roboto font-bold text-gradient-forest">
                🕐 Recent Activity
              </h3>
              {refreshing && (
                <span className="text-xs font-roboto text-forest-500 animate-pulse">Updating...</span>
              )}
            </div>
            <RecentTransactions transactions={data?.recentTransactions || []} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;