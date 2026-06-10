// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import SummaryCards from '../components/dashboard/SummaryCards';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import QuickActions from '../components/dashboard/QuickActions';
import ExpenseChart from '../components/charts/ExpenseChart';
import IncomeChart from '../components/charts/IncomeChart';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { request } = useApi();

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await request('get', '/dashboard');
      setData(res);
    } catch {
      // Error handled by useApi
    } finally {
      setPageLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (pageLoading) return <Loader text="Loading your financial overview..." />;

  const summary = {
    balance: (data?.totalIncome || 0) - (data?.totalExpense || 0),
    income: data?.totalIncome || 0,
    expense: data?.totalExpense || 0,
    budget: data?.budgetRemaining || 0,
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Summary Cards */}
      <SummaryCards data={summary} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Breakdown */}
          <Card>
            <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Expense Breakdown</h3>
            {data?.expenseByCategory?.length ? (
              <ExpenseChart data={data.expenseByCategory} />
            ) : (
              <p className="text-sm font-roboto text-sage-400 text-center py-8">No expense data yet</p>
            )}
          </Card>

          {/* Income by Source */}
          <Card delay={0.1}>
            <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Income by Source</h3>
            {data?.incomeBySource?.length ? (
              <IncomeChart data={data.incomeBySource} />
            ) : (
              <p className="text-sm font-roboto text-sage-400 text-center py-8">No income data yet</p>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card delay={0.15}>
            <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Quick Actions</h3>
            <QuickActions />
          </Card>

          {/* Recent Transactions */}
          <Card delay={0.2}>
            <h3 className="text-base font-roboto font-bold text-gradient-forest mb-4">Recent Activity</h3>
            <RecentTransactions transactions={data?.recentTransactions || []} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;