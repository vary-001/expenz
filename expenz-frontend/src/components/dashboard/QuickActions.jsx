// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PlusIcon from '../../assets/svgs/PlusIcon';
import ReportIcon from '../../assets/svgs/ReportIcon';
import BudgetIcon from '../../assets/svgs/BudgetIcon';
import IncomeIcon from '../../assets/svgs/IncomeIcon';

const actions = [
  { label: 'Add Expense', path: '/expenses', icon: PlusIcon, bg: 'bg-orange-50', color: 'text-orange-600' },
  { label: 'Add Income', path: '/income', icon: IncomeIcon, bg: 'bg-forest-50', color: 'text-forest-600' },
  { label: 'Set Budget', path: '/budget', icon: BudgetIcon, bg: 'bg-sage-50', color: 'text-sage-700' },
  { label: 'View Reports', path: '/reports', icon: ReportIcon, bg: 'bg-forest-50', color: 'text-forest-700' },
];

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ label, path, icon: Icon, bg, color }, i) => (
        <motion.button
          key={label}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => navigate(path)}
          className={`${bg} ${color} p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md group`}
        >
          <Icon size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-roboto font-medium">{label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;