// src/components/reports/charts/SimplePieChart.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, getCategoryColor } from '../../../utils/formatters';

/**
 * Lightweight SVG donut chart (no external library)
 */
const SimplePieChart = ({ data = [], size = 220, strokeWidth = 32 }) => {
  if (!data.length) return null;

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="stroke-sage-100 dark:stroke-surface-border-dark"
            strokeWidth={strokeWidth}
          />
          {/* Data segments */}
          {data.map((item, i) => {
            const percent = item.amount / total;
            const offset = circumference * (1 - cumulativePercent);
            const dash = circumference * percent;
            cumulativePercent += percent;

            return (
              <motion.circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={getCategoryColor(item.category || item.source)}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-circumference * (cumulativePercent - percent)}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dash} ${circumference}` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-inter text-xs text-sage-500 dark:text-sage-400">Total</p>
          <p className="font-poppins font-bold text-lg text-forest-900 dark:text-forest-50 tabular-nums">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full sm:w-auto">
        {data.slice(0, 6).map((item, i) => {
          const label = item.category || item.source;
          const color = getCategoryColor(label);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-forest-50/50 dark:hover:bg-forest-900/20 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="font-inter text-sm text-forest-700 dark:text-forest-200 capitalize truncate">
                  {label}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="money text-sm text-forest-800 dark:text-forest-100">
                  {formatCurrency(item.amount)}
                </p>
                <p className="font-inter text-[10px] text-sage-500 dark:text-sage-400">
                  {item.percentage?.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SimplePieChart;