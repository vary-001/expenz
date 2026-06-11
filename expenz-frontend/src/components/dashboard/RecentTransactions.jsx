// src/components/dashboard/RecentTransactions.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';

const RecentTransactions = ({ transactions = [] }) => {
  const { t } = useTranslation();
  const recent = transactions.slice(0, 6);

  if (!recent.length) {
    return <p className="body-text text-center py-8">{t('dashboard.noData')}</p>;
  }

  return (
    <div className="space-y-2">
      {recent.map((tx, index) => {
        const isIncome = tx.type === 'income';
        return (
          <motion.div
            key={tx._id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-forest-50/50 dark:hover:bg-forest-900/20 transition-colors"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(tx.category) + '20' }}
            >
              {isIncome ? (
                <TrendUpIcon size={16} className="text-forest-600 dark:text-forest-300" />
              ) : (
                <TrendDownIcon size={16} className="text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter font-medium text-sm text-forest-800 dark:text-forest-100 truncate">
                {tx.description || tx.source}
              </p>
              <p className="font-inter text-xs text-sage-400 dark:text-sage-500">
                {tx.category} • {formatDate(tx.date)}
              </p>
            </div>
            <p className={`money text-sm whitespace-nowrap ${isIncome ? 'text-forest-600 dark:text-forest-300' : 'text-orange-500'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RecentTransactions;