// src/components/budget/BudgetList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import BudgetProgress from './BudgetProgress';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';
import EditIcon from '../../assets/svgs/EditIcon';
import TrashIcon from '../../assets/svgs/TrashIcon';
import EmptyState from '../common/EmptyState';

const BudgetList = ({ budgets = [], onEdit, onDelete, emptyAction }) => {
  if (!budgets.length) {
    return (
      <EmptyState
        title="No budgets set"
        description="Create budget limits for your spending categories to stay on track."
        actionLabel="Create Budget"
        onAction={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {budgets.map((b, i) => (
        <motion.div
          key={b._id || i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card-forest group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(b.category) }}
              />
              <span className="text-sm font-roboto font-bold text-forest-800 capitalize">{b.category}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg hover:bg-forest-50 text-sage-400 hover:text-forest-600">
                <EditIcon size={14} />
              </button>
              <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg hover:bg-red-50 text-sage-400 hover:text-red-500">
                <TrashIcon size={14} />
              </button>
            </div>
          </div>
          <BudgetProgress budget={b.amount} spent={b.spent || 0} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-roboto text-sage-400 capitalize">{b.period}</span>
            <span className="text-xs font-roboto text-forest-600 font-medium">
              {formatCurrency(Math.max(b.amount - (b.spent || 0), 0))} left
            </span>
          </div>
          {b.incomeSource && (
            <p className="text-[10px] font-roboto text-sage-400 mt-2">Funded by: {b.incomeSource}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BudgetList;