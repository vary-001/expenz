// src/components/reports/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const StatCard = ({ label, value, secondary, color = 'forest', icon: Icon, index = 0, isCurrency = true }) => {
  const colors = {
    forest: 'from-forest-500 to-forest-700',
    emerald: 'from-emerald-400 to-emerald-600',
    orange: 'from-orange-400 to-red-500',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="card-base p-4 relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${colors[color]} opacity-10`} />
      {Icon && (
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} inline-block mb-2`}>
          <Icon size={16} className="text-white" />
        </div>
      )}
      <p className="font-inter text-xs text-sage-500 dark:text-sage-400 mb-1">{label}</p>
      <p className="font-poppins font-bold text-lg text-forest-900 dark:text-forest-50 tabular-nums leading-tight">
        {isCurrency ? formatCurrency(value) : value}
      </p>
      {secondary && (
        <p className="font-inter text-[10px] text-sage-400 dark:text-sage-500 mt-1">{secondary}</p>
      )}
    </motion.div>
  );
};

export default StatCard;