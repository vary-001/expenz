// src/components/income/IncomeItem.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/formatters';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import TrendUpIcon from '../../assets/svgs/TrendUpIcon';

const IncomeItem = ({ income, onEdit, onDelete, index = 0 }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
    transition={{ delay: index * 0.03 }}
    className="flex items-center gap-4 p-4 rounded-xl card-base hover:shadow-card-hover group"
  >
    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
      <TrendUpIcon size={20} className="text-forest-500 dark:text-forest-300" />
    </div>

    <div className="flex-1 min-w-0">
      <p className="font-inter font-semibold text-sm text-forest-800 dark:text-forest-100 truncate">
        {income.source}
      </p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span
          className="font-inter font-medium text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md"
          style={{ backgroundColor: getCategoryColor(income.category) + '25', color: getCategoryColor(income.category) }}
        >
          {income.category}
        </span>
        <span className="font-inter text-xs text-sage-500 dark:text-sage-400">
          {formatDate(income.date)}
        </span>
        {income.description && (
          <span className="font-inter text-xs text-sage-400 dark:text-sage-500 italic truncate">
            {income.description}
          </span>
        )}
      </div>
    </div>

    <p className="money text-base text-forest-600 dark:text-forest-300 whitespace-nowrap">
      +{formatCurrency(income.amount)}
    </p>

    <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(income)}
        className="p-2 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40 text-sage-400 dark:text-sage-300 hover:text-forest-600 dark:hover:text-forest-200 transition-colors"
      >
        <EditIcon size={16} />
      </button>
      <button
        onClick={() => onDelete(income)}
        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-sage-400 dark:text-sage-300 hover:text-red-500 transition-colors"
      >
        <TrashIcon size={16} />
      </button>
    </div>
  </motion.div>
);

export default IncomeItem;