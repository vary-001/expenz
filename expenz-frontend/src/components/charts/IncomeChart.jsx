// src/components/charts/IncomeChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-card p-3 border border-sage-100">
        <p className="text-xs font-roboto text-sage-500">{label}</p>
        <p className="text-sm font-roboto font-bold text-gradient-forest">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const IncomeChart = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eae2" vertical={false} />
        <XAxis dataKey="source" tick={{ fontSize: 11, fontFamily: 'Roboto', fill: '#7a8466' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'Roboto', fill: '#7a8466' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={800}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a9f7e" />
              <stop offset="100%" stopColor="#2d6a50" />
            </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeChart;