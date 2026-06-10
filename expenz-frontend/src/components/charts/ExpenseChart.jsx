// src/components/charts/ExpenseChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, getCategoryColor } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-card p-3 border border-sage-100">
        <p className="text-xs font-roboto font-medium text-forest-800">{payload[0].name}</p>
        <p className="text-sm font-roboto font-bold text-gradient-forest">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const ExpenseChart = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="amount"
          nameKey="category"
          animationBegin={0}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={getCategoryColor(entry.category)} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;