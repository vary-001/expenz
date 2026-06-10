// src/components/charts/BudgetChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-card p-3 border border-sage-100">
        <p className="text-xs font-roboto text-sage-500 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-roboto" style={{ color: p.color }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BudgetChart = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e8eae2" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11, fontFamily: 'Roboto', fill: '#7a8466' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontFamily: 'Roboto', fill: '#7a8466' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'Roboto' }} />
        <Bar dataKey="budgeted" name="Budgeted" fill="#b5d9c6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="spent" name="Spent" fill="#2d6a50" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;