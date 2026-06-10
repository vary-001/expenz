// src/components/budget/BudgetProgress.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const BudgetProgress = ({ budget, spent }) => {
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-roboto text-sage-500">
          {formatCurrency(spent)} of {formatCurrency(budget)}
        </span>
        <span className={`text-xs font-roboto font-bold ${isOver ? 'text-red-500' : 'text-forest-600'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-sage-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isOver ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-forest-400 to-forest-600'}`}
        />
      </div>
    </div>
  );
};

export default BudgetProgress;