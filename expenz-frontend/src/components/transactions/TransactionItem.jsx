// src/components/transactions/TransactionItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import TrendDownIcon from '../../assets/svgs/TrendDownIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';

const TransactionItem = ({ transaction, onEdit, onDelete, index = 0 }) => {
  const isIncome = transaction.type === 'income';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-sage-100/50 hover:shadow-card transition-all group"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: getCategoryColor(transaction.category) + '15' }}
      >
        {isIncome ? (
          <TrendUpIcon size={20} className="text-forest-500" />
        ) : (
          <TrendDownIcon size={20} className="text-orange-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-roboto font-medium text-forest-800 truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[10px] font-roboto font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: getCategoryColor(transaction.category) + '15', color: getCategoryColor(transaction.category) }}
          >
            {transaction.category}
          </span>
          <span className="text-xs font-roboto text-sage-400">{formatDate(transaction.date)}</span>
        </div>
      </div>
      <p className={`text-sm font-roboto font-bold whitespace-nowrap ${isIncome ? 'text-forest-600' : 'text-orange-500'}`}>
        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
      </p>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button onClick={() => onEdit(transaction)} className="p-2 rounded-lg hover:bg-forest-50 text-sage-400 hover:text-forest-600 transition-colors">
            <EditIcon size={16} />
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(transaction)} className="p-2 rounded-lg hover:bg-red-50 text-sage-400 hover:text-red-500 transition-colors">
            <TrashIcon size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionItem;