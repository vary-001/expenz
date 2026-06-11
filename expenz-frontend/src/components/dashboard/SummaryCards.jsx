// src/components/dashboard/SummaryCards.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import WalletIcon from '../../assets/svgs/WalletIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';

const SummaryCards = ({ data = {} }) => {
  const { t } = useTranslation();

  const cards = [
    { key: 'balance', label: t('dashboard.balance'), Icon: WalletIcon, color: 'from-forest-500 to-forest-700' },
    { key: 'income', label: t('dashboard.income'), Icon: TrendUpIcon, color: 'from-emerald-400 to-emerald-600' },
    { key: 'expense', label: t('dashboard.expenses'), Icon: TrendDownIcon, color: 'from-orange-400 to-red-500' },
    { key: 'budget', label: t('dashboard.budgetLeft'), Icon: BudgetIcon, color: 'from-forest-400 to-forest-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, Icon, color }, idx) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          whileHover={{ y: -3 }}
          className="card-base p-5 relative overflow-hidden"
        >
          <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${color} opacity-10`} />
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} inline-block mb-3`}>
            <Icon size={20} className="text-white" />
          </div>
          <p className="font-inter text-xs font-medium text-sage-500 dark:text-sage-400 mb-1">
            {label}
          </p>
          <p className="font-poppins font-bold text-xl text-forest-900 dark:text-forest-50 tabular-nums">
            {formatCurrency(data[key] || 0)}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;