// src/components/dashboard/SummaryCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import WalletIcon from '../../assets/svgs/WalletIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';

const cards = [
  { key: 'balance', label: 'Total Balance', Icon: WalletIcon, color: 'from-forest-500 to-forest-700' },
  { key: 'income', label: 'Total Income', Icon: TrendUpIcon, color: 'from-emerald-400 to-emerald-600' },
  { key: 'expense', label: 'Total Expenses', Icon: TrendDownIcon, color: 'from-orange-400 to-red-500' },
  { key: 'budget', label: 'Budget Left', Icon: BudgetIcon, color: 'from-forest-400 to-forest-600' },
];

const SummaryCards = ({ data = {} }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
    {cards.map(({ key, label, Icon, color }, index) => (
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
        className="bg-white rounded-2xl shadow-card p-5 border border-sage-100/50 relative overflow-hidden"
      >
        {/* Decorative background */}
        <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-10`} />

        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
        </div>
        <p className="text-xs font-roboto font-medium text-sage-500 mb-1">{label}</p>
        <p className="text-xl font-roboto font-bold text-forest-900">
          {formatCurrency(data[key] || 0)}
        </p>
      </motion.div>
    ))}
  </div>
);

export default SummaryCards;