// src/components/reports/charts/SimpleTrendChart.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Lightweight SVG line chart for daily income/expense trend
 */
const SimpleTrendChart = ({ data = [], height = 200 }) => {
  const chartData = useMemo(() => {
    if (!data.length) return null;

    const width = 600;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const allValues = data.flatMap((d) => [d.expense, d.income]);
    const max = Math.max(...allValues, 1);

    const xStep = innerW / Math.max(data.length - 1, 1);

    const expensePoints = data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + innerH - (d.expense / max) * innerH,
      value: d.expense,
      date: d.date,
    }));

    const incomePoints = data.map((d, i) => ({
      x: padding.left + i * xStep,
      y: padding.top + innerH - (d.income / max) * innerH,
      value: d.income,
      date: d.date,
    }));

    const expensePath = expensePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const incomePath = incomePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const expenseArea = `${expensePath} L ${expensePoints[expensePoints.length - 1].x} ${padding.top + innerH} L ${expensePoints[0].x} ${padding.top + innerH} Z`;
    const incomeArea = `${incomePath} L ${incomePoints[incomePoints.length - 1].x} ${padding.top + innerH} L ${incomePoints[0].x} ${padding.top + innerH} Z`;

    return { width, padding, innerH, max, expensePoints, incomePoints, expensePath, incomePath, expenseArea, incomeArea };
  }, [data, height]);

  if (!chartData) {
    return (
      <p className="font-inter text-sm text-center py-12 text-sage-400 dark:text-sage-500">
        No trend data available
      </p>
    );
  }

  const { width, padding, innerH, max, expensePoints, incomePoints, expensePath, incomePath, expenseArea, incomeArea } = chartData;

  // Y-axis labels (3 levels)
  const yLabels = [0, max / 2, max];

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 justify-end">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-forest-500" />
          <span className="font-inter text-xs text-sage-600 dark:text-sage-300">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-500" />
          <span className="font-inter text-xs text-sage-600 dark:text-sage-300">Expense</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '500px' }}>
          {/* Gradients */}
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d8365" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3d8365" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis gridlines + labels */}
          {yLabels.map((val, i) => {
            const y = padding.top + innerH - (val / max) * innerH;
            return (
              <g key={i}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y}
                      className="stroke-sage-100 dark:stroke-surface-border-dark" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end"
                      className="fill-sage-500 dark:fill-sage-400 font-inter" fontSize="10">
                  {formatCurrency(val).split('.')[0]}
                </text>
              </g>
            );
          })}

          {/* Areas */}
          <motion.path
            d={incomeArea}
            fill="url(#incomeGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          <motion.path
            d={expenseArea}
            fill="url(#expenseGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* Lines */}
          <motion.path
            d={incomePath}
            fill="none"
            stroke="#3d8365"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <motion.path
            d={expensePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />

          {/* Data points */}
          {incomePoints.map((p, i) => (
            <motion.circle
              key={`i-${i}`} cx={p.x} cy={p.y} r="3" fill="#3d8365"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.02 }}
            />
          ))}
          {expensePoints.map((p, i) => (
            <motion.circle
              key={`e-${i}`} cx={p.x} cy={p.y} r="3" fill="#f97316"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.02 }}
            />
          ))}

          {/* X-axis labels (show every nth) */}
          {data.map((d, i) => {
            const shouldShow = data.length <= 10 || i % Math.ceil(data.length / 8) === 0 || i === data.length - 1;
            if (!shouldShow) return null;
            const x = padding.left + i * (chartData.innerH ? (width - padding.left - padding.right) / Math.max(data.length - 1, 1) : 0);
            const date = new Date(d.date);
            return (
              <text
                key={`x-${i}`}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-sage-500 dark:fill-sage-400 font-inter"
                fontSize="9"
              >
                {date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default SimpleTrendChart;