// src/components/dashboard/RecentTransactions.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';

const RecentTransactions = ({ transactions = [] }) => {
  const recent = transactions.slice(0, 6);

  return (
    <div className="space-y-3">
      {recent.map((tx, index) => (
        <motion.div
          key={tx._id || index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-3 rounded-xl hover:bg-forest-50/50 transition-colors group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: getCategoryColor(tx.category) + '20' }}
          >
            {tx.type === 'income' ? (
              <TrendUpIcon size={18} className="text-forest-600" />
            ) : (
              <TrendDownIcon size={18} className="text-orange-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-roboto font-medium text-forest-800 truncate">{tx.description}</p>
            <p className="text-xs font-roboto text-sage-400">{tx.category} • {formatDate(tx.date)}</p>
          </div>
          <p className={`text-sm font-roboto font-bold ${tx.type === 'income' ? 'text-forest-600' : 'text-orange-500'}`}>
            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
          </p>
        </motion.div>
      ))}
      {!recent.length && (
        <p className="text-sm font-roboto text-sage-400 text-center py-8">No recent transactions</p>
      )}
    </div>
  );
};

export default RecentTransactions;