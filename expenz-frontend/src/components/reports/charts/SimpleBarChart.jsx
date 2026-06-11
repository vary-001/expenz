// src/components/reports/charts/SimpleBarChart.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Horizontal bar chart for budget vs actual
 */
const SimpleBarChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <p className="font-inter text-sm text-center py-12 text-sage-400 dark:text-sage-500">
        No budget data available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const percentage = item.percentageUsed || 0;
        const isOver = item.status === 'over';
        const isWarning = item.status === 'warning';

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-inter font-medium text-sm text-forest-800 dark:text-forest-100 capitalize">
                {item.category}
              </span>
              <span className={`font-inter text-xs font-semibold ${
                isOver ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-forest-600 dark:text-forest-300'
              }`}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="relative h-7 bg-sage-100 dark:bg-surface-border-dark rounded-lg overflow-hidden">
              {/* Budget marker (100%) line */}
              <div className="absolute inset-y-0 right-0 w-0.5 bg-sage-300 dark:bg-sage-600 z-10" />

              {/* Actual bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                className={`h-full rounded-lg ${
                  isOver
                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                    : isWarning
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                    : 'bg-gradient-to-r from-forest-400 to-forest-600'
                }`}
              />

              {/* Overflow indicator */}
              {isOver && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage - 100, 50)}%` }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute top-0 right-0 h-full bg-red-600 opacity-70 rounded-r-lg"
                />
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-inter text-[11px] text-sage-500 dark:text-sage-400 tabular-nums">
                {formatCurrency(item.spent)} of {formatCurrency(item.budgeted)}
              </span>
              <span className={`font-inter text-[11px] tabular-nums ${isOver ? 'text-red-500' : 'text-sage-500 dark:text-sage-400'}`}>
                {isOver ? `Over by ${formatCurrency(Math.abs(item.remaining))}` : `${formatCurrency(item.remaining)} left`}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SimpleBarChart;