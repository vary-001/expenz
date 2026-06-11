// src/components/budget/BudgetCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';

const BudgetCard = ({ budget, onEdit, onDelete, index = 0 }) => {
  const { t } = useTranslation();
  const percentage = budget.percentageUsed || 0;
  const isOver = budget.isOverBudget;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className="card-base p-5 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getCategoryColor(budget.category) }}
          />
          <span className="font-poppins font-semibold text-sm text-forest-800 dark:text-forest-100 capitalize">
            {budget.category}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/40 text-sage-400 dark:text-sage-300 hover:text-forest-600 dark:hover:text-forest-200"
          >
            <EditIcon size={14} />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-sage-400 dark:text-sage-300 hover:text-red-500"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="font-inter text-xs text-sage-500 dark:text-sage-400">
          {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
        </span>
        <span className={`font-inter font-semibold text-xs ${isOver ? 'text-red-500' : 'text-forest-600 dark:text-forest-300'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      <div className="w-full h-2.5 bg-sage-100 dark:bg-surface-border-dark rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isOver
              ? 'bg-gradient-to-r from-orange-400 to-red-500'
              : 'bg-gradient-to-r from-forest-400 to-forest-600'
          }`}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className={`font-inter text-xs font-medium ${isOver ? 'text-red-500' : 'text-forest-600 dark:text-forest-300'}`}>
          {isOver ? t('budget.overBudget') : `${formatCurrency(budget.remaining)} left`}
        </span>
        {budget.incomeSource && (
          <span className="font-inter text-[10px] text-sage-400 dark:text-sage-500">
            from {budget.incomeSource}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default BudgetCard;